var express = require('express');
var path = require('path');
var request = require('request');

var app = express();
var access_token;

app.get('/', function (req, res) {
    res.redirect('https://login.eveonline.com/oauth/authorize/?response_type=code' +
        '&redirect_uri=http://127.0.0.1:3000/callback&client_id=e0b65052339e436c8a53444e7174ee59' +
        '&scope=esi-mail.read_mail.v1&state=uniquestate123');
});

app.get('/skills', function (req, res) {

});

app.get('/callback', function (req, res) {
    var code = req.query.code;
    var options = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + new Buffer('e0b65052339e436c8a53444e7174ee59:8WPWy6xpltKgXDG7j5Dsko8Jx0SU2RoKzB3UTLfC').toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'login.eveonline.com'
        },
        url: 'https://login.eveonline.com/oauth/token',
        body: 'grant_type=authorization_code&code=' + code
    }
    MakeRequest(options, function (body) { // GET ACCESS TOKEN
        access_token = JSON.parse(body)['access_token'];
        var options = {
            method: 'GET',
            headers: {
                'User-Agent': 'rusherz ieatrusherz34@gmail.com',
                'Authorization': 'Bearer ' + access_token,
                'Host': 'login.eveonline.com'
            },
            url: 'https://login.eveonline.com/oauth/verify'
        }
        MakeRequest(options, function (body) { // GET CHARACTER ID
            var options = {
                method: 'GET',
                headers: {
                    'User-Agent': 'rusherz ieatrusherz34@gmail.com',
                    'Authorization': 'Bearer ' + access_token,
                    'Host': 'esi.tech.ccp.is'
                },
                url: 'https://esi.tech.ccp.is/latest/characters/' + JSON.parse(body)['CharacterID'] + '/mail/'
            }
            MakeRequest(options, function (body) { // GET MAIL
                res.send(body);
            });
        });
    });
});

app.listen(3000, function (error) {
    if (error) {
        console.error(error);
        return;
    }
    console.log('server started on port 3000');
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
