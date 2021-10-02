module.exports = {
    name: 'verify',
    description: 'Generates a token with which the user can input into the game to verify their discord.',
    execute(message, args){
        message.channel.send("Generating your verification token.");

        let tokenHousing = require('../Modules/verificationTokens.js');

        //Generate Token
        let gToken = tokenHousing.addToken(message.author.id);

        message.author.send("Here is your token: ``" + gToken +"`` \nBe careful not to share this with anyone. It expires in 30 minutes, so make sure to input this into the game!");
    }
}