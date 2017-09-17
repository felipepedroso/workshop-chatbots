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

    // Another way to send text messages
    var messageWithText = new builder.Message(session)
        .text("Hello again bot");

    session.send(messageWithText);

    // Getting the message sent by the user
    session.send("Message Received: %s", session.message.text);

    // Message with attachment(s)
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-receive-attachments
    var imageAttachment = {
        contentType: "image/jpeg",
        contentUrl: "https://secure.meetupstatic.com/photos/event/a/c/d/8/600_456464248.jpeg",
        name: "Simple Image Attachment"
    };

    var messageWithImageAttachment = new builder.Message(session)
        .text("This is a message with an image attachment.")
        .addAttachment(imageAttachment);

    session.send(messageWithImageAttachment);

    // Getting the attachments sent by the user
    var attachments = session.message.attachments;
    if (attachments && attachments.length > 0) {
        var userAttachment = attachments[0];

        var messageWithUserAttachment = new builder.Message(session)
            .text("You sent the following attachment:")
            .addAttachment(userAttachment);

        session.send(message);
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

    var cardsArray = [];

    for (var i = 0; i < 5; i++) {
        var cardIndex = i + 1;

        var card = new builder.HeroCard(session)
            .title("Card " + cardIndex)
            .subtitle("This is an awesome card.")
            .text("Hello cards!")
            .images([builder.CardImage.create(session, "https://secure.meetupstatic.com/photos/event/a/c/d/8/600_456464248.jpeg")])
            .buttons([builder.CardAction.imBack(session, "I clicked in the card " + cardIndex, "Click me")]);

        cardsArray.push(card);
    }

    var messageWithCarousel = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cardsArray);

    session.send(messageWithCarousel);

    // Sending Suggested actions
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-suggested-actions
    var colorsSuggestedActions = builder.SuggestedActions.create(
        session, [
            builder.CardAction.imBack(session, "green", "Green"),
            builder.CardAction.imBack(session, "blue", "Blue"),
            builder.CardAction.imBack(session, "red", "Red")
        ]
    );

    var messageWithSuggestedActions = new builder.Message(session)
        .text("What is the color that you like the most?")
        .suggestedActions(colorsSuggestedActions);

    session.send(messageWithSuggestedActions);

    // Sending the "typing indicator" and stopping it after 3 seconds.
    // More information here: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-typing-indicator
    session.sendTyping();
    setTimeout(function () {
        session.send("Sorry, I was typing...");
    }, 3000);
});