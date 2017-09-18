var Giphy = require("giphy-api");

var giphy = new Giphy("lzyXND3WR1tGmeulCpPX1KPDVpuJaP2S"); // Temporary key, will be deleted soon ;)

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
    session.beginDialog("menu");
});

bot.dialog("menu", [
    function (session) {
        var menuOptions = ["Search GIFs", "Trending GIFs"];

        builder.Prompts.choice(session, "What you want to do today?", menuOptions, { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        var selectedIndex = results.response.index;
        if (selectedIndex == 0) {
            session.beginDialog("search");
        } else if (selectedIndex == 1) {
            session.beginDialog("trending");
        }
    },
    function (session) {
        builder.Prompts.confirm(session, "Do you want to see the menu options again?");
    },
    function (session, results) {
        if (results.response) {
            session.replaceDialog("menu");
        } else {
            session.endConversation("OK, just ping me if you need something.")
        }
    }
]);

bot.dialog("search", [
    function (session) {
        builder.Prompts.text(session, "What do you want to search?");
    },
    function (session, results) {
        session.sendTyping();

        var queryText = results.response;

        giphy.search({ q: queryText, limit: 10 })
            .then(function (results) {
                var cardsArray = createCardsArrayFromGiphyApiResults(session, results);

                if (cardsArray.length > 0) {
                    var messageWithCarousel = new builder.Message(session)
                        .text("Here are the results of your search:")
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(cardsArray);

                    session.send(messageWithCarousel);
                }
                else {
                    session.send("Ooops, it seems that there is no gifs for '%s'", queryText);
                }

                session.endDialog();
            })
            .catch(function (error) {
                session.send("Failed to query '%s' on Giphy. Please try again later...", queryText);
                session.endDialog();
            });
    }
]);

bot.dialog("trending", [
    function (session) {
        session.sendTyping();

        giphy.trending({ limit: 10, fmt: 'json' })
            .then(function (results) {
                var cardsArray = createCardsArrayFromGiphyApiResults(session, results);

                if (cardsArray.length > 0) {
                    var messageWithCarousel = new builder.Message(session)
                        .text("Here are the trending GIFs:")
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(cardsArray);

                    session.send(messageWithCarousel);
                }
                else {
                    session.send("Ooops, no trending gifs for today.");
                }

                session.endDialog();
            })
            .catch(function (error) {
                session.send("Failed to get the trending gifs on Giphy. Please try again later...");
                session.endDialog();
            });
    }
]);

function createCardsArrayFromGiphyApiResults(session, results) {
    var gifs = results.data;
    var cardsArray = [];

    if (gifs && gifs.length > 0) {
        for (var i = 0; i < gifs.length; i++) {
            var gif = gifs[i];

            var card = createCardFromGif(session, gif);
            cardsArray.push(card);
        }
    }

    return cardsArray;
}

function createCardFromGif(session, gif) {
    var giphyUrl = gif.url;
    var imageUrl = gif.images.fixed_height_downsampled.url;

    var card = new builder.HeroCard(session)
        .images([builder.CardImage.create(session, imageUrl)])
        .buttons([builder.CardAction.openUrl(session, giphyUrl, "Open in Giphy")]);

    return card;
}