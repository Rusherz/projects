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
    connection.query(DeleteQuery, (error, results, fields) => {
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
    parseFit(lines, t3, (data) => {
        var UpdateQuery = "UPDATE fit SET fitJson = '" + JSON.stringify(data) + "' WHERE fitName = '" + data['FitName'] + "';";
        connection.query(UpdateQuery, (error, results, fields) => {
            if (error) {
                console.error(error);
                return;
            }
            if (results['affectedRows'] == 0) {
                var InsertQuery = "INSERT INTO fit VALUES('" + data['FitName'] + "', '" + JSON.stringify(data) + "', '" + t3 + "');";
                connection.query(InsertQuery, (error, results, fields) => {
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
    MakeRequest(options, (body) => {
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
        MakeRequest(options, (body) => {

            req.session.charId = JSON.parse(body)['CharacterID'];
            var SQL = "SELECT * FROM admins WHERE CharId = '" + req.session.charId + "';";
            connection.query(SQL, (error, results, fields) => {
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
    connection.query("SELECT fitJson FROM fit;", (error, results, fields) => {
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
                    fit.LowSlot.forEach((item, index2) => {
                        if (item == '[Empty Low slot]') {
                            return;
                        }
                        if (index2 == 0 && !emptyFirstSlot) {
                            s += ' ItemName = "' + item + '"';
                        } else {
                            s += ' OR ItemName = "' + item + '"';
                        }
                    });
                    fit.MidSlot.forEach((item) => {
                        if (item == '[Empty Mid slot]') {
                            return;
                        }
                        s += ' OR ItemName = "' + item + '"';
                    });
                    fit.HighSlot.forEach((item) => {
                        if (item == '[Empty High slot]') {
                            return;
                        }
                        s += ' OR ItemName = "' + item + '"';
                    });
                    if (fit.ShipName == 'Proteus' || fit.ShipName == 'Legion' || fit.ShipName == 'Loki' || fit.ShipName == 'Tengu') {
                        fit.Mods.forEach((item) => {
                            s += ' OR ItemName = "' + item + '"';
                        });
                    }
                    fit.RigSlot.forEach((item) => {
                        if (item == '[Empty Rig slot]') {
                            return;
                        }
                        s += ' OR ItemName = "' + item + '"';
                    });
                    s += ';';
                    connection.query(s, (error, results, fields) => {
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
                        SkillTest(results, fit.ShipName, false, (data) => {
                            data.ItemIndex = ItemIndex;
                            ItemIndex++;
                            FitTemplate.item.push(data);
                        });
                        fit.LowSlot.forEach((item) => {
                            if (item == '[Empty Low slot]') {
                                return;
                            }
                            SkillTest(results, item, false, (data) => {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        fit.MidSlot.forEach((item) => {
                            if (item == '[Empty Mid slot]') {
                                return;
                            }
                            SkillTest(results, item, false, (data) => {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        fit.HighSlot.forEach((item) => {
                            if (item == '[Empty High slot]') {
                                return;
                            }
                            SkillTest(results, item, false, (data) => {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        fit.RigSlot.forEach((item) => {
                            if (item == '[Empty Rig slot]') {
                                return;
                            }
                            SkillTest(results, item, true, (data) => {
                                data.ItemIndex = ItemIndex;
                                ItemIndex++;
                                FitTemplate.item.push(data);
                            });
                        });
                        if (fit.ShipName == 'Proteus' || fit.ShipName == 'Legion' || fit.ShipName == 'Loki' || fit.ShipName == 'Tengu') {
                            fit.Mods.forEach((item) => {
                                SkillTest(results, item, false, (data) => {
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
    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            return;
        }
        callback(body, response);
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
            itemTemplate.HasSkill = 'glyphicon-ok-success';
        } else {
            itemTemplate.HasSkill = 'glyphicon-remove-danger';
        }
    } else {
        itemTemplate.HasSkill = 'glyphicon-ok-success';
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