var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var cookieSession = require('cookie-session');
var request = require('request');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'allianceserver',
    password: '5LAP_ALLIANCE_SERVER_MYSQL',
    database: 'eve'
});
var app = express();
var skillList;
var ClientId;
var Secret;
var url;
var fuelCode;

connection.connect(function (error) {
    if (error) {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'authserver',
            database: 'eve'
        });
        connection.connect(function (error) {
            if (error) {
                console.error(error);
                return;
            } else {
                //DEV KEYS
                ClientId = 'e0b65052339e436c8a53444e7174ee59';
                Secret = '8WPWy6xpltKgXDG7j5Dsko8Jx0SU2RoKzB3UTLfC';
                url = 'https://login.eveonline.com/oauth/authorize/?response_type=code' +
                    '&redirect_uri=http://127.0.0.1:3000/callback&client_id=e0b65052339e436c8a53444e7174ee59' +
                    '&scope=corporationStructuresRead%20esi-skills.read_skills.v1%20esi-corporations.read_structures.v1' +
                    '&state=uniquestate123';
                fuelCode = 'msjSQ54BcqIVz3s1PATR_CTmnpxtJYX9g6Ilrz9Khuw1';
            }
        });
    } else {
        // PRODUCTION
        ClientId = '377645b262b34c87a68bce8963ae2847';
        Secret = 'LNZsrtvVaSWzvkXjss3YRiSrhv7AIMhvJAfO58Gf';
        url = 'https://login.eveonline.com/oauth/authorize/?response_type=code' +
            '&redirect_uri=http://auth.sudden-impact.online:3000/callback&client_id=377645b262b34c87a68bce8963ae2847' +
            '&scope=corporationStructuresRead%20esi-skills.read_skills.v1%20esi-corporations.read_structures.v1' + 
            '&state=uniquestate123';
        fuelCode = 'qA_r6yU5GU7Hq1iv3iK_lOTGTjikWRf7Acm8G_KE7tL7LdLe0gRHiatepnLf_MgB0';
    }
});

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(cookieSession({
    keys: ['password']
}));

/*
 *
 *
 * BASE APPLICATION
 *
 *
 */

app.get('/', function (req, res) {
    req.session.admin = false;
    req.session.refresh_token = null;
    res.redirect(url);
});

app.get('/callback', function (req, res) {
    if (req.session.refrresh_token == null)
        req.session.code = req.query.code;
    res.redirect('/fit/skill');
});

app.get('/logout', function (req, res) {
    res.redirect('/');
});

/*
 *
 *
 * FIT CHECK APPLICATION
 *
 *
 */
app.get('/fit', function (req, res) {
    connection.query("SELECT * FROM fit;", function (error, results, fields) {
        if (error) {
            console.error(error);
            return;
        }
        if (results.length != 0) {
            var fitJson = '[';
            results.forEach((result, index, array) => {
                fitJson += result['fitJson'];
                if (index == (array.length - 1)) {
                    fitJson += ']';
                } else {
                    fitJson += ',';
                }
            });
            fitJson = JSON.parse(fitJson);
            res.render('fits', {
                admin: req.session.admin,
                fit: fitJson
            });
        } else {
            res.render('fits', {
                admin: req.session.admin
            });
        }
    });
});

app.post('/fit/editfitlist', function (req, res) {
    if (req.method != 'POST')
        res.redirect('/');
    if (req.body.method == 'edit') {
        EditAddFit(req, res)
    } else if (req.body.method == 'delete') {
        DeleteFit(req, res);
    }
});

app.get('/fit/skill', function (req, res) {
    GetAccessCode(req, function () {
        var options = {
            method: 'GET',
            headers: {
                'User-Agent': 'rusherz ieatrusherz34@gmail.com',
                'Authorization': 'Bearer ' + req.session.access_token,
                'Accept': 'application/json',
                'Host': 'esi.tech.ccp.is'
            },
            url: 'https://esi.tech.ccp.is/latest/characters/' + req.session.charId + '/skills/'
        }
        MakeRequest(options, function (body) {
            skillList = JSON.parse(body)['skills'];
            HtmlString(function (data) {
                res.render('skills', {
                    admin: req.session.admin,
                    fits: data
                });
            });
        });
    });
});

/*
 *
 *
 * POS FUEL APPLICATION
 *
 *
 */
app.get('/fuel', function (req, res) {
    var options = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + GetBase64(),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'login.eveonline.com'
        },
        url: 'https://login.eveonline.com/oauth/token',
        body: 'grant_type=refresh_token&refresh_token=' + fuelCode
        //msjSQ54BcqIVz3s1PATR_CTmnpxtJYX9g6Ilrz9Khuw1
        //qA_r6yU5GU7Hq1iv3iK_lOTGTjikWRf7Acm8G_KE7tL7LdLe0gRHiatepnLf_MgB0
    }
    MakeRequest(options, function (body) {
        console.log(body);
        var options = {
            method: 'GET',
            headers: {
                'User-Agent': 'rusherz ieatrusherz34@gmail.com',
                'Authorization': 'Bearer ' + JSON.parse(body)['access_token'],
                'Host': 'crest-tq.eveonline.com'
            },
            url: 'https://crest-tq.eveonline.com/corporations/98051516/structures/'
        }
        MakeRequest(options, function (body) {
            var citadels = JSON.parse(body)['items'];
            CitadelsOutput(citadels, function (data) {
                res.render('fuel', {
                    'admin': req.session.admin,
                    'citadel': data
                });
            });
        });
    });
});

app.listen(3000, function (error) {
    if (error) {
        console.error(error);
        return;
    }
    console.info('server started on port 3000');
});

/*
 *
 *
 * FUNCTIONS WILL BE GETTING MOVED TO OWN FILE
 *
 *
 */
function CitadelsOutput(citadels, callback) {
    var s = new Array();
    citadels.forEach((citadel, index, array) => {
        var tempCit = {
            'Number': (index + 1),
            'Name': citadel['solarSystem']['name'],
            'Location': citadel['solarSystem']['name'],
            'TimeLeft': '',
            'Date': ''
        }
        if (citadel['fuelExpires'] == null) {
            tempCit.TimeLeft = '<strong>No Fuel in Citadel</strong>';
        } else {
            tempCit.TimeLeft = toHHMMSS(Date.parse((citadel['fuelExpires']).replace('T', ' '), "YYYY-MM-DD hh:ii:ss") - Date.now());
            tempCit.Date = (citadel['fuelExpires']).replace('T', ' ');
        }
        s.push(tempCit);
        if (index == (array.length - 1)) {
            callback(s);
        }
    });
}

function DeleteFit(req, res) {
    var fits = req.body.delFit.split(',');
    var DeleteQuery = "DELETE FROM fit WHERE";
    for (var i = 0; i < fits.length; i++) {
        if (i == (fits.length - 1)) {
            DeleteQuery += " fitName = '" + fits[i].trim() + "';";
        } else {
            DeleteQuery += " fitName = '" + fits[i].trim() + "' OR";
        }
    }
    connection.query(DeleteQuery, function (error, results, fields) {
        if (error) {
            console.error(error);
            return;
        }
        for (var i = 0; i < 1000; i++) {
            if (i == 999) {
                console.info('sending 200 status');
                res.end(JSON.stringify({
                    response: '200'
                }));
            }
        }
    });
}

function EditAddFit(req, res) {
    var t3;
    if (req.body.T3) {
        t3 = 1;
    } else {
        t3 = 0;
    }
    var lines = req.body.fitJson.split('\n');
    parseFit(lines, t3, function (data) {
        var UpdateQuery = "UPDATE fit SET fitJson = '" + JSON.stringify(data) + "' WHERE fitName = '" + data['FitName'] + "';";
        connection.query(UpdateQuery, function (error, results, fields) {
            if (error) {
                console.error(error);
                return;
            }
            if (results['affectedRows'] == 0) {
                var InsertQuery = "INSERT INTO fit VALUES('" + data['FitName'] + "', '" + JSON.stringify(data) + "', '" + t3 + "');";
                connection.query(InsertQuery, function (error, results, fields) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    for (var i = 0; i < 1000; i++) {
                        if (i == 999) {
                            console.info('sending 200 status');
                            res.end(JSON.stringify({
                                response: '200'
                            }));
                        }
                    }
                });
            } else {
                for (var i = 0; i < 1000; i++) {
                    if (i == 999) {
                        console.info('sending 200 status');
                        res.end(JSON.stringify({
                            response: '200'
                        }));
                    }
                }
            }
        });
    });
}

function GetAccessCode(req, callback) {
    if (req.session.refresh_token == null) {
        var code = req.session.code;
        var options = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + GetBase64(),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'login.eveonline.com'
            },
            url: 'https://login.eveonline.com/oauth/token',
            body: 'grant_type=authorization_code&code=' + code
        }
        console.info('getting new token');
    } else {
        var options = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + GetBase64(),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'login.eveonline.com'
            },
            url: 'https://login.eveonline.com/oauth/token',
            body: 'grant_type=refresh_token&refresh_token=' + req.session.refresh_token
        }
        console.info('refreshing token');
    }
    MakeRequest(options, function (body) {
        req.session.access_token = JSON.parse(body)['access_token'];
        req.session.refresh_token = JSON.parse(body)['refresh_token'];
        console.log('refresh_token: ' + req.session.refresh_token);
        var options = {
            method: 'GET',
            headers: {
                'User-Agent': 'rusherz ieatrusherz34@gmail.com',
                'Authorization': 'Bearer ' + req.session.access_token,
                'Host': 'login.eveonline.com'
            },
            url: 'https://login.eveonline.com/oauth/verify'
        }
        MakeRequest(options, function (body) {

            req.session.charId = JSON.parse(body)['CharacterID'];
            var SQL = "SELECT * FROM admins WHERE CharId = '" + req.session.charId + "';";
            connection.query(SQL, function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return;
                }
                if (results.length != 0)
                    req.session.admin = true;
                callback();
            });
        });
    });
}

function GetBase64() {
    return new Buffer(ClientId + ':' + Secret).toString('base64');
}

function HtmlString(callback) {
    var fits = [];
    var SendFits = [];
    var ItemIndex = 0;
    var s = '';
    var html = new Array();
    connection.query("SELECT fitJson FROM fit;", function (error, results, fields) {
        if (error) {
            console.error(error);
            return;
        }
        if (results.length == 0) {
            var htmlstring = '<center><h2>No fits currently added.</h2></center>';
            html.push(htmlstring);
            callback(html);
        }
        for (var i = 0; i < results.length; i++) {
            fits.push(JSON.parse(results[i]['fitJson']));
            if (i == (results.length - 1)) {
                fits.forEach(function (fit, index1) {
                    s = 'SELECT * FROM Skills WHERE';
                    var emptyFirstSlot = false;
                    s += ' ItemName = "' + fit.ShipName + '" OR';
                    fit.LowSlot.forEach(function (item, index2) {
                        if (item == '[Empty Low slot]') {
                            return;
                        }
                        if (index2 == 0 && !emptyFirstSlot) {
                            s += ' ItemName = "' + item + '"';
                        } else {
                            s += ' OR ItemName = "' + item + '"';
                        }
                    });
                    fit.MidSlot.forEach(function (item) {
                        if (item == '[Empty Mid slot]') {
                            return;
                        }
                        s += ' OR ItemName = "' + item + '"';
                    });
                    fit.HighSlot.forEach(function (item) {
                        if (item == '[Empty High slot]') {
                            return;
                        }
                        s += ' OR ItemName = "' + item + '"';
                    });
                    if (fit.ShipName == 'Proteus' || fit.ShipName == 'Legion' || fit.ShipName == 'Loki' || fit.ShipName == 'Tengu') {
                        fit.Mods.forEach(function (item) {
                            s += ' OR ItemName = "' + item + '"';
                        });
                    }
                    fit.RigSlot.forEach(function (item) {
                        if (item == '[Empty Rig slot]') {
                            return;
                        }
                        s += ' OR ItemName = "' + item + '"';
                    });
                    s += ';';
                    connection.query(s, function (error, results, fields) {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        var FitTemplate = {
                            FitName: fit.FitName,
                            FitId: fit.FitName.replace(' ', ''),
                            item: [

                            ]
                        };
                        SkillTest(results, fit.ShipName, false, function (data) {
                            data.ItemIndex = ItemIndex;
                            ItemIndex++;
                            FitTemplate.item.push(data);
                        });
                        fit.LowSlot.forEach(function (item) {
                            if (item == '[Empty Low slot]') {
                                return;
                            }
                            SkillTest(results, item, false, function (data) {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        fit.MidSlot.forEach(function (item) {
                            if (item == '[Empty Mid slot]') {
                                return;
                            }
                            SkillTest(results, item, false, function (data) {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        fit.HighSlot.forEach(function (item) {
                            if (item == '[Empty High slot]') {
                                return;
                            }
                            SkillTest(results, item, false, function (data) {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        fit.RigSlot.forEach(function (item) {
                            if (item == '[Empty Rig slot]') {
                                return;
                            }
                            SkillTest(results, item, true, function (data) {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        if (fit.ShipName == 'Proteus' || fit.ShipName == 'Legion' || fit.ShipName == 'Loki' || fit.ShipName == 'Tengu') {
                            fit.Mods.forEach(function (item) {
                                SkillTest(results, item, false, function (data) {
                                    data.ItemIndex = ItemIndex;
                                    ItemIndex++;
                                    FitTemplate.item.push(data);
                                });
                            });
                        }
                        SendFits.push(FitTemplate);
                        if (SendFits.length == fits.length) {
                            callback(SendFits);
                        }
                    });
                });
            }
        }
    });
}

function MakeRequest(options, callback) {
    request(options, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        callback(body);
    });
}

function parseFit(lines, t3, callback) {
    var fit;
    if (t3 == 1) {
        fit = {
            "FitName": "",
            "ShipName": "",
            "LowSlot": [],
            "MidSlot": [],
            "HighSlot": [],
            "RigSlot": [],
            "Mods": [],
            "Cargo": []
        }
    } else {
        fit = {
            "FitName": "",
            "ShipName": "",
            "LowSlot": [],
            "MidSlot": [],
            "HighSlot": [],
            "RigSlot": [],
            "Cargo": []
        }
    }
    var space = 0;
    lines.forEach((line, index, array) => {
        if (line != '') {
            if (space == 0) {
                var temp = line.replace('[', '').replace(']', '').split(', ');
                fit.FitName = temp[1];
                fit.ShipName = temp[0];
            } else if (space == 1) {
                fit.LowSlot.push((line.split(', '))[0]);
            } else if (space == 2) {
                fit.MidSlot.push((line.split(', '))[0]);
            } else if (space == 3) {
                fit.HighSlot.push((line.split(', '))[0]);
            } else if (space == 4) {
                fit.RigSlot.push((line.split(', '))[0]);
            } else if (t3 && space == 5) {
                fit.Mods.push((line.split(', '))[0]);
            } else {
                fit.Cargo.push((line.split(', '))[0]);
            }
        } else {
            space++;
        }
        if (index == (array.length - 1)) {
            callback(fit);
        }
    });

}

function SkillTest(results, item, rigSlot, callback) {
    var itemTemplate = {
        ItemName: item,
        ItemIndex: '0',
        HasSkill: '',
        Skills: [

        ]
    };
    var hasSkills = true;
    var foundSkill = false;
    if (!rigSlot) {
        results.forEach((result, index, array) => {
            if (result.ItemName != item)
                return;
            skillList.forEach((skill, index2, array2) => {
                if (skill['skill_id'] == result.SkillId) {
                    foundSkill = true;
                    if (hasSkills == true && skill['current_skill_level'] >= result.SkillLevel) {
                        hasSkills = true;
                    } else {
                        hasSkills = false;
                    }
                }
                if (index2 == (array2.length - 1)) {
                    var temp = {
                        'SkillName': result.SkillName,
                        'SkillLevel': result.SkillLevel,
                    };
                    itemTemplate.Skills.push(temp);
                }
            });
        });
        if (hasSkills == true && foundSkill == true) {
            itemTemplate.HasSkill = 'glyphicon-ok';
        } else {
            itemTemplate.HasSkill = 'glyphicon-remove';
        }
    } else {
        itemTemplate.HasSkill = 'glyphicon-ok';
    }
    callback(itemTemplate);
}

function toHHMMSS(time) {
    var seconds = Math.floor((time / 1000) % 60);
    var minutes = Math.floor((time / 1000 / 60) % 60);
    var hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    var days = Math.floor(time / (1000 * 60 * 60 * 24));

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds';
}
