function renderUrl(type,value){
    return "<a href='" + value + "' target='_blank'>" + value + "</a>";
}

function renderHdl(type,value){

    let isType = false;
    let isFairDO = false;
    let profilePid = null;

    $.ajax({
        url: "https://hdl.handle.net/api/handles/" + value,
        async: false,
        success: function (json, status) {
            for(let i=0;i<json.values.length;i++){
                if (json.values[i].type === "21.T11148/076759916209e5d62bd5") {
                    //has profile property, is FAIR DO
                    profilePid = json.values[i].data.value;
                    isFairDO = true;
                    break;
                }else if(json.values[i].type === "0.TYPE/DOIPService"){
                    isType = true;
                    break;
                }
            }
       }
    });

    if(isType){
        //TODO: Check if alternate location (view=ui) can be adressed instead of hardcoded link to GWDG
        return "<a href='https://dtr-test.pidconsortium.eu/#objects/" + value + "' target='_blank'>" + value + "</a>";
    }else if(isFairDO) {
        addChildFdo(type, value, profilePid, pid);
        return "<a href='#' onClick=resolveFDO(\'" + value + "\')>" + value + "&nbsp;<i class=\"fa-solid fa-arrows-rotate\"></i></a>";
    }
}

function renderText(type, value){
    return value;
}

function renderObject(type,value){
    let obj = JSON.parse(value);
    //TODO: Check id...currently, obtained value is https://hdl.handle.net/21...
    //obj.id.substr(obj.id.lastIndexOf(".net/") + 5)
    return renderUrl(obj.id);
}

let dataTypes = new Map();
//HelmholtzKIP
dataTypes.set("21.T11148/076759916209e5d62bd5", {'name': 'kernelInformationProfile', 'class':'fa-solid fa-table-list', 'renderer': renderHdl});
dataTypes.set("21.T11148/397d831aa3a9d18eb52c", {'name': 'dateModified', 'class':'fa-solid fa-file-pen', 'renderer': renderText});
dataTypes.set("21.T11148/82e2503c49209e987740", {'name': 'checksum', 'class':'fa-solid fa-hashtag', 'renderer': renderText});
dataTypes.set("21.T11148/29f92bd203dd3eaa5a1f", {'name': 'dateCreated', 'class':'fa-solid fa-file-circle-plus', 'renderer': renderText});
dataTypes.set("21.T11148/b8457812905b83046284", {'name': 'digitalObjectLocation', 'class':'fa-solid fa-location-dot', 'renderer': renderUrl});
dataTypes.set("21.T11148/c692273deb2772da307f", {'name': 'version', 'class':'fa-solid fa-timeline', 'renderer': renderText});
dataTypes.set("21.T11148/1c699a5d1b4ad3ba4956", {'name': 'digitalObjectType', 'class':'fa-solid fa-file-image', 'renderer': renderHdl});
dataTypes.set("21.T11148/2f314c8fe5fb6a0063a8", {'name': 'licenseUrl', 'class':'fa-solid fa-closed-captioning', 'renderer': renderUrl});
dataTypes.set("21.T11148/d0773859091aeb451528", {'name': 'hasMetadata', 'class':'fa-solid fa-file-import', 'renderer': renderHdl});
dataTypes.set("21.T11148/4fe7cde52629b61e3b82", {'name': 'isMetadataFor', 'class':'fa-solid fa-file-export', 'renderer': renderHdl});
dataTypes.set("21.T11148/1a73af9e7ae00182733b", {'name': 'contact', 'class':'fa-solid fa-address-card', 'renderer': renderUrl});
//AI
dataTypes.set("21.T11148/59071da0d09ae46f1126", {'name': 'label', 'class':'fa-solid fa-tag', 'renderer': renderText});
dataTypes.set("21.T11148/bca3915764ce207253f5", {'name': 'imageFormat', 'class':'fa-solid fa-image', 'renderer': renderText});
dataTypes.set("21.T11148/49330041ca5fddf9af92", {'name': 'schemaLocation', 'class':'fa-solid fa-file-circle-exclamation', 'renderer': renderUrl});

//BIO
dataTypes.set("pid", {'name': 'pid', 'class':'fa-solid fa-fingerprint', 'renderer': renderUrl});
dataTypes.set("pidIssuer", {'name': 'pidIssuer', 'class':'fa-solid fa-address-card', 'renderer': renderObject});
dataTypes.set("pidKernelMetadataLicense", {'name': 'pidKernelMetadataLicense', 'class':'fa-solid fa-closed-captioning', 'renderer': renderUrl});
dataTypes.set("digitalObjectType", {'name': 'digitalObjectType', 'class':'fa-solid fa-file-image', 'renderer': renderObject});
dataTypes.set("digitalObjectSubtype", {'name': 'digitalObjectSubtype', 'class':'fa-solid fa-file-image', 'renderer': renderObject});

let profiles = new Map();
//Helmholtz KIP
profiles.set("21.T11148/b9b76f887845e32d29f7", {"name": "HelmholtzKIP", "color": "#ee7222", "icon": "\u0048"});
//Helmholtz KIP annotation
profiles.set("21.T11148/828b74888f3774d97f73", {"name": "HelmholtzKIP for Annotation", "color": "#ffa222", "icon": "\uf02b"});
//Helmholtz KIP MultiType
profiles.set("21.T11148/863d938d632b53d62d52", {"name": "HelmholtzKIP for Multitype", "color": "#ffb266", "icon": "\uf126"});
//Image Type
profiles.set("21.T11148/0e76292794888d4f1fa7", {"name": "Image", "color": "#00ff66", "icon": "\uf03e"});
//JSON File
profiles.set("21.T11148/91cc47c47bbd1eb8b943", {"name": "JSON", "color": "#aaff66", "icon": "\uf1c9"});
//File
profiles.set("21.T11148/2c3cafa4db3f3e1e51b3", {"name": "File", "color": "#aadd99", "icon": "\uf15b"});


