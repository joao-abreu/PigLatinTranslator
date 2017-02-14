// Model for index.html page
var Model = {
	translations: ko.observableArray(),
	showLoggedMenu: ko.observable(false),
	showNotLoggedMenu: ko.observable(true),
	showHistory: ko.observable(false),
	userName: ko.observable(null),
	user: null,
	token: ko.observable(null),
	/**
	 * Called when the page is loaded
	 */
	init: function(){
		var me = Model;


		console.log("init");
		if(window.location.href.match(/home\?t=/)){
			var t = me.getParam('t');
			console.log("token response");
			console.log(t);
			localStorage.PigLatinToken = t;

			window.history.pushState('Home', 'Home', '/home');
		}

		me.getToken();
		me.verifyUserSession();
		me.form.getTranslationsHistory();
		me.startKeyboardListeners();
	},

	getParam: function(name){
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	},

	getToken: function(){
		Model.token(localStorage.PigLatinToken);
	},

	startKeyboardListeners: function(){
		var me = Model.form;
		//translation
		$('#inputText').keypress( function( e ) {
			var code = e.keyCode || e.which;

			if( code === 13 ) {
				e.preventDefault();
				$('#translateBtn').focus();
				me.translate();
				$('#inputText').focus();
			}
		})

		//login
		$('#password').keypress( function( e ) {
			var code = e.keyCode || e.which;

			if( code === 13 ) {
				e.preventDefault();
				$('#loginBtn').focus();
				me.login();
			}
		})
	},

	/**
	 * Verifies the session user
	 */
	verifyUserSession: function(){
		var me = Model.form;

		Ajax.post(SERVER_CTX_ROOT + ACTIONS.verifyUserSession, {token: Model.token()}, function(resp){
			console.log("Data#### Init: ");
			console.log(resp);
			if(resp.user){
				console.log("Logged user");
				Model.user = resp.user;
				Model.userName(resp.user.name);

				Model.showLoggedMenu(true);
				Model.showNotLoggedMenu(false);
			}
			else{
				console.log("Not logged user");
				Model.showLoggedMenu(false);
				Model.showNotLoggedMenu(true);
				Model.user = null;
				Model.userName(null);
			}
		});
	},
	form: {
		email: ko.observable(null),
		password: ko.observable(null),
		passwordConf: ko.observable(null),
		name: ko.observable(null),
		inputtext: ko.observable(null),
		pigLatinText: ko.observable(null),


		clearRegisterForm: function () {
			var me = Model.form;

			me.email(null);
			me.password(null);
			me.passwordConf(null);
			me.name(null);
		},


		/**
		 * Registers the user
		 */
		register: function(){
			var me = Model.form;
			console.log("A submeter");

			var obj = {
				email: me.email(),
				password: me.password(),
				name: me.name(),
			}

			//validates the password
			me.validateRegister(function(valid){
				if(valid){
					Ajax.post(SERVER_CTX_ROOT + ACTIONS.register, obj, function(resp){
						console.log("Data: " + resp);
						if(resp && resp.success){
							alert.success("Please check your email. The confirmation link is valid for 24 hours.");
							Model.hideRegister();
						}
						else{
							if(resp.code == 401){
								alert.error("This account already exists. If you forgot your password, please recover it in the Login form.");
							}
							else{
								alert.error("An error has occurred, please try again later");
							}
						}
					});
				}
			});
		},

		validateRegister: function(cb){
			var me = Model.form;
			var valid = true;

			if(me.name() == null || me.name() == ""){
				alert.error("The name is required!");
				valid = false;
				return;
			}

			var re = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
			if(!re.test(me.email())){
				alert.error("Valid email is required!");
				valid = false;
				return;
			}

			if(me.password() != null && me.password() != ""){
				if(me.password() != me.passwordConf()){
					valid = false;
					alert.error("The password and the password confirmation are differents!");
					return;
				}
			}
			else{
				valid = false;
				alert.error("The password is required!");
				return;
			}



			if(cb) cb(valid);
		},

		/**
		 * Process the login
		 */
		login: function(){
			var me = Model.form;
			console.log("A submeter");
			var obj = {
				email: me.email(),
				password: me.password(),
			}


			Ajax.post(SERVER_CTX_ROOT + ACTIONS.login, obj, function(resp){
				console.log("Login Data: ");
				console.log(resp);
				if(resp && resp.user){
					Model.user = resp.user;
					Model.userName(resp.user.name);

					Model.showLoggedMenu(true);
					Model.showNotLoggedMenu(false);

					Model.token(resp.user.token);
					localStorage.PigLatinToken = resp.user.token;

					Model.hideLogin();
				}
				else{
					alert.error("Invalid login!");
				}
			});
		},


		/**
		 * Process the translation to Pig Latin
		 */
		translate: function(){
			var me = Model.form;
			var obj = {
				token: Model.token(),
				text: me.inputtext()
			}

			if(Model.user){
				if(me.inputtext() && me.inputtext() != ""){
					Ajax.post(SERVER_CTX_ROOT + ACTIONS.translate, obj, function(resp){
						if(resp && resp.success){
							console.log("translated Data: ");
							console.log( resp.text );
							me.pigLatinText( resp.text );
							me.getTranslationsHistory();
						}
						else{
							if(resp.code == 401){
								alert.info("You need to login to use this feature!");
								Model.showLogin();
							}
						}

					});
				}
				else{
					alert.warning("You need to type some text to be translated!");
				}
			}
			else{
				alert.info("You need to login to use this feature!");
				Model.showLogin();
			}


		},

		/**
		 * Clears the translation text areas
		 */
		clearTrasnlation: function(){
			var me = Model.form;

			if(me.inputtext() || me.pigLatinText()){
				me.inputtext(null);
				me.pigLatinText(null);
			}
			else{
				alert.warning("Come on!!!You know that there is nothing to be cleared!!");
			}
		},

		/**
		 * Process the translations history
		 */
		getTranslationsHistory: function(){
			var me = Model;

			//Clears the array
			me.translations.removeAll();

			console.log("getTranslationsHistory...");
			$.get(SERVER_CTX_ROOT + ACTIONS.translationsHistory, function(data, status){
				var jsonData = jQuery.parseJSON( data );
				console.log("Traduções");
				console.log(jsonData);

				$.each( jsonData.translations, function( i, translation ){
					console.log(translation);
					me.translations.push(translation);
				});

			});
			me.showHistory(true);
		},

		recoverPassword: function(){
			var me = Model.form;

			if(me.email() != ""){


				Ajax.post(SERVER_CTX_ROOT + ACTIONS.recoverPassword, {email: me.email()}, function(resp){
					if(resp && resp.success){
						console.log("Recover Data: ");
						console.log( resp );

						alert.success("The recover link was sent to your email. ");
						Model.hideLogin();
					}
					else{
						alert.error("A valid email is required!");
					}

				});
			}
			else{
				alert.error("Please insert a valid email!");
			}

		}

	},
	/**
	 * Opens the login modal
	 */
	showLogin: function(){
		$('#login').modal('show');
		//$('#myModal').modal('hide');
	},
	/**
	 * Closes the login modal
	 */
	hideLogin: function(){
		$('#login').modal('hide');
	},
	/**
	 * Opens the login modal
	 */
	showRegister: function(){
		Model.form.clearRegisterForm();
		$('#register').modal('show');
	},
	/**
	 * Closes the login modal
	 */
	hideRegister: function(){
		$('#register').modal('hide');
	}

}

$( document ).ready(function() {
	ko.applyBindings(Model);

	Model.init();
});



