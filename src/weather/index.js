var rp = require('request-promise');
var Promise = require('bluebird');

exports.getWeather = function (location) {
  var locationQuery = escape("select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "') and u='c'"),
      locationUrl = "https://query.yahooapis.com/v1/public/yql?q=" + locationQuery + "&format=json";
  return new Promise(function (resolve, reject) {
    var options = {
      uri: locationUrl,
      json: true // Automatically parses the JSON string in the response
    };

    rp(options)
      .then(function (result) {
        console.log("here");
        resolve(result);
        // if (Array.isArray(result.query.results.channel)) {
        //   var returnMessage = result.query.results.channel[0].item.title + '\n`Current` ' + result.query.results.channel[0].item.condition.temp + ' degrees, ' + result.query.results.channel[0].item.condition.text + '\n`' + result.query.results.channel[0].item.forecast[0].day + '` High: ' + result.query.results.channel[0].item.forecast[0].high + ' Low: ' + result.query.results.channel[0].item.forecast[0].low + ', ' + result.query.results.channel[0].item.forecast[0].text + '\n`' + result.query.results.channel[0].item.forecast[1].day + '` High: ' + result.query.results.channel[0].item.forecast[1].high + ' Low: ' + result.query.results.channel[0].item.forecast[1].low + ', ' + result.query.results.channel[0].item.forecast[1].text;
        //   resolve({error: null, data: returnMessage});
        // } else {
        //   var returnMessage = result.query.results.channel.item.title + '\n`Current` ' + result.query.results.channel.item.condition.temp + ' degrees, ' + result.query.results.channel.item.condition.text + '\n`' + result.query.results.channel.item.forecast[0].day + '` High: ' + result.query.results.channel.item.forecast[0].high + ' Low: ' + result.query.results.channel.item.forecast[0].low + ', ' + result.query.results.channel.item.forecast[0].text + '\n`' + result.query.results.channel.item.forecast[1].day + '` High: ' + result.query.results.channel.item.forecast[1].high + ' Low: ' + result.query.results.channel.item.forecast[1].low + ', ' + result.query.results.channel.item.forecast[1].text;
        //   resolve({error: null, data: returnMessage});
        // }
      })
      .catch(function (err) {
        console.log(err);
        reject({error: "Something went wrong!"})
      });
  });
};
