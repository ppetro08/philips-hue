var express = require('express');
var app = express();
var fs = require("fs");

var hue = require("node-hue-api");
var hueApi = require("node-hue-api").HueApi;

var hueUsername;
var lightStateOn = hue.lightState.create().on();
var lightStateOff = hue.lightState.create().off();

var getApi = function () {
    return hue.nupnpSearch().then(function (results) {
        return new hueApi(results[0].ipaddress, hueUsername);
    });
}

var setLightState = function (api, state, lightNames) {
    api.lights(function (err, lights) {
        for (var light of lights["lights"]) {
            if (!lightNames || (lightNames && lightNames.indexOf(light.name) > -1)) {
                api.setLightState(light["id"], state);
            }
        }
    });
}

var turnAllLightsOn = function (api) {
    setLightState(api, lightStateOn);
    return api;
}

var turnAllLightsOff = function (api) {
    setLightState(api, lightStateOff);
    return api;
}

var turnLivingRoomLightsOn = function (api) {
    setLightState(api, lightStateOn, ["Fireplace 1", "Fireplace 2"]);
    return api;
}

app.get('/lightson', function (req, res) {
    getApi().then(turnAllLightsOn).done();
    res.end();
})

app.get('/lightsoff', function (req, res) {
    getApi().then(turnAllLightsOff).done();
    res.end();
})

app.get('/livingroomlightson', function (req, res) {
    getApi().then(turnLivingRoomLightsOn).done();
    res.end();
})

var server = app.listen(38085, function () {
    fs.readFile(`${__dirname}/auth/hue-auth.txt`, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            hueUsername = data.trim();
        } else {
            console.log(err);
        }
    });
})