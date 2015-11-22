var Resource = require('deployd/lib/resource');
var util     = require('util');
var gcm      = require('node-gcm');

function dpdgcm( options ) {
    Resource.apply(this, arguments);
    this.gcmsender = new gcm.Sender(this.config.APIKey);
}

util.inherits(dpdgcm, Resource);

dpdgcm.label = "GCM";
dpdgcm.events = ["post"];

dpdgcm.prototype.clientGeneration = true;

dpdgcm.basicDashboard = {
    settings: [
        {
            name        : 'APIKey',
            type        : 'string',
            description : 'API Key'
        },
        {
            name        : 'defaultTitle',
            type        : 'string',
            description : 'Default Title'
        }
    ]
};

dpdgcm.prototype.handle = function ( ctx, next ) {

    var devices;
    var title, message;

    if(ctx.body && ctx.body.devices){
        devices = ctx.body.devices;
    }

    if(ctx.body && ctx.body.title){
        title = ctx.body.title;
    }else{
        title = this.config.defaultTitle;
    }

    if(ctx.body && ctx.body.message){
        message = ctx.body.message;
    }

    var msg = new gcm.Message();

    msg.delay_while_idle = false;
    msg.addData("title",title);
    msg.addData("message",message);

    this.gcmsender.send(msg, devices, 5, function(err, result) {
        if(err){
            ctx.done(err);
        }else{
            ctx.done(null, result);
        }
    });
};

module.exports = dpdgcm;
