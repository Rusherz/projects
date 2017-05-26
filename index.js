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
                    '&scope=esi-skills.read_skills.v1&state=uniquestate123';
            }
        });
    } else {
        // PRODUCTION
        ClientId = '377645b262b34c87a68bce8963ae2847';
        Secret = 'LNZsrtvVaSWzvkXjss3YRiSrhv7AIMhvJAfO58Gf';
        url = 'https://login.eveonline.com/oauth/authorize/?response_type=code' +
            '&redirect_uri=http://auth.sudden-impact.online:3000/callback&client_id=377645b262b34c87a68bce8963ae2847' +
            '&scope=esi-skills.read_skills.v1&state=uniquestate123';
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

app.get('/', function (req, res) {
    req.session.admin = false;
    res.redirect(url);
});

app.get('/fits', function (req, res) {
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

app.post('/editfitlist', function (req, res) {
    if (req.method != 'POST')
        return;
    if (req.body.method == 'edit') {
        EditAddFit(req, res)
    } else if (req.body.method == 'delete') {
        DeleteFit(req, res);
    }
});

app.get('/skill', function (req, res) {
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
            HtmlString(function (html) {
                res.render('skills', {
                    admin: req.session.admin,
                    skill: html
                });
            })
        });
    });
});

app.get('/switchchar', function (req, res) {
    req.session.admin = false;
    req.session.refresh_token = null;
    res.redirect('/');
});

app.get('/callback', function (req, res) {
    if (req.session.refrresh_token == null)
        req.session.code = req.query.code;
    res.redirect('/skill');
});

app.listen(3000, function (error) {
    if (error) {
        console.error(error);
        return;
    }
    console.info('server started on port 3000');
});

function MakeRequest(options, callback) {
    request(options, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        callback(body);
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

function HtmlString(callback) {
    var fits = [];
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

                        var htmlstring = '<div class="col-sm-6">'
                        htmlstring += '<div data-role="collapsible">';
                        htmlstring += '<h4>' + fit.FitName + '</h4>';
                        htmlstring += '<ul data-role="listview">';
                        StringFormat(results, fit.ShipName, false, function (data) {
                            htmlstring += data;
                        });
                        fit.LowSlot.forEach(function (item) {
                            if (item == '[Empty Low slot]') {
                                return;
                            }
                            StringFormat(results, item, false, function (data) {
                                htmlstring += data;
                            });
                        });
                        fit.MidSlot.forEach(function (item) {
                            if (item == '[Empty Mid slot]') {
                                return;
                            }
                            StringFormat(results, item, false, function (data) {
                                htmlstring += data;
                            });
                        });
                        fit.HighSlot.forEach(function (item) {
                            if (item == '[Empty High slot]') {
                                return;
                            }
                            StringFormat(results, item, false, function (data) {
                                htmlstring += data;
                            });
                        });
                        fit.RigSlot.forEach(function (item) {
                            if (item == '[Empty Rig slot]') {
                                return;
                            }
                            StringFormat(results, item, true, function (data) {
                                htmlstring += data;
                            });
                        });
                        if (fit.ShipName == 'Proteus' || fit.ShipName == 'Legion' || fit.ShipName == 'Loki' || fit.ShipName == 'Tengu') {
                            fit.Mods.forEach(function (item) {
                                StringFormat(results, item, false, function (data) {
                                    htmlstring += data;
                                });
                            });
                        }
                        htmlstring += '</ul></div></div>';
                        html.push(htmlstring);
                        if (html.length == fits.length) {
                            callback(html);
                        }
                    });
                });
            }
        }
    });
}

function StringFormat(results, item, rigSlot, callback) {
    var htmlhead = '';
    var htmlstring = '';
    htmlstring += 'Item: ' + item;
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
                    htmlstring += '<ul>' +
                        '<li>Skill Name: ' + result.SkillName + '</li>' +
                        '<li>Skill level needed: ' + result.SkillLevel + '</li>' +
                        '</ul>';
                }
            });
        });
        if (hasSkills == true && foundSkill == true) {
            htmlstring = '<li><a href="#" style="color: green" class="ui-btn">' + htmlstring;
        } else {
            htmlstring = '<li><a href="#" style="color: red" class="ui-btn">' + htmlstring;
        }
    } else {
        htmlstring = '<li><a href="#" style="color: green" class="ui-btn">' + htmlstring;
    }
    htmlstring += '</a></li>';
    callback(htmlstring);
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

function GetBase64() {
    return new Buffer(ClientId + ':' + Secret).toString('base64');
}
