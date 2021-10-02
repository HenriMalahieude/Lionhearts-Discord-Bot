module.exports = {
    name: 'ping',
    description: 'The bot replies with a pong.',
    execute(message, args){
        message.channel.send("Pong!");
    }
}