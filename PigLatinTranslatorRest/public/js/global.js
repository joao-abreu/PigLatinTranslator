var SERVER_CTX_ROOT = "http://localhost:3000/";

var ACTIONS = {
	login: "login",
	logout: "logout",
	verifyUserSession: "verifyUserSession",
    register: "register",
    registerConfirmation: "registerConfirmation",
    translate: "translate",
    translationsHistory: "history",
    update: "update",
    recoverPassword: "recoverPassword"
}

var ajax = function(options){
    var options = options || {};
    var method = options.method  || 'GET';
    var sync   = options.sync    || false;
    var url    = options.url    || window.location.pathname;
    var done   = options.done   || function(){};
    var fail   = options.fail   || function(){};
    var data   = options.data   || null;
    var type   = options.type   || 'uri';

    try {
        xhr = new XMLHttpRequest();
    } catch ( e ) {
        return fail(e);
    }

    xhr.open(method, url, sync);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            done(xhr);
        }
    };

    var query = '?';
    if (type === 'json') {
        data = JSON.stringify(data);
        xhr.setRequestHeader('Content-type', 'application/json');
    } else if (type === 'uri') {
        for (var key in data) {
            query += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }
    } else {
        fail('Type not supported: ' + type);
    }

    try {
        if (method === 'POST' && type === 'json') {
            xhr.send(url, done, 'POST', data, sync);
        } else if (method === 'POST' && type === 'uri') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.withCredentials
            xhr.send(url, done, 'POST', data, sync);
        } else if (method === 'GET') {
            xhr.send(url + query, done, 'GET', null, sync);
        } else {
            fail('Type not supported: ' + type);
        }
    } catch(err) {
        fail(err);
    };
}

window.ajax = ajax;

/*
 * Ajax call implementation
 */
function makeAJAXCall (uri, requestJson, cbSuccess, cbError) {

	$.ajax({
		url : uri,
		dataType : 'json', // set recieving type - JSON in case of a question
		type : 'GET',//method || 'POST', // set sending HTTP Request type
		async : true,
		data: requestJson,
        contentType: 'application/json: charset=utf-8',
		success : function (data) { // callback method for further manipulations

			if (data.ak == 'true') {
				if (cbSuccess){
					cbSuccess (data);
				}
			}
			else {
				if (cbError){
					cbError (data);
				}
			}
		},
		error : function(data) { // if error occured
			if (cbError) cbError ('Sem Ligação!');
		}

	});
};

var Ajax = {

	post: function(uri, json, cbSuccess, cbError){



		$.post(uri, json, function(data, status){
			console.log("Received ["+data+"]");

			try{
				if(data != null && data != "" && data != undefined){
					//var jsonData = $.parseJSON(data);//parse JSON
					var jsonData = jQuery.parseJSON( data );

					console.log("##############");
					console.log(jsonData);
					console.log("##############");	
				}
				
				
				if(cbSuccess) cbSuccess(jsonData);
			}
			catch(err){
				console.log(err);
				if(cbError) cbError(err);
			}
	    });
	}
}

var alert = {
    success: function(text){
        $('#successText').text(text);
        $('.alert-success').removeClass('hiddenDiv');
        setTimeout(function(){
            $('.alert-success').addClass('hiddenDiv');
        }, 5000);
    },
    info: function(text){
        $('#infoText').text(text);
        $('.alert-info').removeClass('hiddenDiv');
        setTimeout(function(){
            $('.alert-info').addClass('hiddenDiv');
        }, 5000);
    },
    warning: function(text){
        $('#warningText').text(text);
        $('.alert-warning').removeClass('hiddenDiv');
        setTimeout(function(){
            $('.alert-warning').addClass('hiddenDiv');
        }, 5000);
    },
    error: function(text){
        $('#errorText').text(text);
        $('.alert-danger').removeClass('hiddenDiv');
        setTimeout(function(){
            $('.alert-danger').addClass('hiddenDiv');
        }, 5000);
    }
}