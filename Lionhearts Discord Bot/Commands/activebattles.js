module.exports = {
    name : "activebattles",
    description : "Gets all the active battles in the game. Please note that it will also report any crashed battles as well.",
    execute(message, args){
        const referenceTables = require('../Modules/referenceTables.js');
        const sqlConnection = require('../Modules/sqlProcessing.js');

        function siegeOrCapture(numero){
            if (numero == 1){
                return "sieging";
            }else{
                return "capturing";
            }
        }

        sqlConnection.query("select * from `BattleInformation` where `Winners` = ?", ['Load'], function(error, results, fields){
            if (error){console.warn(error)};

            if (results[0]){
                let txtMass = "Here are the currently active battles:";
                let battlenum = 1;
                for (var battle in results){
                    let info = results[battle];

                    txtMass += "\n"+ battlenum++ + ". Battle #" + info.BattleId + ": **" + referenceTables.changeFacPrefixWithName(info.Attack) + "** is "+ siegeOrCapture(info.Siege) +" the base ***"+ referenceTables.changeBaseIdWithName(info.BaseId) +"***, which is being defended by **" + referenceTables.changeFacPrefixWithName(info.Defense) + "**!";
                }
                message.channel.send(txtMass);
            }else{
                message.channel.send("There are currently no active battles.");
            }
        });
    }
}