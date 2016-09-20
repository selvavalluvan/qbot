var TwitterPackage = require('twitter');

var secret = {
    "consumer_secret": "9DK9tqvVhiTtPXGPIEYCWRkfOBbBRyODfnJfM3CqeMms4O8Nng",
    "consumer_key": "Hrq0yQhYKSGsGKNaqMaHbOgEA",
    "access_token_key": "749693767-BwWLxJr8bhCI2tmK0j9BbmiecHjWtoDOSaRdkRuK",
    "access_token_secret": "3JC6u2pPwgojFJwfB7skgjm9e0KsBb21xJTywPwqcbeU0"
};

var Twitter = new TwitterPackage(secret);
var stream = null;

var trackTweets = function (track, robot) {
  stream = Twitter.stream('statuses/filter', {track: track});
  stream.on('data', function(tweet) {
    robot.messageRoom('#quietly-social', "https://twitter.com/"+tweet.user.screen_name+"/status/"+tweet.id_str);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
};

var stopTrackTweets = function (bot) {
  stream.destroy();
  bot.reply("Stopped tracking live tweets.");
};


module.exports = function(robot) {
  robot.respond(/track twitter set/i, function(bot){
    var keyword = "set ";
    var track = (bot.message.text.substr(bot.message.text.indexOf(keyword) + keyword.length)).split(":");
    if(track && track.length > 0){
      trackTweets(track[0], robot);
      bot.reply("Tracking tweets for "+track);
    } else {
      bot.reply("Error setting up tracking");
    }
  });

  robot.respond(/track twitter stop/i, function(bot) {
    stopTrackTweets(bot);
  });
};
