// This sample is meant to show how to create a simple echo bot.
// Relevant links for this sample:
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-concepts
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-quickstart

var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Message Received: %s", session.message.text);
});