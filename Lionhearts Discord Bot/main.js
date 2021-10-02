require("dotenv").config(); //this information is not replicated to git hub and contains all security information
const Discord = require('discord.js');
const fs = require('fs'); //file read and write

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
]);

const client = new Discord.Client({ ws: { intents } }); //the bot object, 

const command_Prefix = "~";

//Set up the commands from the folder
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(__dirname + '/Commands/').filter(file => file.endsWith('.js')); //gets all command files in the folder "Commands" and then filters them for only js
for (const file of commandFiles){
    const command = require(`./Commands/${file}`);

    client.commands.set(command.name, command);
}

//Create HTTP Server for instantaneous actions
require('./Modules/httpProcessing.js').runServer(client);

//Have the reference sql cache loop refresh
require('./Modules/referenceTables.js').loopRefresh();

//Verified Players get their roles updated on a loop of specified time
require('./Modules/verificationTokens.js').updateUserRolesOnInterval(client);

//Start up event, must be done first
client.on('ready', () =>{
    console.log(`Logged in as ${client.user.tag}! `);

    //Create the status loop
    client.commands.get('gameinfo').playerCountLoop(client);
});

//On the recieved a Message event
client.on('message', msg =>{ 
    if (!msg.content.startsWith(command_Prefix) || msg.author.bot) return;

    const args = msg.content.slice(command_Prefix.length).split(/ +/); //remove the command prefix, split the text into separate words
    const commandRecieved = args.shift().toLowerCase();

    //Function ifs mass
    if (commandRecieved == 'help'){
        let mass = "Here is the current command list:";
        for (const file of commandFiles){
            const command = require(`./Commands/${file}`);
        
            mass = mass + "\n***" + command.name + "***\n``" + command.description + "``";
        }

        msg.channel.send(mass);
    } else if (commandRecieved === 'ping'){
        client.commands.get('ping').execute(msg, args);
    } else if (commandRecieved == 'verify'){
        client.commands.get('verify').execute(msg, args);
    }else if (commandRecieved == 'activebattles'){
        client.commands.get('activebattles').execute(msg, args);
    }else if (commandRecieved == 'gameinfo'){
        client.commands.get('gameinfo').execute(msg, args);
    }else if (commandRecieved == 'playerinfo'){
        client.commands.get('playerinfo').execute(msg, args);
    }
});

client.login(`${process.env.BOT_TOKEN}`); //this is where the bot informs Discord that they are now online and ready to use the services
