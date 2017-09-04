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
    // Text Message
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-use-default-message-handler
    session.send("Hello Bot!");

    // Getting the message sent by the user
    session.send("Message Received: %s", session.message.text);

    // Message with attachment(s)
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-receive-attachments
    session.send({
        text: "This is a message with an image attachment.",

        attachments: [
            {
                contentType: "image/jpeg",
                contentUrl: "https://secure.meetupstatic.com/photos/event/a/c/d/8/600_456464248.jpeg",
                name: "Simple Image Attachment"
            }
        ]
    });

    // Getting the attachments sent by the user
    var attachments = session.message.attachments;
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

    // Message with Cards attachments
    // More info here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards
    var heroCard = new builder.HeroCard(session)
        .title("This is a Hero Card!")
        .subtitle("And I'm glad to be here!")
        .text("Hello Bots")
        .images([builder.CardImage.create(session, "https://secure.meetupstatic.com/photos/event/a/c/d/8/600_456464248.jpeg")])
        .buttons([builder.CardAction.imBack(session, "I love you bot", "Answer my request")]);

    var messageWithHeroCard = new builder.Message(session);
    messageWithHeroCard.addAttachment(heroCard);

    session.send(messageWithHeroCard);

    // Message with a carousel of cards
    var card1 = new builder.HeroCard(session)
        .title("Card 1")
        .subtitle("This is the first card.")
        .text("Hello cards!")
        .images([builder.CardImage.create(session, "https://secure.meetupstatic.com/photos/event/a/c/d/8/600_456464248.jpeg")])
        .buttons([builder.CardAction.imBack(session, "I clicked in the card 1", "Click me")]);

    var card2 = new builder.HeroCard(session)
        .title("Card 2")
        .subtitle("This is the second card.")
        .text("Hello cards!")
        .images([builder.CardImage.create(session, "https://tctechcrunch2011.files.wordpress.com/2016/04/facebook-chatbots.png?w=738")])
        .buttons([builder.CardAction.imBack(session, "I clicked in the card 2", "Click me")]);

    var messageWithCarousel = new builder.Message(session);
    messageWithCarousel.attachmentLayout(builder.AttachmentLayout.carousel)
    messageWithCarousel.attachments([
        card1,
        card2
    ]);

    session.send(messageWithCarousel);

    // Sending Suggested actions
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-suggested-actions
    var msg = new builder.Message(session)
        .text("What is the color that you like the most?")
        .suggestedActions(
        builder.SuggestedActions.create(
            session, [
                builder.CardAction.imBack(session, "green", "Green"),
                builder.CardAction.imBack(session, "blue", "Blue"),
                builder.CardAction.imBack(session, "red", "Red")
            ]
        ));
    session.send(msg);

    // Sending the "typing indicator" and stopping it after 3 seconds.
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-typing-indicator
    session.sendTyping();
    setTimeout(function () {
        session.send("Sorry, I was typing...");
    }, 3000);
});