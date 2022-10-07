function ArcGraph({
                        nodes, // an iterable of node objects (typically [{id}, …])
                        links // an iterable of link objects (typically [{source, target}, …])
                    }, {
                        nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
                        nodeGroup, // given d in nodes, returns an (ordinal) value for color
                        nodeGroups, // an array of ordinal values representing the node groups
                        nodeTitle, // given d in nodes, a title string
                        nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
                        nodeStroke = "#fff", // node stroke color
                        nodeStrokeWidth = 1.5, // node stroke width, in pixels
                        nodeStrokeOpacity = 1, // node stroke opacity
                        nodeRadius = 5, // node radius, in pixels
                        nodeStrength = -100,
                        linkSource = ({source}) => source, // given d in links, returns a node identifier string
                        linkTarget = ({target}) => target, // given d in links, returns a node identifier string
                        linkStroke = "#999", // link stroke color
                        linkStrokeOpacity = 0.6, // link stroke opacity
                        linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
                        linkStrokeLinecap = "round", // link stroke linecap
                        linkStrength = .005,
                        colors = d3.schemeTableau10, // an array of color strings, for the node groups
                        width = 640, // outer width, in pixels
                        height = 400, // outer height, in pixels
                        invalidation // when this promise resolves, stop the simulation
                    } = {}) {
    const L = data.links.map(d => Object.create(d));
    const N = data.nodes.map(intern);
    const TT = d3.map(links, ({type}) => type).map(intern);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup);
    const profs = Array.from(new Set(G));

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    const types = Array.from(new Set(links.map(d => d.type)));
    let color = d3.scaleOrdinal(types, d3.schemeCategory10);
    const simulation = d3.forceSimulation(N)
        .force("link", d3.forceLink(L).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    let drag = simulation => {

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    const svg = d3.select("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .style("font", "12px sans-serif");


    var tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    var mouseover = function(d) {
        tooltip
            .style("opacity", 1)
            .style("position", "absolute")
            .style("z-index", "100");
    }

    var mousemove = function(d) {
        console.log(this.__data__);
        tooltip
            .html("PID: " + this.__data__.id + "<br>Profile:" + this.__data__.profile)
            .style("left", d.screenX + "px")
            .style("top", d.screenY + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(types)
        .join("marker")
        .attr("id", d => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M0,-5L10,0L0,5");

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(L)
        .join("path")
        .attr("stroke", d => color(d.type))
        .attr("type", d => d.type)
        .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

    const node = svg.append("g")
        .attr("fill", "currentColor")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("circle")
        .data(N)
        .join("circle")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("r", function(d){
            if(d.id == pid) {
                return 8;
            }
            return nodeRadius;
        })
        .call(drag(simulation))
        .on("click", function(){
            svg.selectAll("circle").each(function () {
                let elem = d3.select(this);
                    elem.transition()
                        .attr('r', nodeRadius);
            });

            let elem = d3.select(this);
                elem.transition()
                    .attr('r', 8);

            resolveFDO(elem.data()[0].id);
        });
        //tooltip if needed
        /*.on("mouseover", mouseover )
        .on("mousemove", mousemove )
        .on("mouseleave", mouseleave );*/

    svg.call(d3.zoom()
        .extent([[-width / 2, -height / 2], [width, height]])
        .scaleExtent([0, 8])
        .on("zoom", zoomed));


    node.attr("fill", ({index: i}) => {
        if(profiles.get(G[i])){
            return profiles.get(G[i]).color;
        }else{
            return "#FF0000";
        }
    });

    function zoomed({transform}) {
        link.attr("transform", transform);
        node.attr("transform", transform);
    }

    simulation.on("tick", () => {
        link.attr("d", linkArc);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
    }

// Add one dot in the legend for each name.
    svg.selectAll("typeDots")
        .data(types)
        .enter()
        .append("circle")
        .attr("cx", -width / 2 + 10)
        .attr("cy", function(d,i){ return -height / 2 + 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)});

// Add one dot in the legend for each name.
    svg.selectAll("typeLabels")
        .data(types)
        .enter()
        .append("text")
        .attr("x", -width / 2 + 30)
        .attr("y", function(d,i){ return -height / 2 + 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    // Add one dot in the legend for each name.
    svg.selectAll("profileDots")
        .data(profs)
        .enter()
        .append("circle")
        .attr("cx", -width / 2 + 210)
        .attr("cy", function(d,i){ return -height / 2 + 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return (profiles.get(d))? profiles.get(d).color : "red"});
        //FDO-of-Profile highlight if needed
        /*.on('mouseover', function(d, i) {
            let selection = this.__data__;
            svg.selectAll("circle").each(function () {
               let elem = d3.select(this);
               if(selection == elem.data()[0].profile){
                   elem.transition()
                       .attr('r', nodeRadius * 2);
               }
              });
        }).on('mouseout', function(d, i) {
        let selection = this.__data__;
        svg.selectAll("circle").each(function () {
            let elem = d3.select(this);
            if(selection == elem.data()[0].profile){
                elem.transition()
                    .attr('r', nodeRadius);
            }
        });
    })*/

// Add one dot in the legend for each name.
    svg.selectAll("profileLabels")
        .data(profs)
        .enter()
        .append("text")
        .attr("x", -width / 2 + 230)
        .attr("y", function(d,i){ return -height / 2 + 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return (profiles.get(d))? profiles.get(d).color : "red"})
        .text(function(d){ return (profiles.get(d))? profiles.get(d).name : d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}
