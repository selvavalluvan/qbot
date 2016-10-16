var rp = require('request-promise');
var natural = require('natural');
var Promise = require('bluebird');

exports.suggestItem = function (item, callback) {
    var options = {
        uri: 'https://recollect.net/api/areas/Vancouver/services/waste/pages?suggest='+item+'&type=material&locale=en&accept_list=true&_='+Date.now(),
        json: true // Automatically parses the JSON string in the response
    };

    rp(options)
        .then(function (repos) {
            var wasteResponse = {
                bins: [],
                suggestions: []
            };
            var i = 0;
            if(repos.length === 0){
                callback("No suggestions", null)
            } else {
                var proms = [];
                repos.forEach(function (obj) {
                    if(natural.JaroWinklerDistance(item,obj["title"]) >= 0.5) {
                        proms.push(findBin(obj["id"]));
                    } else {
                        wasteResponse.suggestions.push(obj["title"])
                    }
                    i++;
                    if(i === repos.length){
                        Promise.all(proms).then(function (results) {
                            wasteResponse.bins = results;
                            callback(null, wasteResponse);
                        });
                    }
                });
            }
        })
        .catch(function (err) {
            callback("Something went wrong!", null)
        });
};

var findBin = function (itemId) {
    return new Promise(function (resolve, reject) {
        var options = {
            uri: 'https://recollect.net/api/areas/Vancouver/services/waste/pages/en/'+itemId+'.json?_='+Date.now(),
            json: true // Automatically parses the JSON string in the response
        };

        rp(options)
            .then(function (repos) {
                var i = 0;
                var bin = {};
                bin.name = repos.caption;
                repos.sections.forEach(function (sec) {
                    if(sec.name === 'description' || sec.name === 'depot_list'){
                        bin.bin = sec.title;
                    } else if (sec.name === 'special_instructions'){
                        // bin.special_instruction = sec.rows[0].html
                    }
                    i++;
                    if(i === repos.sections.length) {
                        resolve({error: null, data: bin});
                    }
                });
                // setTimeout(function () {
                //
                // },500)
            })
            .catch(function (err) {
                console.log(err);
                resolve({error: "Something went wrong!", data: null})
            });
    });
};

// suggestItem("styro", function (err, res) {
//     console.log(err);
//     console.log(res.bins);
// });

// findBin(40224).then(function (res) {
//     console.log(res);
// });