class HandleLoader {
    constructor() {
    }

    get keyFieldName(){
        return "type";
    }

    get valueFieldName(){
        return "data.value";
    }

    get valuesFieldName(){
        return "values";
    }

    configureTableForReload(table, pid){
        return  table.setData("https://hdl.handle.net/api/handles/" + pid);
    }

    checkForFDO(pid){
        let response = {
            "isFairDO": false
        };
        $.ajax({
            url: "https://hdl.handle.net/api/handles/" + pid,
            async: false,
            success: function (json, status) {
                for(let i=0;i<json.values.length;i++){
                    if (json.values[i].type === "21.T11148/076759916209e5d62bd5") {
                        //has profile property, is FAIR DO
                        response.profilePid = json.values[i].data.value;
                        response.isFairDO = true;
                    }
                }
            }
        });
        return response;
    }
};
