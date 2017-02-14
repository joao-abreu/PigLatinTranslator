var SERVER_CTX_ROOT = "http://localhost/basePhp1/src/actions.php";

var actions = {
	login: "login",
	logout: "logout",
	register: "register",
	verifyUserSession: "verifyUserSession",
	getAllUsers: "getAllUsers",
	getUserByEmail: "getUserByEmail",
	createUser: "create",
	updateUser: "update",
	deleteUser: "delete"
}

var Ajax = {

	post: function(uri, json, cbSuccess, cbError){

		$.post(uri, json, function(data, status){
			console.log("Received ["+data+"]");

			try{
				if(data != null && data != "" && data != undefined){
					var jsonData = $.parseJSON(data);//parse JSON
					//var jsonData = jQuery.parseJSON( data );

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
	},

	fileUpload: function(uri, formData, cbSuccess, cbError, cbComplete){
		$.ajax({
			url: uri,
			type: 'POST',
			data: formData,
			success: function (data) {
				console.log(data);
				if(cbSuccess) cbSuccess();
			},
			cache: false,
			contentType: false,
			processData: false,
			xhr: function() {  // Custom XMLHttpRequest
				var myXhr = $.ajaxSettings.xhr();
				if (myXhr.upload) { // Avalia se tem suporte a propriedade upload
					myXhr.upload.addEventListener('progress', function () {
						/* faz alguma coisa durante o progresso do upload */
					}, false);
				}
				return myXhr;
			}
		});
	}
}


//Timer do contador
var timer;
var inter;

/**
 * Limpa o contador
 */
function clearCountDown(){
	clearTimeout(timer);
}
/**
 * Contagem decrescente
 * @param element_id	o id do elemento que vai receber o contador
 * @param minutes		os minutos a contar
 * @param seconds		os segundos a contar
 */
function countdown( element_id, minutes, seconds )
{
	var element, endTime, hours, mins, msLeft, time;

	function twoDigits( n )
	{
		return (n <= 9 ? "0" + n : n);
	}

	function updateTimer()
	{
		msLeft = endTime - (+new Date);
		if ( msLeft < 1000 ) {
			element.innerHTML = "00:00";
		} else {
			time = new Date( msLeft );
			hours = time.getUTCHours();
			mins = time.getUTCMinutes();
			element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : twoDigits(mins)) + ':' + twoDigits( time.getUTCSeconds() );
			timer = setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
		}
	}

	element = document.getElementById( element_id );
	endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
	updateTimer();
}