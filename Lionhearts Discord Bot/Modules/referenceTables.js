let sqlConnection = require('./sqlProcessing.js')
let initialized = false;

function createCache(){
    sqlConnection.query(
    `SELECT DISTINCT
        TABLE_NAME
    FROM
        INFORMATION_SCHEMA.STATISTICS
    WHERE
        TABLE_SCHEMA = ? AND INDEX_NAME = 'PRIMARY'`, 
        [process.env.SQL_DATABASE], (error, results) => { //query all the table names in the database
        if (error) throw error;

        for (var entry in results){
            let name = results[entry].TABLE_NAME;

            if (name.startsWith('REF_')){
                sqlConnection.query('select * from ??.??', [process.env.SQL_DATABASE, name], (error1, results1) =>{ //query the data of those static tables and cache it
                    if (error1) throw error1;

                    module.exports.cache[name.slice(4)] = results1;
                });
            }
        }
    })
}

module.exports = {
    cache : {},
    loopRefresh(){
        if (!initialized){
            initialized = true; //avoid creating multiple loops

            createCache();

            setInterval(createCache, 1800000); //every 30 minutes
        }
    },

    //Custom Get Functions
    changeFacPrefixWithName(facPref){ //get the name of the faction from the internal prefix
        let row = module.exports.cache.Faction.find(fr => fr.FactionPrefix == facPref);
        if (row){
            return row.Name;
        }
    },

    changeFacIdWithName(facId){ //get the name of the faction from the internal id
        let row = module.exports.cache.Faction.find(fr => fr.FactionId == facId);
        if (row){
            return row.Name;
        }
    },

    changeSubFacIdWithName(sfacId){ //get the name of the subfaction from the internal id
        let row = module.exports.cache.SubFaction.find(fr => fr.SubFactionId == sfacId)
        if (row){
            return row.Name;
        }
    },

    changeSubFacRankIdWithName(sfacId, sFacRankId){ //get the name of the subfaction rank from the internal id
        let row = module.exports.cache.SubFactionRank.find(fr => fr.SubFactionRankId == sFacRankId && fr.SubFactionId == sfacId)
        if (row){
            return row.Name;
        }
    },

    changeBaseIdWithName(baseId){ //get the name of the base with the internal id
        let row = module.exports.cache.Base.find(br => br.BaseId == baseId);
        if (row){
            return row.Name;
        }
    },
    
    changeStateTypeIdWithName(statId){ //get the name of the state type with the internal id
        let row = module.exports.cache.StateType.find(br => br.StateTypeId == statId);
        if (row){
            return row.Name;
        }
    }
}