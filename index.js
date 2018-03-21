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

var setLightState = function (api, state) {
    api.lights(function (err, lights) {
        for (var light of lights["lights"]) {
            api.setLightState(light["id"], state);
        }
    });
}

var turnLightsOn = function (api) {
    setLightState(api, lightStateOn);
}

var turnLightsOff = function (api) {
    setLightState(api, lightStateOff);
}

app.get('/lightson', function (req, res) {
    getApi().then(turnLightsOn).done();
    res.end();
})

app.get('/lightsoff', function (req, res) {
    getApi().then(turnLightsOff).done();
    res.end();
})

var server = app.listen(38085, function () {
    fs.readFile("./auth/hue-auth.txt", {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            hueUsername = data.trim();
        } else {
            console.log(err);
        }
    });
})