let https = require('https');

module.exports = {
    name : "gameinfo",
    description : "Returns information regarding the game. Modifiers include: statemembers, baseowners, link",
    execute(message, args){
        let sqlConnection = require('../Modules/sqlProcessing.js');
        let referenceTables = require('../Modules/referenceTables.js');

        let modifier;
        if (args.length > 0){
            modifier = args.shift().toLowerCase();
        }

        if(modifier == 'link'){
            message.channel.send("https://www.roblox.com/games/1383356634/Third-Crusade-Reforged");
        }else if (modifier == 'baseowners'){
            sqlConnection.query('select * from `BaseData`', (error, results) => {
                if (error) throw error;

                let mass = '***Current Base Ownership***';
                for (var entry in results){
                    let row = results[entry];

                    mass += '\n**' + referenceTables.changeBaseIdWithName(row.BaseId) + '** is owned by **' + referenceTables.changeFacPrefixWithName(row.CurrentOwner) + '**';
                }
                message.channel.send(mass);
            });
        }else if (modifier == 'statemembers'){
            sqlConnection.query('select * from `FactionAlliance`', (error, results) => {
                if (error) throw error;

                let mass = '***Current Statehood of Faction***';
                for (var entry in results){
                    let row = results[entry];

                    mass += '\n**' + referenceTables.changeFacIdWithName(row.FactionId) + '** is currently a(n) **' + referenceTables.changeStateTypeIdWithName(row.CurrentStateTypeId) +"**";
                }
                message.channel.send(mass);
            });
        }else{
            message.channel.send("Please send a valid modifier.");
        }
    },

    playerCountLoop(client){
        function setStatus(){
            https.get('https://games.roblox.com/v1/games?universeIds=552855493', res =>{
                let data = '';

                res.on('data', d =>{
                    data += d;
                })

                res.on('end', () =>{
                    let infoArray;
                    try{ //make sure we recieve valid json
                        infoArray = JSON.parse(data).data[0];
                    }finally{
                        if (infoArray){ //just check that there is something in the info array
                            client.user.setActivity(infoArray.playing + ' TTC Players', {type : 'WATCHING'})
                        }else{
                            console.warn("There was an issue communicating with the roblox api. Malformed JSON.");
                        }
                    }
                })

            }).on('error', error =>{
                console.warn("There was an issue communicating with the roblox api.");
            })
        }

        setStatus();

        setInterval(setStatus, 300000);
    }
}