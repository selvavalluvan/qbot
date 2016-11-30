var apiai = require('apiai');

var app = apiai("14c70f1f52ed4a7fa7fe1414eee274ff");

module.exports = function (robot) {
  robot.hear(/jkhdfksdhj/i, function (bot) {
    // var msg = bot.message.text.substr(("qbot ").length);
    //
    // var request = app.textRequest(msg, {
    //   sessionId: "QbotConversation"
    // });
    //
    // request.on('response', function(response) {
    //   console.log(response);
    //   bot.send(response.result.fulfillment.speech);
    // });
    //
    // request.on('error', function(error) {
    //   console.log(error);
    //   bot.send("Not ok");
    // });
    //
    // request.end();
  })
};
