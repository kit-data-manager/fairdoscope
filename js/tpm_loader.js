class TPMLoader {
    constructor() {
    }

    get keyFieldName(){
        return "key";
    }

    get valueFieldName(){
        return "value";
    }

     get valuesFieldName(){
        return "record";
    }

     configureTableForReload(table, pid){
         let ajaxConfig = {
             method: "GET",
             headers: {
                 "Accept": 'application/vnd.datamanager.pid.simple+json',
             }
         };
        return  table.setData("http://localhost:8090/api/v1/pit/pid/" + pid, {}, ajaxConfig);
    }

    checkForFDO(pid){
        let response = {
            "isFairDO": false
        };
        $.ajax({
            url: "http://localhost:8090/api/v1/pit/pid/" + pid,
            async: false,
            headers:{"Accept":"application/vnd.datamanager.pid.simple+json"},
            success: function (json, status) {
                let o = JSON.parse(json);
                for(let i=0;i<o.record.length;i++){
                    if (o.record[i].key === "21.T11148/076759916209e5d62bd5") {
                        //has profile property, is FAIR DO
                        response.profilePid = o.record[i].value;
                        response.isFairDO = true;
                    }
                }
            }
        });
        return response;
    }
};
