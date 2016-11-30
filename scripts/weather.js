// Description:
//   Weather around the world.
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   weather <location> - sets the word of the week

var qweather = require('../src/weather');

module.exports = function (robot) {

  robot.respond(/weather/i, function (bot) {
    var keyword = "weather";
    var location = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).trim();
    qweather.getWeather(location).then(function (response) {
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
      bot.reply("Sorry, I can't understand what you said. Please check `help`");
    });
  });
};
