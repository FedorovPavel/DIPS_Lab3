module.exports = {
    getCar : function(id, callback){
        const host      = 'http://127.0.0.1:3004'
        const url       = host+'/catalog/get_car/' + id;
        const options   = createOptions(url, 'GET');
        createAndSendGetHttpRequest(url, options,null,function(err, status, response){
            if(err)       
                callback(err, status, response);
            else {
                if (response){
                    const object = JSON.parse(response);
                    callback(err, status, object);
                } else {
                    callback(err, status, null);
                }
            }
        });
    },
    createBilling : function(data, callback){
        const host      = 'http://127.0.0.1:3003';
        const url       = host + '/billings/createBilling';
        const options   = createOptions(url, 'PUT');
        createAndSendHttpPutWithFormRequest(url, options, data, function(err, status, response){
            if(err)       
                callback(err, status, response);
            else {
                if (status.statusCode == 200){
                    if (response){
                        const object = JSON.parse(response);
                        callback(err, status.statusCode, object);
                    } else {
                        callback(err, status.statusCode, null);
                    }
                } else {
                    callback(response, status.statusCode, null);
                }
            }
        });
    },
    getBilling : function(id, callback){
        const host      = 'http://127.0.0.1:3003';
        const url       = host + '/billings/getBilling/'+id;
        const options   = createOptions(url, 'GET');
        createAndSendGetHttpRequest(url, options,null, function(err, status, response){
            if(err)       
                callback(err, status, response);
            else {
                if (status == 200){
                    if (response){
                        const object = JSON.parse(response);
                        callback(err, status, object);
                    } else {
                        callback(err, status, null);
                    }
                } else {
                    callback(response, status, null);
                }
            }
        });
    }
}
function createAndSendHttpPutWithFormRequest(uri, options , data, callback){
    const request = require('request');
    request.put(options.url,options, function(errors, response, body){
        if (errors){
            callback(err, null, null);
        } else {
            callback(null, response, body);
        }
    }).form(data);
}

function createAndSendGetHttpRequest(uri, options, data, callback){
    const request = require('request');
    request.get(uri, options, function(errors, response, body){
        if(errors) {
            callback(errors, null, null);
        } else {
            callback(null, response.statusCode, body);
        }
    });
}

function createOptions(uri, method){
    let item = {
        method  : method,
        uri     : uri,
    };
    return item;
}