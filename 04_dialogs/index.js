//  Relevant links for this sample:
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-dialog-overview
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-dialog-manage-conversation-flow
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-dialog-actions

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

var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.beginDialog("root");
    }
]);

bot.endConversationAction('endConversation', 'Goodbye!', { matches: /^exit/i });

bot.dialog("root", [
    function (session) {
        session.send("Hello, my name is Botbot.");
        builder.Prompts.confirm(session, "Do you want to have a conversation now?");
    },
    function (session, results) {
        if (results.response) {
            session.beginDialog("askName");
        } else {
            session.send("Ok then...");
            session.endDialog();
        }
    }
]).triggerAction({
    matches: /^begin again$/i
});

bot.dialog("askName", [
    function (session) {
        builder.Prompts.text(session, "Ok, so what is your name?");
    },
    function (session, results) {
        session.send("Nice to meet you, %s!", results.response);
        session.beginDialog("askBirthday");
    }
])

bot.dialog("askBirthday", [
    function (session) {
        builder.Prompts.number(session, "How old are you?");
    },
    function (session, results) {
        var age = results.response;

        if (age < 20) {
            session.send("Only %s years old? You are so young!", age);
        } else if (age < 50) {
            session.send("%s years old... Seems that we have a grown up here.", age);
        } else {
            session.send("%s years, finally an experienced person talking to me today.", age);
        }

        session.endDialog();
    }
]).cancelAction("cancelAction", "Ok, I won't ask your age again.", {
    matches: /^nevermind$|^cancel$|^forget$|^cancel.*conversation/i,
    confirmPrompt: "Are you sure?"
});

bot.dialog("help", [
    function (session) {
        session.send("This is a fake help!");
        session.endDialog();
    }
]).triggerAction({
    matches: /^help$/i,
    onSelectAction: (session, args, next) => {
        session.beginDialog(args.action, args);
    }
});
