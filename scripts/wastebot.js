// Description:
//   waste management script
//
// Commands:
//   hubot throw paper cup - Responds with list of matched items with bins and more suggestions

var wastebin = require('../src/waste-wizard');

module.exports = function(robot) {
  robot.respond(/throw/i, function (bot) {
    var text = bot.message.text.substr(bot.message.text.indexOf(" ") + 1);
    var item = text.match(/^throw(.*)/)[1];
    if(item.length === 0){
      bot.reply("Sorry, I can't understand what you said. Please check `help`");
      return;
    }
    bot.reply("thinking...");

    wastebin.suggestItem(item, function (err, resp) {
      if(err) {
        console.log(err);
        bot.reply("Sorry I can't find the bin. Ask something else.");
      } else {
        var text = "";
        var i = 0;
        var attachments = [];
        var reply_with_attachments = {
          'text': ''
        };
        resp.bins.forEach(function (bin) {

          if(!bin.error && bin.data.bin){
            var template = {
              "fallback": "",
              "color": "",
              "pretext": "",
              "text": ""
            };
            template.fallback = "_" + bin.data.name + "_" + " : " + "*" + bin.data.bin + "*" + "\n";
            template.pretext = bin.data.name;
            template.text = bin.data.bin;
            if(bin.data.special_instruction) {
              template.fields = [
                {
                  "title": "Special Instruction",
                  "value": bin.data.special_instruction,
                  "short": false
                }
              ]
            }
            if(bin.data.bin.toLowerCase().indexOf('green') !== -1){
              template.color = "#36a64f"
            } else if (bin.data.bin.toLowerCase().indexOf('garbage') !== -1) {
              template.color = "#000"
            } else if (bin.data.bin.toLowerCase().indexOf('recycle') !== -1) {
              template.color = "#00a1f2"
            } else if (bin.data.bin.toLowerCase().indexOf('compost') !== -1) {
              template.color = "#8B4513"
            } else {
              template.color = "#A16EFF"
            }

            attachments.push(template);
            // text += "_" + bin.data.name + "_" + " : " + "*" + bin.data.bin + "*" + "\n"
          }
          i++;
          if(i === resp.bins.length){
            reply_with_attachments.text = "Here are some suggestions.";
            var template = {
              "fallback": "_More suggestions_ : *"+resp.suggestions.join(", ")+"*",
              "pretext": "More suggestions",
              "text": resp.suggestions.join(", ")
            };
            attachments.push(template);
            reply_with_attachments.attachments = attachments;
            bot.reply(reply_with_attachments);
          }
        });
      }
    });
  });
};
