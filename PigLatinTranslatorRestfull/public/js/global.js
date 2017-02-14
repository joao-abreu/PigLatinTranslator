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