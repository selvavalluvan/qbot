var Slack = require("slack-node");
var async = require("async");
var config = require("config");

exports.purgeFiles = function (user, callback) {

  // TOKEN TEAM
  var tokens = [
    config.get("slack.token")
  ];

  // FOR EVERY TOKEN OF THE TEAM
  async.each(tokens, function(token, callback) {

    var slack = new Slack(token);

    async.waterfall([
      function(callback) {
        // IT FINDS THE NUMBER OF PAGES (FILES ARE PAGINATED)
        slack.api("files.list", { user: user }, function(err, response) {
          var pages = response.paging.pages;
          callback(null, pages);
        });
      },
      function(pages, callback) {
        // FOR EVERY PAGE
        async.times(pages, function(n, next) {
          slack.api("files.list", { page: n + 1, user: user }, function(err, response) {

            // FOR EVERY FILE FOUND
            async.each(response.files, function(element, cb) {
              slack.api("files.delete", { file: element.id } , function(err, response) {
                console.log(1);
                cb();
              });

            }, function(err) {
              callback();
            });
          });
        }, function(err, files) {
          console.log(2);
          callback();
        });
      }
    ], function (err, result) {
      console.log(3);
      callback();
    });

  }, function(err) {

    if(err) {
      callback("Token Error!",  null)
    } else {
      callback(null,  "ok")
    }
  });
};
