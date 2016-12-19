var apiai = require('apiai');

var app = apiai("14c70f1f52ed4a7fa7fe1414eee274ff");

var qweather = require('../src/weather');
var wastebin = require('../src/waste-wizard');

module.exports = function (robot) {
  robot.hear('', function (bot) {
    if(bot.message.room === "C024GE81V"){
      return;
    }
    var msg = bot.message.text.substr(("qbot ").length);

    // if(msg.startsWith('q:/')){
    //   msg = msg.substr(("q:/").length);
    //   var commands = msg.trim().split(/\s* \s*/);
    //   if(commands[0] === 'leave'){
    //     //TODO ADD COMMAND TYPE FUNCTIONS IN HERE. LIKE REMINDERS, LEAVE CHANNELS ETC.
    //   }
    //   return;
    // }
    var request = app.textRequest(msg, {
      sessionId: "QbotConversation"
    });

    request.on('response', function(airesponse) {
      var result = airesponse.result;
      console.log(result);
      if(result.action.indexOf('smalltalk') !== -1){
        bot.send(result.fulfillment.speech);
      } else {
        switch(result.action){
          case 'getWasteBin':
            if(!result.parameters.item){
              bot.reply("Could you tell me what you want to throw?");
              break;
            }
            wastebin.suggestItem(result.parameters.item, function (err, resp) {
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
                if(!resp.bins || resp.bins.length === 0){
                  bot.reply("Sorry I can't find the bin. Ask something else.");
                  return;
                }
                resp.bins= resp.bins.slice(0, 5);
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
                    reply_with_attachments.text = "Check the appropriate bin below!";
                    var pretext = "";
                    if(resp.suggestions.length > 0){
                      pretext = "More suggestions: "
                    }
                    var template = {
                      "fallback": "_More suggestions_ : *"+resp.suggestions.join(", ")+"*",
                      "pretext": pretext,
                      "text": resp.suggestions.join(", ")
                    };
                    attachments.push(template);
                    reply_with_attachments.attachments = attachments;
                    bot.reply(reply_with_attachments);
                  }
                });
              }
            });
            break;
          case 'getWeather':
            qweather.getWeather(result.parameters).then(function (response) {
              var channel = response.query.results.channel;
              var condition = channel.item.condition;
              var units = channel.units;
              var slack_message = {
                "text": '',
                "attachments": [
                  {
                    "title": channel.title,
                    "title_link": channel.link,
                    "color": "#36a64f",

                    "fields": [
                      {
                        "title": "Condition",
                        "value": "Temp " + condition.temp +
                        " " + units.temperature,
                        "short": "false"
                      },
                      {
                        "title": "Wind",
                        "value": "Speed: " + channel.wind.speed +
                        ", direction: " + channel.wind.direction,
                        "short": "true"
                      },
                      {
                        "title": "Atmosphere",
                        "value": "Humidity " + channel.atmosphere.humidity +
                        " pressure " + channel.atmosphere.pressure,
                        "short": "true"
                      }
                    ],

                    "thumb_url": "http://l.yimg.com/a/i/us/we/52/" + condition.code + ".gif"
                  }
                ]
              };
              bot.reply(slack_message);
            }).catch(function (err) {
              console.log(err.toString());
              bot.reply("I'm sorry. I didn't quite grasp what you just said.");
            });
            break;
          default:
            bot.reply("I'm sorry. I didn't quite grasp what you just said.");
        }
      }
    });

    request.on('error', function(error) {
      bot.reply("I'm sorry. I didn't quite grasp what you just said.");
    });

    request.end();
  })
};
