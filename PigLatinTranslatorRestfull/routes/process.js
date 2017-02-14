/**
 * Translates to pig latin
 * @param text
 * @returns {string|void|XML}
 */
exports.translateToPigLatin = function(text){

    return text.replace(/[a-z]+/ig, function(word){
        return translate(word);
    });
};
function translate(word){
    var keepMoving = true;
    var firstPart = "";
    var seccondPart = "";
    var movedWord = "";
    var ignore = false;
    var translated = "";

    //Words that start with a vowel (A, E, I, O, U) simply have "WAY" appended to the end of the word.
    if(word[0].match(/[AEIOU]/i)){
        //VOGAL
        translated = word+"ay";
    }
    else{
        //CONSOANTE
        for(var i=0; i<word.length; i++){
            var l = word[i].toUpperCase();

            if(l == "Y" && word[i+1] && word[i+1].match(/[AEIOU]/i)){
                keepMoving = true;
            }
            else if(l == "A" || l == "E" || l == "I" || l == "O" ||l == "U" || l == "Y"){
                keepMoving = false;
            }
            if(l == "W") ignore = true;
            else ignore = false

            if(!ignore){
                if(keepMoving){
                    seccondPart += word[i];
                }
                else{
                    firstPart += word[i];
                }
            }
        }
        movedWord = firstPart + seccondPart;
        translated =  movedWord+"ay";
    }
    return translated;
}



/**
 * Generates a random string
 * @param length
 * @returns {string}
 */
exports.generateUUID = function(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if(!length) length = 10;

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Process a generic success response to client
 * @param res
 * @param json
 */
exports.processSuccessResponse = function(res, json){
    if(!json) json = {};
    json.success = true;

    if(res) res.send( JSON.stringify(json) );
    else return json;
}

/**
 * Process a generic fail response to client
 * @param res
 * @param json
 */
exports.processFailResponse = function(res, json){
    if(!json) json = {};
    json.success = false;

    if(res) res.send( JSON.stringify(json) );
    else return json;
}

/**
 * Recovers the object to the recovery password by the given uuid
 * @param uuid
 * @param cb
 */
exports.verifyPasswordRecoveryByUUID = function(uuid, recoverPassUsers, cb){
    var recoverOjb = null;
    for(var i=0; i<recoverPassUsers.length; i++){
        if(recoverPassUsers[i].uuid == uuid){
            recoverOjb = recoverPassUsers[i];
        }
    }
    if(cb) cb(recoverOjb);
}

/**
 * Gets an user by the given email
 * @param email
 * @param cb
 */
exports.getUserByEmail = function(email, users, cb){
    var user = null;

    for(var i=0; i<users.length; i++){
        if( email == users[i].email){
            user = users[i];
        }
    }
    if(cb) cb(user);
}

/**
 * Update an user
 * @param email
 * @param name
 * @param password
 * @param cb
 */
exports.updateUser = function(email, name, password, users, cb){
    var pos;
    var user;

    for(var i=0; i<users.length; i++){
        if( email == users[i].email){
            user = users[i];
            user.name = name;
            if(password != null && password != ""){
                user.password = new Buffer(password).toString('base64');
            }
            pos = i;
        }
    }

    if(cb) cb(pos, user);
}


/**
 * Verifies the user login by the given email and password
 * @param email
 * @param password
 * @param cb
 */
exports.verifyUserLogin = function(email, password, users, cb){
    var pass64 = new Buffer(password).toString('base64');

    var user = null;
    for(var i=0; i<users.length; i++){
        if( email == users[i].email && pass64 == users[i].password ){
            user = users[i];
        }
    }
    if(cb) cb ( user );
}


/**
 * Removes the users that submit the registry more than 24 hours ago
 * @param cb
 */
exports.removeOlderTmpUsers = function(tmpUsers, cb){
    for(var i=0; i<tmpUsers.length; i++){
        var pos;

        var timeMillis = 1000*60*60*24;
        if( new Date().getTime() > tmpUsers[i].registeredAt + timeMillis){
            pos = i;
        }
    }
    if(cb) cb(pos);
}

/**
 * Verifies if the account already exists
 * @param email
 * @param cb
 */
exports.verifyExistingAccount = function (email, users, tmpUsers, cb){
    var exists = false;

    //Registered users
    for(var i=0; i<users.length; i++){
        if( email == users[i].email){
            exists = true;
        }
    }

    //Removes the older users from the tmpUsers registry
    exports.removeOlderTmpUsers( tmpUsers, function(pos){
        tmpUsers.splice(pos, 1); //removes the object from the array

        //Users waiting for confirmation users
        for(var i=0; i<tmpUsers.length; i++){
            if( email == tmpUsers[i].email){
                exists = true;
            }
        }
    });

    if(cb) cb ( exists );
}

/**
 * Search the temporary register for a user by the given UUID
 * @param uuid
 * @param cb
 */
exports.verifyTempUser = function(uuid, tmpUsers, cb){
    var user = null;
    var pos = null;

    for(var i=0; i < tmpUsers.length; i++){
        if(tmpUsers[i].uuid == uuid){
            user = tmpUsers[i];
            pos = i;
        }
    }

    if(cb) cb( user, pos );
}

/**
 * Validates the given value
 */
exports.validate = function(value, type){
    var regex;
    switch( type ) {
        case 'number':
            regex = /^\d+$/;
            break;
        case 'string':
            regex = /\w+/gi;
            break;
        case 'email':
            regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
            break;
        default:
            console.error("The type is not defined! Types: 'number', 'string', 'email'");
            return false;
    }

    if (String(value).match(regex)) {
        return true;
    }
    else{
        return false;
    }
}