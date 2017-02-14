var chai = require('chai');
var expect = require('chai').expect;
var run = require('../routes/process.js');


/*expect( testWord ).to.not.equal('hello earth');
 expect( testWord ).to.be.a('string');
 expect( testWord ).to.not.be.a('number');
 expect( obj ).to.have.property('success').with.lengthOf(3);
 expect( testWord ).to.contain('hello');*/

describe('translateToPigLatin', function(){
    //The active users
    var users = [{email: "joao@teste.pt", name: "João Carlos Abreu", password: "MTIz"}];

    //the temporary users in memory
    var tmpUsers = [{uuid: "hya6FA42HG", email: "joao@teste.pt", name: "João Carlos Abreu", password: "MTIz"}];

    //The history of translations
    var translations = [];

    //the temporary users to recover password
    var recoverPassUsers = [];

    it('translateToPigLatin test yellow', function(){
        var word = "yellow";
        var testWord = run.translateToPigLatin(word);

        expect( testWord ).to.equal('elloyay');
    })

    it('translateToPigLatin test style', function(){
        var word = "style";
        var testWord = run.translateToPigLatin(word);

        expect( testWord ).to.equal('ylestay');
    })

    it('generateUUID', function(){
        var size = 10;
        var uuid = run.generateUUID( size );

        expect( uuid ).to.be.a('string');
        expect( uuid ).to.have.lengthOf( size );
    })

    it('processSuccessResponse', function(){
        var component = {message: "teste"}
        var res = run.processSuccessResponse(null, component);

        expect( res ).to.have.property('success').to.equal(true);
        expect( res ).to.have.property('message').to.equal("teste").to.be.a('string');
    })

    it('processFailResponse', function(){
        var component = {message: "teste"}
        var res = run.processFailResponse(null, component);

        expect( res ).to.have.property('success').to.equal(false);
        expect( res ).to.have.property('message').to.equal("teste").to.be.a('string');
    })

    it('verifyPasswordRecoveryByUUID', function(){
      //TODO implementar depois de adicionar à lista de recuperação de pass
    })

    it('getUserByEmail', function(){
        var email = "joao@teste.pt";

        run.getUserByEmail(email, users, function( user ){
            expect( user ).to.have.property('email').to.equal("joao@teste.pt");
            expect( user ).to.have.property('name').to.equal("João Carlos Abreu");
            expect( user ).to.have.property('password').to.equal("MTIz");

        });
    })

    it('updateUser', function(){
        var email = "joao@teste.pt",
            name = "João Abreu",
            password = "123";

        run.updateUser(email, name, password, users, function(pos, user){
            expect( user ).to.have.property('email').to.equal("joao@teste.pt");
            expect( user ).to.have.property('name').to.equal("João Abreu");
            expect( user ).to.have.property('password').to.equal("MTIz");

        });
    })

    it('verifyUserLogin', function(){
        var email = "joao@teste.pt";
        var password = "123";

        run.verifyUserLogin(email, password, users, function(user){
            expect( user ).to.have.property('email').to.equal("joao@teste.pt");
            expect( user ).to.have.property('name').to.equal("João Abreu");
            expect( user ).to.have.property('password').to.equal("MTIz");

        });
    })

    it('verifyExistingAccount', function(){
        var emailOK = "joao@teste.pt";
        var emailNOK = "pedro@teste.pt";

        run.verifyExistingAccount(emailOK, users, tmpUsers, function(exists){
            expect( exists ).to.equal(true);
        });

        run.verifyExistingAccount(emailNOK, users, tmpUsers, function(exists){
            expect( exists ).to.equal(false);
        });
    })


    it('verifyTempUser', function(){
        tmpUsers = [{uuid: "hya6FA42HG", email: "joao@teste.pt", name: "João Carlos Abreu", password: "MTIz"}];

        var uuid = "hya6FA42HG";

        run.verifyTempUser(uuid, tmpUsers, function( user, pos){
            expect( user ).to.not.equal(null);
            expect( pos ).to.be.a('number');
            expect( user ).to.have.property('uuid').to.equal("hya6FA42HG");
            expect( user ).to.have.property('email').to.equal("joao@teste.pt");
            expect( user ).to.have.property('name').to.equal("João Carlos Abreu");
            expect( user ).to.have.property('password').to.equal("MTIz");
            expect( pos ).to.equal(0);
        });
    })

    it('validate -> string', function(){
        var value;
        var type;
        var res;

        //valid string
        value = 'teste';
        type = 'string';
        res = run.validate(value, type);
        expect( res ).to.equal(true);

        //invalid string
        value = '/&%/&%!)(';
        type = 'string';
        res = run.validate(value, type);
        expect( res ).to.equal(false);

    })

    it('validate -> number', function(){
        var value;
        var type;
        var res;

        //valid number
        value = 10;
        type = 'number';
        var res = run.validate(value, type);
        expect( res ).to.equal(true);

        //invalid number
        value = "12$&/";
        type = 'number';
        var res = run.validate(value, type);
        expect( res ).to.equal(false);

    })

    it('validate -> email', function(){
        var value;
        var type;
        var res;

        //Valid email
        value = "joao@teste.pt";
        type = 'email';
        res = run.validate(value, type);
        expect( res ).to.equal(true);

        //Invalid email
        value = "joao@teste";
        type = 'email';
        res = run.validate("joaoteste", 'email');
        expect( res ).to.equal(false);
    })

});