var Resource = require('deployd/lib/resource');
var util = require('util');
var gcm = require('node-gcm');
var _ = require('lodash');
var async = require('async');

function dpdgcm(options) {
    Resource.apply(this, arguments);
    this.gcmsender = new gcm.Sender(this.config.APIKey);
}

util.inherits(dpdgcm, Resource);

dpdgcm.label = "GCM";
dpdgcm.events = ["post"];

dpdgcm.prototype.clientGeneration = true;

dpdgcm.basicDashboard = {
    settings: [{
        name: 'APIKey',
        type: 'string',
        description: 'API Key'
    }, {
        name: 'defaultTitle',
        type: 'string',
        description: 'Default Title'
    }]
};

dpdgcm.prototype.handle = function(ctx, next) {

    var devices;
    var title, message;

    if (ctx.body && ctx.body.devices) {
        devices = ctx.body.devices;
    }

    if (ctx.body && ctx.body.title) {
        title = ctx.body.title;
    } else {
        title = this.config.defaultTitle;
    }

    if (ctx.body && ctx.body.message) {
        message = ctx.body.message;
    }

    var msg = new gcm.Message();

    msg.delay_while_idle = false;
    msg.addData("title", title);
    msg.addData("message", message);
    msg.addData('sound', 'default');

    if (ctx.body.payload) {
        for (var key in ctx.body.payload) {
            msg.addData(key, ctx.body.payload[key]);
        }
    }

    var deviceChunks = _.chunk(devices, 1000);
    var results = [];
    var _this = this;
    async.each(deviceChunks, function(devices, callback) {
        _this.gcmsender.send(msg, devices, 5, function(err, result) {
            callback(err, result);
            if (result) {
                results.push(result);
            }
        });
    }, function(err) {
        if (err) {
            ctx.done(err);
        } else {
            ctx.done(null, results);
        }
    });

};

module.exports = dpdgcm;
