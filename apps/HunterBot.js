//HUNTER APPLICATION
// RORQ LOSSES IN FADE
// https://zkillboard.com/api/losses/shipID/28352/regionID/10000046/orderDirection/asc/
var request = require('request');
var Func = require('./apps/Functions.js');

app.get('/GetSovLevel', (req, res) => {
    var options = {
        method: 'GET',
        headers: {
            'User-Agent': 'rusherz ieatrusherz34@gmail.com',
            'Accept': 'application/json',
            'Host': 'esi.tech.ccp.is'
        },
        url: 'https://esi.tech.ccp.is/latest/sovereignty/structures/'
    }
    Func.MakeRequest(options, (body) => {
        //res.send(JSON.parse(body));
        var data = JSON.parse(body);
        var SQL= 'INSERT INTO SovLevel VALUES ';
        data.forEach((entry, index, array) => {
            if(entry['vulnerability_occupancy_level'] != null){
                SQL += "('" + entry['solar_system_id'] + "', " + (parseFloat(entry['vulnerability_occupancy_level']).toFixed(1)) + ")";
            }else{
                SQL += "('" + entry['solar_system_id'] + "', 0.0)";
            }
            if (index == (array.length - 1)) {
                SQL += ';';
                connection.query(SQL, (error, results) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log('done');
                    res.send(data);
                });
            } else {
                SQL += ', ';
            }
        });
    });
});

app.get('/GetSystemKills', (req, res) => {
    var options = {
        method: 'GET',
        headers: {
            'User-Agent': 'rusherz ieatrusherz34@gmail.com',
            'Accept': 'application/json',
            'Host': 'esi.tech.ccp.is'
        },
        url: 'https://esi.tech.ccp.is/latest/universe/system_kills/'
    }
    MakeRequest(options, (body) => {
        //res.send(JSON.parse(body));
        var data = JSON.parse(body);
        var SQL = 'INSERT INTO SystemKills VALUES ';
        data.forEach((entry, index, array) => {
            SQL += "(" + entry['npc_kills'] + ", " + entry['pod_kills'] + ", " + (entry['ship_kills'] - entry['npc_kills']) + ", '" + entry['system_id'] + "')";
            if (index == (array.length - 1)) {
                SQL += ';';
                connection.query(SQL, (error, results) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log('done');
                    res.send(SQL);
                });
            } else {
                SQL += ', ';
            }
        });
    });
});