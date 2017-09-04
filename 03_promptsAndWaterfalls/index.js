//  Relevant links for this sample
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-dialog-waterfall
//      https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-dialog-prompt

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
        // Prompting a text
        builder.Prompts.text(session, "Hi! What is your name?");
    },
    function (session, results) {
        session.send("Nice to meet you, %s!", results.response);

        // Prompting a number
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

        // Prompting a choice
        builder.Prompts.choice(session, "What color do you prefer?", "red|green|blue", { listStyle: builder.ListStyle.list });
    },
    function (session, results) {
        switch (results.response.index) {
            case 0: // red
                session.send("R channel for the win!");
                break;
            case 1: // green
                session.send("I see trees of that color.");
                break;
            case 2: // green
                session.send("I'm blue Da ba dee, da ba die...");
                break;
        }

        // Prompting an yes/no answer
        builder.Prompts.confirm(session, "Are you enjoying the conversation?");
    },
    function (session, results) {
        if (results.response) {
            session.send("I'm glad that you are enjoying! :)");
        } else {
            session.send("My bad, I hope that I can serve you better next time...");
        }

        // Prompting for an attachment
        builder.Prompts.attachment(session, "Could you send me any picture, please?");
    },
    function (session, results) {
        var attachments = results.response;

        if (attachments && attachments.length > 0) {
            var attachment = attachments[0];

            session.send({
                text: "You sent the following attachment:",
                attachments: [
                    {
                        contentType: attachment.contentType,
                        contentUrl: attachment.contentUrl,
                        name: attachment.name
                    }
                ]
            });
        }

        builder.Prompts.time(session, "When is your birthday?");
    },
    function (session, results) {
        session.send("This is the date of your birthday: %s", builder.EntityRecognizer.resolveTime([results.response]));
    }
]);