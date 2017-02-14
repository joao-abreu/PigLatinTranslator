var express		=	require('express');
var session		=	require('express-session');
var bodyParser  = 	require('body-parser');
var app			=	express();
var path 		= 	require('path');
var mailer = require('mailer');
var process 	= 	require('./routes/process.js');

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'JHFAStasaytYR45&%&asfa',saveUninitialized: true,resave: false}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));



var sess;
const IS_DEV = false;
var users = [{name:"Joao Abreu", email: "joao@teste.pt", password: "MTIz"}]; // save the active users in memory
var tmpUsers = []; // save the temporary users in memory
var translations = []; //Save the history of translations
var recoverPassUsers = [];


//Redirects
app.get('/home',function(req,res){
	res.render('home.html');
});
app.get('/myAccount',function(req,res){
    res.render('myAccount.html');
});
app.get('/',function(req,res){
	res.render('home.html');
});
////

/**
 * Initializes the password rcovery process
 */
app.post('/recoverPassword', function(req, res) {

    //get email
    var email = req.body.email;
    var validEmail = process.validate(email, 'email');
    if(validEmail){
        process.getUserByEmail(email, users, function(user){
            if (user) {
                var name = user.name;
                //generates an uuid
                var uuid = process.generateUUID(10);

                //Process the email
                var confirmationLink = 'http://localhost:3000/recoverConfirmation?uuid=' + uuid;

                var emailTo = email;
                if (IS_DEV) {
                    emailTo = "joaoabreu.wd@gmail.com";
                }

                var projectPath = path.resolve(__dirname);
                var template = projectPath+"/emailTemplates/emailRecoverPasswordTpl.txt";
                processEmail(emailTo, name, confirmationLink, template, function (success) {
                    if (success) {
                        console.log("Email de recuperação enviado");

                        //Saves the data to the recoveryPassUsers array to be used later
                        var obj = {
                            email: email,
                            uuid: uuid
                        }
                        recoverPassUsers.push(obj);

                        //process the success response
                        var json = {message: "Recuperação enviada para o email."};
                        process.processSuccessResponse(res, json);
                    }
                    else {
                        console.log("Erro ao enviar Email de recuperação!");
                        var json = {message: "Ocorreu um erro ao enviar o email. Por favor tente novamente mais tarde."};
                        process.processFailResponse(res, json);
                    }
                });

            }
            else {
                var json = {message: "Account dont exists!"};
                console.log("recoverPass: conta não existe!!");
                process.processFailResponse(res, json);
            }
        });
    }
    else{
        var json = {message: "Invalid email!"};
        console.log("Invalid email!");
        process.processFailResponse(res, json);
    }

});

/**
 * Processes the password recover
 */
app.get('/recoverConfirmation', function(req, res){
    var receivedUUID = req.query.uuid;
    console.log("Received uuid: " + receivedUUID);

    //verifies the received uuid
    process.verifyPasswordRecoveryByUUID(receivedUUID, recoverPassUsers, function(recoverOjb){
        if(recoverOjb){
            var email = recoverOjb.email;

            process.getUserByEmail(email, users, function(user){
                //Sets the user in session
                sess=req.session;
                sess.sessdata = {};
                sess.sessdata.email= user.email;
                sess.sessdata.name= user.name;

                res.render('myAccount.html');
            })
        }
    });
});



app.post('/update', function(req, res){
    console.log("Update account...");

    if(sess && sess.sessdata && sess.sessdata.email){
        var name = req.body.name;
        var password = req.body.password;


        var email = sess.sessdata.email;
        //update the data to this user
        console.log("OK update user");
        console.log(email);

        process.updateUser(email, name, password, users, function(pos, user){

            console.log("###############    Update user    ################")
            console.log(pos);
            console.log(user);
            if(user && pos >= 0){
                console.log("Utilizar actualizado...");
                users[pos].name = user.name;
                users[pos].password = user.password;

                sess.sessdata.name = user.name;
                process.processSuccessResponse(res);
            }
            else{
                console.log("Erro ao actualizar o utilizador...");
                var json = {message: "Erro ao actualizar o utilizador..."};
                process.processFailResponse(res, json)
            }
        });
    }
    else{
        console.log("Erro no update, sem email na sessão...");
        var json = {message: "Não autorizado", code: 401};
        process.processFailResponse(res, json)
    }


})


app.post('/register', function(req, res){
	var email = req.body.email;

    var validEmail = process.validate(email, 'email');
    if(validEmail) {
        process.verifyExistingAccount(email, users, tmpUsers, function (exists) {

            if (exists) {
                var json = {message: "Already registered!", code: 401};
                console.log("Email já registado!!");
                process.processFailResponse(res, json);
            }
            else {
                console.log("Email ainda não registado...");
                var password = req.body.password;
                var name = req.body.name;
                var uuid = process.generateUUID(10);

                console.log("UUID esperado:  " + uuid);
                console.log("email:  " + email);
                console.log("name:  " + name);


                //Process the email
                var confirmationLink = 'http://localhost:3000/registerConfirmation?uuid=' + uuid;

                var emailTo = email;
                if (IS_DEV) {
                    emailTo = "joaoabreu.wd@gmail.com";
                }

                var projectPath = path.resolve(__dirname);
                var template = projectPath+"/emailTemplates/emailConfirmationTpl.txt";
                processEmail(emailTo, name, confirmationLink, template, function (success) {
                    if (success) {
                        console.log("Email de confirmação enviado");
                        //Saves the new user
                        tmpUsers.push({
                            name: name,
                            email: email,
                            password: new Buffer(password).toString('base64'),
                            uuid: uuid,
                            registeredAt: new Date().getTime()
                        });

                        //process the success response
                        var json = {message: "Confirmação enviada para o email."};
                        process.processSuccessResponse(res, json);
                    }
                    else {
                        console.log("Erro ao enviar Email de confirmação!");
                        var json = {message: "Ocorreu um erro ao enviar o email. Por favor tente novamente mais tarde."};
                        process.processFailResponse(res, json);
                    }
                });
            }
        })
    }
    else{
        console.log("Invalid email!");
        var json = {message: "Invalid email!"};
        process.processFailResponse(res, json);
    }
});

app.get('/registerConfirmation', function(req, res){
	var receivedUUID = req.query.uuid;

	console.log("Received uuid: " + receivedUUID);

	process.verifyTempUser(receivedUUID, tmpUsers, function(user, pos){

		if(user){
			console.log("Registo validado para o user:");
			console.log(user);
            //Sets the user in the user database (memory)
			users.push(user);

            //Sets the user in session
            sess=req.session;
            sess.sessdata = {};
            sess.sessdata.email= user.email;
            sess.sessdata.name= user.name;

            //removes the object from the array
            tmpUsers.splice(pos, 1);

            res.render('home.html');
		}
		else{
			console.log("Registo não validado!!Confirma email");

			//var json = {message: "Pre Registo inválido"};
			//process.processFailResponse(res, json);
            res.render('home.html');
		}
	});
});

//app.post('/login', process.login);
app.post('/login', function(req, res){
	//process.login(req, res, sess);
	var email = req.body.email;
	var password = req.body.password;

	process.verifyUserLogin(email, password, users, function(user){
		if(user){
			console.log("Login OK");
            console.log("Session User");
            console.log(user);
			sess=req.session;
			sess.sessdata = {};
			sess.sessdata.email= email;
            sess.sessdata.name= user.name;

			var json = {message: "Login OK", user: user};
            process.processSuccessResponse(res, json);
		}
		else{
			console.log("Login invalido");
			var json = {message: "Login inválido", code: 401};
            process.processFailResponse(res, json);
		}
	});



});

app.post('/verifyUserSession',function(req,res){
	if(sess && sess.sessdata) console.log(sess.sessdata);

	if(verifyUserSession()){
		console.log("User in session");
		console.log(sess.sessdata.email);

        var json = {user: sess.sessdata};
        process.processSuccessResponse(res, json);
	}
	else {
		console.log("No user in session");
        var json = {user: null};
        process. processFailResponse(res, json);
	}
});

app.get('/logout', function(req, res){
    console.log("Logout...");
    sess = null;

    process.processSuccessResponse(res);
});


app.post('/translate', function(req, res) {
    if(verifyUserSession()){
        var text = req.body.text;

        if(text){
            console.log("Texto a traduzir:");
            console.log(text);

            var translated = process.translateToPigLatin(text);

            console.log("Texto traduzido:");
            console.log(translated);

            translations.push( {text: text, translated: translated} );

            var json = {message: "OK", text: translated};
            process.processSuccessResponse(res, json);
        }
        else{
            var json = {message: "Texto obrigatório"};
            process.processFailResponse(res, json);
        }

    }
    else{
        console.log("Login obrigatorio para traduzir:");
        var json = {message: "Login obrigatório", code: 401};
        process.processFailResponse(res, json);
    }

});

app.get('/history', function(req, res){
    var json = {message: "Pig Latin Translations", translations: translations};
    process.processSuccessResponse(res, json);
});

app.listen(3000,function(){
	console.log("Pig Translator App Started on PORT 3000 :)");
});





/**
 * Process the email to be sent
 * @param emailTo
 * @param name
 * @param confirmationLink
 * @param template (file path)
 * @param cb
 */
function processEmail(emailTo, name, confirmationLink, template, cb){


    mailer.send({
        host : "smtp.gmail.com",              // smtp server hostname
        port : "587",                     // smtp server port
        domain : "localhost",            // domain used by client to identify itself to server
        to : emailTo,
        from : "dev.joaoabreu.wd@gmail.com",
        subject : "Confirmação de conta",
        //body: emailBody,
        template: template,
        data : {
            "name": name,
            "confirmationLink": confirmationLink,
        },
        authentication : "login",        // auth login is supported; anything else is no auth
        username : "dev.joaoabreu.wd@gmail.com",       // Base64 encoded username
        password : "Dev123456789"        // Base64 encoded password
    },
    function(err, result){
        console.log("result");
        console.log(result);
        if(cb){
            console.log("Callback");
            cb(result);
        }
        if(err){
            console.log(err);
            success = false;
        }
        //if(cb) cb(success);
    });
}



/**
 * Verifies the user in session
 * @returns {boolean}
 */
function verifyUserSession(){
	if(sess && sess.sessdata && sess.sessdata.email){
		return true;
	}
	else {
		return false;
	}
}