var apiai = require('apiai');

var app = apiai("14c70f1f52ed4a7fa7fe1414eee274ff");

var qweather = require('../src/weather');
var wastebin = require('../src/waste-wizard');
var purge = require('../src/slack-files');
var findUser = require('../src/findUser');
var loremIpsum = require('lorem-ipsum');

module.exports = function (robot) {
  robot.respond('', function (bot) {
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

    request.on('response', function (airesponse) {
      var result = airesponse.result;
      console.log(result);
      if (result.action.indexOf('smalltalk') !== -1) {
        bot.send(result.fulfillment.speech);
      } else {
        switch (result.action) {
          case 'getWasteBin':
            if (!result.parameters.item) {
              bot.reply("Could you tell me what you want to throw?");
              break;
            }
            wastebin.suggestItem(result.parameters.item, function (err, resp) {
              if (err) {
                console.log(err);
                bot.reply("Sorry I can't find the bin. Ask something else.");
              } else {
                var text = "";
                var i = 0;
                var attachments = [];
                var reply_with_attachments = {
                  'text': ''
                };
                if (!resp.bins || resp.bins.length === 0) {
                  bot.reply("Sorry I can't find the bin. Ask something else.");
                  return;
                }
                resp.bins = resp.bins.slice(0, 5);
                resp.bins.forEach(function (bin) {

                  if (!bin.error && bin.data.bin) {
                    var template = {
                      "fallback": "",
                      "color": "",
                      "pretext": "",
                      "text": ""
                    };
                    template.fallback = "_" + bin.data.name + "_" + " : " + "*" + bin.data.bin + "*" + "\n";
                    template.pretext = bin.data.name;
                    template.text = bin.data.bin;
                    if (bin.data.special_instruction) {
                      template.fields = [
                        {
                          "title": "Special Instruction",
                          "value": bin.data.special_instruction,
                          "short": false
                        }
                      ]
                    }
                    if (bin.data.bin.toLowerCase().indexOf('green') !== -1) {
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
                  if (i === resp.bins.length) {
                    reply_with_attachments.text = "Check the appropriate bin below!";
                    var pretext = "";
                    if (resp.suggestions.length > 0) {
                      pretext = "More suggestions: "
                    }
                    var template = {
                      "fallback": "_More suggestions_ : *" + resp.suggestions.join(", ") + "*",
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
          case 'deleteFiles':
            bot.send(result.fulfillment.speech);
            var user = bot.message.user;
            purge.purgeFiles(user, function (err, res) {
              if (err) bot.reply("Something went wrong!");
              else bot.reply("All of your files have been cleared. Yay!");
            });
            break;
          case 'callOut':
            var person = result.parameters['given-name'];
            var action = result.parameters['action'];
            robot.messageRoom('#qbot-channel', "Hey @" + findUser(person.toLowerCase()) + "! You've been called out for " + action);
            break;
          case 'generateIpsum':
            var output = loremIpsum({
              count: result.parameters.number     // Number of words, sentences, or paragraphs to generate.
              , units: 'paragraphs'            // Generate words, sentences, or paragraphs.
              , sentenceLowerBound: 5         // Minimum words per sentence.
              , sentenceUpperBound: 15        // Maximum words per sentence.
              , paragraphLowerBound: 3        // Minimum sentences per paragraph.
              , paragraphUpperBound: 7        // Maximum sentences per paragraph.
              , format: 'plain'               // Plain text or html
              , words: [
                "lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit", "ut", "aliquam,", "purus", "sit", "amet", "luctus", "venenatis,", "lectus", "magna", "fringilla", "urna,", "porttitor", "rhoncus", "dolor", "purus", "non", "enim", "praesent", "elementum", "facilisis", "leo,", "vel", "fringilla", "est", "ullamcorper", "eget", "nulla", "facilisi", "etiam", "dignissim", "diam", "quis", "enim", "lobortis", "scelerisque", "fermentum", "dui", "faucibus", "in", "ornare", "quam", "viverra", "orci", "sagittis", "eu", "volutpat", "odio", "facilisis", "mauris", "sit", "amet", "massa", "vitae", "tortor", "condimentum", "lacinia", "quis", "vel", "eros", "donec", "ac", "odio", "tempor", "orci", "dapibus", "ultrices", "in", "iaculis", "nunc", "sed", "augue", "lacus,", "viverra", "vitae", "congue", "eu,", "consequat", "ac", "felis", "donec", "et", "odio", "pellentesque", "diam", "volutpat", "commodo", "sed", "egestas", "egestas", "fringilla", "phasellus", "faucibus", "scelerisque", "eleifend", "donec", "pretium", "vulputate", "sapien", "nec", "sagittis", "aliquam", "malesuada", "bibendum", "arcu", "vitae", "elementum",
                "curabitur", "vitae", "nunc", "sed", "velit", "dignissim", "sodales", "ut", "eu", "sem", "integer", "vitae", "justo", "eget", "magna", "fermentum", "iaculis", "eu", "non", "diam", "phasellus", "vestibulum", "lorem", "sed", "risus", "ultricies", "tristique", "nulla", "aliquet", "enim", "tortor,", "at", "auctor", "urna", "nunc", "id", "cursus", "metus", "aliquam", "eleifend", "mi", "in", "nulla", "posuere", "sollicitudin", "aliquam", "ultrices", "sagittis", "orci,", "a", "scelerisque", "purus", "semper", "eget", "duis", "at", "tellus", "at", "urna", "condimentum", "mattis", "pellentesque", "id", "nibh", "tortor,", "id", "aliquet", "lectus", "proin", "nibh", "nisl,", "condimentum", "id", "venenatis", "a,", "condimentum", "vitae", "sapien", "pellentesque", "habitant", "morbi", "tristique", "senectus", "et", "netus", "et", "malesuada", "fames", "ac", "turpis", "egestas", "sed", "tempus,", "urna", "et", "pharetra", "pharetra,", "massa", "massa", "ultricies", "mi,", "quis", "hendrerit", "dolor", "magna", "eget", "est", "lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit", "pellentesque", "habitant", "morbi", "tristique", "senectus", "et", "netus", "et", "malesuada", "fames", "ac", "turpis", "egestas", "integer", "eget", "aliquet", "nibh", "praesent", "tristique", "magna", "sit", "amet", "purus", "gravida", "quis", "blandit", "turpis", "cursus", "in", "hac", "habitasse", "platea", "dictumst", "quisque", "sagittis,", "purus", "sit", "amet", "volutpat", "consequat,", "mauris", "nunc", "congue", "nisi,", "vitae", "suscipit", "tellus", "mauris", "a", "diam",
                "maecenas", "sed", "enim", "ut", "sem", "viverra", "aliquet", "eget", "sit", "amet", "tellus", "cras", "adipiscing", "enim", "eu", "turpis", "egestas", "pretium", "aenean", "pharetra,", "magna", "ac", "placerat", "vestibulum,", "lectus", "mauris", "ultrices", "eros,", "in", "cursus", "turpis", "massa", "tincidunt", "dui", "ut", "ornare", "lectus", "sit", "amet", "est", "placerat", "in", "egestas", "erat", "imperdiet", "sed", "euismod", "nisi", "porta", "lorem", "mollis", "aliquam", "ut", "porttitor", "leo", "a", "diam", "sollicitudin", "tempor", "id", "eu", "nisl", "nunc", "mi", "ipsum,", "faucibus", "vitae", "aliquet", "nec,", "ullamcorper", "sit", "amet", "risus", "nullam", "eget", "felis", "eget", "nunc", "lobortis", "mattis", "aliquam", "faucibus", "purus", "in", "massa", "tempor", "nec", "feugiat", "nisl", "pretium", "fusce", "id", "velit", "ut", "tortor", "pretium", "viverra", "suspendisse", "potenti", "nullam", "ac", "tortor", "vitae", "purus", "faucibus", "ornare", "suspendisse", "sed", "nisi", "lacus,", "sed", "viverra", "tellus", "in", "hac", "habitasse", "platea", "dictumst", "vestibulum", "rhoncus", "est", "pellentesque", "elit", "ullamcorper", "dignissim", "cras", "tincidunt", "lobortis", "feugiat", "vivamus", "at", "augue", "eget", "arcu", "dictum", "varius", "duis", "at", "consectetur", "lorem",
                "donec", "massa", "sapien,", "faucibus", "et", "molestie", "ac,", "feugiat", "sed", "lectus", "vestibulum", "mattis", "ullamcorper", "velit", "sed", "ullamcorper", "morbi", "tincidunt", "ornare", "massa,", "eget", "egestas", "purus", "viverra", "accumsan", "in", "nisl", "nisi,", "scelerisque", "eu", "ultrices", "vitae,", "auctor", "eu", "augue", "ut", "lectus", "arcu,", "bibendum", "at", "varius", "vel,", "pharetra", "vel", "turpis", "nunc", "eget", "lorem", "dolor,", "sed", "viverra", "ipsum", "nunc", "aliquet", "bibendum", "enim,", "facilisis", "gravida", "neque", "convallis", "a", "cras", "semper", "auctor", "neque,", "vitae", "tempus", "quam", "pellentesque", "nec", "nam", "aliquam", "sem", "et", "tortor", "consequat", "id", "porta", "nibh", "venenatis", "cras", "sed", "felis", "eget", "velit", "aliquet", "sagittis", "id", "consectetur", "purus", "ut", "faucibus", "pulvinar", "elementum", "integer", "enim", "neque,", "volutpat", "ac", "tincidunt", "vitae,", "semper", "quis", "lectus", "nulla", "at", "volutpat", "diam", "ut", "venenatis", "tellus", "in", "metus", "vulputate", "eu", "scelerisque", "felis", "imperdiet", "proin", "fermentum", "leo", "vel", "orci", "porta", "non", "pulvinar", "neque", "laoreet", "suspendisse", "interdum", "consectetur", "libero,", "id", "faucibus", "nisl", "tincidunt", "eget", "nullam", "non", "nisi", "est,", "sit", "amet", "facilisis", "magna",
                "etiam", "tempor,", "orci", "eu", "lobortis", "elementum,", "nibh", "tellus", "molestie", "nunc,", "non", "blandit", "massa", "enim", "nec", "dui", "nunc", "mattis", "enim", "ut", "tellus", "elementum", "sagittis", "vitae", "et", "leo", "duis", "ut", "diam", "quam", "nulla", "porttitor", "massa", "id", "neque", "aliquam", "vestibulum", "morbi", "blandit", "cursus", "risus,", "at", "ultrices", "mi", "tempus", "imperdiet", "nulla", "malesuada", "pellentesque", "elit", "eget", "gravida", "cum", "sociis", "natoque", "penatibus", "et", "magnis", "dis", "parturient", "montes,", "nascetur", "ridiculus", "mus", "mauris", "vitae", "ultricies", "leo", "integer", "malesuada", "nunc", "vel", "risus", "commodo", "viverra", "maecenas", "accumsan,", "lacus", "vel", "facilisis", "volutpat,", "est", "velit", "egestas", "dui,", "id", "ornare", "arcu", "odio", "ut", "sem", "nulla", "pharetra", "diam", "sit", "amet", "nisl", "suscipit", "adipiscing", "bibendum", "est", "ultricies", "integer", "quis", "auctor", "elit",
                "sed", "vulputate", "mi", "sit", "amet", "mauris", "commodo", "quis", "imperdiet", "massa", "tincidunt", "nunc", "pulvinar", "sapien", "et", "ligula", "ullamcorper", "malesuada", "proin", "libero", "nunc,", "consequat", "interdum", "varius", "sit", "amet,", "mattis", "vulputate", "enim", "nulla", "aliquet", "porttitor", "lacus,", "luctus", "accumsan", "tortor", "posuere", "ac", "ut", "consequat", "semper", "viverra", "nam", "libero", "justo,", "laoreet", "sit", "amet", "cursus", "sit", "amet,", "dictum", "sit", "amet", "justo", "donec", "enim", "diam,", "vulputate", "ut", "pharetra", "sit", "amet,", "aliquam", "id", "diam", "maecenas", "ultricies", "mi", "eget", "mauris", "pharetra", "et", "ultrices", "neque", "ornare", "aenean", "euismod", "elementum", "nisi,", "quis", "eleifend", "quam", "adipiscing", "vitae", "proin", "sagittis,", "nisl", "rhoncus", "mattis", "rhoncus,", "urna", "neque", "viverra", "justo,", "nec", "ultrices", "dui", "sapien", "eget", "mi", "proin", "sed", "libero", "enim,", "sed", "faucibus", "turpis", "in", "eu", "mi", "bibendum", "neque", "egestas", "congue", "quisque", "egestas", "diam", "in", "arcu", "cursus", "euismod", "quis", "viverra", "nibh", "cras", "pulvinar", "mattis", "nunc,", "sed", "blandit", "libero", "volutpat", "sed", "cras", "ornare", "arcu", "dui", "vivamus", "arcu", "felis,", "bibendum", "ut", "tristique", "et,", "egestas", "quis", "ipsum", "suspendisse", "ultrices", "gravida", "dictum",
                "fusce", "ut", "placerat", "orci", "nulla", "pellentesque", "dignissim", "enim,", "sit", "amet", "venenatis", "urna", "cursus", "eget", "nunc", "scelerisque", "viverra", "mauris,", "in", "aliquam", "sem", "fringilla", "ut", "morbi", "tincidunt", "augue", "interdum", "velit", "euismod", "in", "pellentesque", "massa", "placerat", "duis", "ultricies", "lacus", "sed", "turpis", "tincidunt", "id", "aliquet", "risus", "feugiat", "in", "ante", "metus,", "dictum", "at", "tempor", "commodo,", "ullamcorper", "a", "lacus", "vestibulum", "sed", "arcu", "non", "odio", "euismod", "lacinia", "at", "quis", "risus", "sed", "vulputate", "odio", "ut", "enim", "blandit", "volutpat", "maecenas", "volutpat", "blandit", "aliquam", "etiam", "erat", "velit,", "scelerisque", "in", "dictum", "non,", "consectetur", "a", "erat", "nam", "at", "lectus", "urna", "duis", "convallis", "convallis", "tellus,", "id", "interdum", "velit", "laoreet", "id", "donec", "ultrices", "tincidunt", "arcu,", "non", "sodales", "neque", "sodales", "ut", "etiam", "sit", "amet", "nisl", "purus,", "in", "mollis", "nunc",
                "sed", "id", "semper", "risus", "in", "hendrerit", "gravida", "rutrum", "quisque", "non", "tellus", "orci,", "ac", "auctor", "augue", "mauris", "augue", "neque,", "gravida", "in", "fermentum", "et,", "sollicitudin", "ac", "orci", "phasellus", "egestas", "tellus", "rutrum", "tellus", "pellentesque", "eu", "tincidunt", "tortor", "aliquam", "nulla", "facilisi", "cras", "fermentum,", "odio", "eu", "feugiat", "pretium,", "nibh", "ipsum", "consequat", "nisl,", "vel", "pretium", "lectus", "quam", "id", "leo", "in", "vitae", "turpis", "massa", "sed", "elementum", "tempus", "egestas", "sed", "sed", "risus", "pretium", "quam", "vulputate", "dignissim", "suspendisse", "in", "est", "ante", "in", "nibh", "mauris,", "cursus", "mattis", "molestie", "a,", "iaculis", "at", "erat",
                "pellentesque", "adipiscing", "commodo", "elit,", "at", "imperdiet", "dui", "accumsan", "sit", "amet", "nulla", "facilisi", "morbi", "tempus", "iaculis", "urna,", "id", "volutpat", "lacus", "laoreet", "non", "curabitur", "gravida", "arcu", "ac", "tortor", "dignissim", "convallis", "aenean", "et", "tortor", "at", "risus", "viverra", "adipiscing", "at", "in", "tellus", "integer", "feugiat", "scelerisque", "varius", "morbi", "enim", "nunc,", "faucibus", "a", "pellentesque", "sit", "amet,", "porttitor", "eget", "dolor", "morbi", "non", "arcu", "risus,", "quis", "varius", "quam", "quisque", "id", "diam", "vel", "quam", "elementum", "pulvinar", "etiam", "non", "quam", "lacus", "suspendisse", "faucibus", "interdum", "posuere", "lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit", "duis", "tristique", "sollicitudin", "nibh", "sit", "amet", "commodo", "nulla", "facilisi",
                "nullam", "vehicula", "ipsum", "a", "arcu", "cursus", "vitae", "congue", "mauris", "rhoncus", "aenean", "vel", "elit", "scelerisque", "mauris", "pellentesque", "pulvinar", "pellentesque", "habitant", "morbi", "tristique", "senectus", "et", "netus", "et", "malesuada", "fames", "ac", "turpis", "egestas", "maecenas", "pharetra", "convallis", "posuere", "morbi", "leo", "urna,", "molestie", "at", "elementum", "eu,", "facilisis", "sed", "odio", "morbi", "quis", "commodo", "odio", "aenean", "sed", "adipiscing", "diam", "donec", "adipiscing", "tristique", "risus", "nec", "feugiat", "in", "fermentum", "posuere", "urna", "nec", "tincidunt", "praesent", "semper", "feugiat", "nibh", "sed", "pulvinar", "proin", "gravida", "hendrerit", "lectus", "a", "molestie",
                "steamed har gow", "shrimp dumpling", "Wu gok", "Cha siu bao", "Lo mai gai", "baked barbecue pork bao", "Egg custard tarts", "Popular shumai", "cha siu bao", "A creamy mango pudding", "Chiu-chao fan guo", "Siu mai", "Haam sui gau", "Jiu cai bau", "Zhaliang", "Pei guen", "Lo baak gou", "Taro cake", "Deep fried pumpkin and egg-yolk ball", "vegetarian crisp spring rolls", "dried scallop and leek puff", "deep fried seaweed roll", "B.B.Q. pork puff", "Pan friend pork dumpling", "Pot sticker", "water chestnut cake", "bitter melon beef dumplings", "turnip cake", "leek dumplings", "deep fried taro turnover", "Cha siu sou", "Cheong fan", "pan fried bitter melon beef dumpling", "mango pudding", "coconut milk pudding", "black sesame soft ball", "deep fried bean curd skin rolls", "rice noodle roll", "deep fried crab claw", "soup dumpling", "cold chicken claw", "x.o. spicy rice noodle roll", "honey glazed B.B.Q. pork", "soy sauce chicken", "roast duck", "golden pumpkin fries", "soy sauce duck wings", "octopus seaweed", "sauteed string beans", "beef shank pork", "spiced salt baked octopus", "Fung zao", "Ngao yuk kau", "Pai gwut", "Ma lai go", "Do fu fa", "Shaomai", "Congee", "Shangai steam buns", "chicken feet", "mini egg tarts", "steamed sponge cake", "tofu with syrup", "Jin deui", "Chicken feet", "Potstickers", "stir fried radish cake", "Steamed Bun with Butter Cream", "hot raw fish slices porridge", "traditional steamed glutinous rice", "with zhu hao sauce", "crispy yam puff", "crispy dragon roll", "honeydew puree with sago", "deep fried garlicky fish ball", "chee cheong fun with barbecued pork", "steamed radish cake", "steamed bun with premium lotus paste", "cabbage roll", "paekuat", "quail egg shomai", "pancit canton guisado", "fookien style", "humba pao"
              ]  // Custom word dictionary. Uses dictionary.words (in lib/dictionary.js) by default.
              , random: Math.random        // A PRNG function. Uses Math.random by default
              , suffix: "\n"                   // The character to insert between paragraphs. Defaults to default EOL for your OS.
            });

            bot.reply(output);
            break;
          default:
            bot.reply("I'm sorry. I didn't quite grasp what you just said.");
        }
      }
    });

    request.on('error', function (error) {
      bot.reply("I'm sorry. I didn't quite grasp what you just said.");
    });

    request.end();
  })
};
