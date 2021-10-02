module.exports = {
    name : "playerinfo",
    description : "Gets information regarding the discord user's saved information. Modifiers include: gold, joindate, userid, factioninfo",
    execute(message, args){
        const referenceTables = require('../Modules/referenceTables.js');
        const sqlConnection = require('../Modules/sqlProcessing.js');

        let modifier;
        if (args.length > 0){
            modifier = args.shift().toLowerCase();
        }

        sqlConnection.query('select * from `User` where `DiscordUserId` = ?', [message.author.id], (error, results, fields) =>{
            if (error){console.warn(error); return;}

            if (results[0]){
                if (modifier == "gold"){
                    message.channel.send(results[0].Name + "'s Gold: " + results[0].Gold);
                }else if (modifier == 'joindate'){
                    message.channel.send(results[0].Name + " joined on " + results[0].JoinDate);
                }else if(modifier == 'userid'){
                    message.channel.send(results[0].Name + "'s userid is " + results[0].UserId);
                }else if(modifier == 'factioninfo'){
                    sqlConnection.query('select * from `SubFactionUser` where UserId = ?', [results[0].UserId], (error, results2)=>{
                        if (error) throw error;

                        if (results2[0]){
                            let mass = results[0].Name + " is member of:";
                            for (var entry in results2){
                                let row = results2[entry];
                                mass += "\n**" + referenceTables.changeSubFacIdWithName(row.SubFactionId) + "** as a(n) **" + referenceTables.changeSubFacRankIdWithName(row.SubFactionId, row.SubFactionRankId) + "**, with " + row.Contribution + " Contribution Points.";
                            }
                            message.channel.send(mass);
                        }else{
                            message.channel.send(results[0].Name + " does not appear to be in a Faction/SubFaction");
                        }
                    });
                }else{
                    message.channel.send('Incorrect modifier used for command.');
                }
            }else{
                message.channel.send(message.author.username + ' is apparently not verified, please use verify command.');
            }
        });
    }
}