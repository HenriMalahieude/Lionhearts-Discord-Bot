let sqlConnection = require('./sqlProcessing.js');
module.exports = {
    house : {},
    addToken(discordUserId){
        if (this.house[discordUserId]){
            return this.house[discordUserId];
        }else{
            function randomLetter(){
                let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
                let rStart = Math.floor(Math.random() * str.length);
                return str.substr(rStart, 1); //randomly selects a place where it will choose a letter, and takes one character
            }

            //Create a unique token
            let token = "";
            while (true){
                token = "";
                for (var i = 0; i<10; i++){
                    token += randomLetter();
                }

                let end = true;
                for (var dui in this.house){ //checks that the generated token is unique to this user
                    let compToken = this.house[dui];
                    if (compToken == token){
                        end = false;
                        break;
                    }
                } //Note: Highly unlikely with 10 character tokens and 62 different possible places for each that there will be an issue until there are more than 10000 active tokens

                if (end){
                    break;
                } //could be cleaned up with a better way to create unique tokens
            }

            this.house[discordUserId] = token;

            setTimeout(function(){
                if (module.exports.house[discordUserId]){
                    delete module.exports.house[discordUserId];
                }
                //console.log("Deleted a token!")
            }, 1800000);
                

            return token;
        }
    },
    tokenEvent(userId, token, client){ //on the http server event
        //Search for the token
        let relatedDiscord;
        for (var discordUserId in this.house){
            let tempToken = this.house[discordUserId];
            if (token == tempToken){
                relatedDiscord = discordUserId;
                break;
            }
        }

        if (relatedDiscord){
            sqlConnection.query("update `User` set `DiscordUserId` = ? where (`UserId` = ?)", [relatedDiscord, userId], (error, results, fields) => {
                if (error) throw error;

                delete this.house[relatedDiscord];

                client.users.fetch(relatedDiscord).then(member =>{ //send them a confirmation message on discord
                    member.send("Your token has been confirmed and your Discord has been linked!") 
                });

                this.updateUserRoles(`${relatedDiscord}`, client);
            });
            return true;
        }else{
            return false;
        }
    },
    updateUserRoles(discordUserId, client){ //update an individual's roles in the main server
        let referenceTables = require('./referenceTables.js');

        client.guilds.fetch('286754781949722625').then(guild => { //the id there is the id of the primary server
            guild.members.fetch(discordUserId).then(member => {

                let roleManager = member.roles

                if (roleManager && !roleManager.cache.has('286756118074490882') && !roleManager.cache.has('696037908418658354')){ //just make sure it doesn't error on people that are roled higher than it
                    //Remove all roles from user
                    for (var entry in referenceTables.cache.Faction){
                        let fac = referenceTables.cache.Faction[entry]
                        if (fac.FactionPrefix != "PILG"){
                            let discordroleid = fac.DiscordMention
                            discordroleid = discordroleid.replace("<@&", '').replace(">", '')

                            if (roleManager.cache.has(discordroleid)){
                                roleManager.remove(discordroleid).catch(console.error)
                            }
                        }
                    }
                    
                    if (roleManager.cache.has('592844494165114902')){ //leader role
                        roleManager.remove('592844494165114902').catch(console.error)
                    }
                    if (roleManager.cache.has('592844495322611732')){ //nobility role
                        roleManager.remove('592844495322611732').catch(console.error)
                    }

                    sqlConnection.query('select * from `User` where `DiscordUserId` = ?', [discordUserId], (error, results) =>{
                        if (error) throw error;

                        member.setNickname(results[0].Name);
                    })
                    
                    sqlConnection.query('select sfu.SubFactionId, sfu.SubFactionRankId from `User` as usr inner join `SubFactionUser` as sfu on usr.UserId = sfu.UserId where usr.DiscordUserId = ?', [discordUserId],(error, results, fields) => {
                        if (error) throw error;

                        for (var row of results){
                            let subFaction = referenceTables.cache.SubFaction.find(sf => sf.SubFactionId == row.SubFactionId)
                            if (subFaction){
                                //Faction Role
                                let discordroleid = referenceTables.cache.Faction.find(fr => fr.FactionId == subFaction.FactionId)
                                discordroleid = discordroleid.DiscordMention.replace("<@&", '').replace(">", '')
                                if (subFaction.SubFactionPrefix == 'MAIN'){
                                    roleManager.add(discordroleid).catch(console.error)
                                }
                                
                                //Leader or Nobility Role
                                let rankId = row.SubFactionRankId
                                let rankRef = referenceTables.cache.SubFactionRank.find(sfr => sfr.SubFactionRankId == rankId && sfr.SubFactionId == subFaction.SubFactionId)

                                if (rankRef.RankTypeId == 5){ //leader role
                                    roleManager.add('592844494165114902').catch(console.error)
                                }else if (rankRef.RankTypeId >= 3){ //nobility role
                                    roleManager.add('592844495322611732').catch(console.error)
                                }
                            }
                        }
                    });
                }
            }).catch(console.error);
        }).catch(console.error);
    },
    updateUserRolesOnInterval(client){ //loop through all linked players in the sql
        setInterval(function(){
            sqlConnection.query('select * from `User` where `DiscordUserId` and datediff(curdate(), `LastLoginDate`) < 1', (error, results) =>{
                if (error) throw error;
                for (var i = 0; i < results.length; i++){
                    module.exports.updateUserRoles(results[i].DiscordUserId, client);
                }
            });
        }, 1800000); //1800000s
    }
};