var Model = {
    userName: ko.observable(null),
    name: ko.observable(null),
    email: ko.observable(null),
    password: ko.observable(null),
    passwordConf: ko.observable(null),

    /**
     * Called when the page is loaded
     */
    init: function(){
        var me = Model;
        console.log("init");
        me.verifyUserSession();
        me.startKeyboardListeners();
    },

    /**
     * Starts the keyboard listeners
     */
    startKeyboardListeners: function(){
        var me = Model;
        $('#passwordConf').keypress( function( e ) {
            var code = e.keyCode || e.which;

            if( code === 13 ) {
                e.preventDefault();
                $('#saveChanges').focus();
                me.saveChanges();
            }
        })
    },

    /**
     * Verifies the session user
     */
    verifyUserSession: function(){
        var me = Model;

        Ajax.post(SERVER_CTX_ROOT + ACTIONS.verifyUserSession, {}, function(resp){
            console.log("Verify user: ");
            console.log(resp);
            if(resp.user){
                console.log("Logged user");
                me.userName(resp.user.name);
                me.name(resp.user.name);
                me.email(resp.user.email);
            }
            else{
                console.log("Not logged user");
                Model.userName(null);
                window.location.href = "/home";
            }
        });
    },

    saveChanges: function(){
        var me = Model;

        me.validateForm(function(valid){
            if(valid){
                console.log("Valid form");
                var obj = {
                    name: me.name(),
                    password: me.password()
                }
                Ajax.post(SERVER_CTX_ROOT + ACTIONS.update, obj, function(resp){
                    console.log("Data: " + resp);
                    if(resp && resp.success){
                        Model.userName( me.name() );
                        alert.success("Your data was updated successfully. Redirecting to Home Page");
                        setTimeout(function(){
                            window.location.href = "/home";
                        }, 3000);
                    }
                    else{
                        alert.error("An error has occurred, please try again later");
                    }
                });

            }
            else{
                console.log("Invalid form");
            }
        })
    },

    validateForm: function(cb){
        var me = Model;
        var valid = true;

        if(me.name() == null || me.name() == ""){
            alert.error("The name is required!");
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


}


$( document ).ready(function() {
    ko.applyBindings(Model);

    Model.init();
});
