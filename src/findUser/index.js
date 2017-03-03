var users = {
  "dario meli": "dm",
  "sean tyson": "sean",
  "mike cieben": "mike",
  "andrew aarchbold": "arch",
  "selva valluvan": "selva",
  "brennan": "brennan",
  "sam wempe": "swempe",
  "swempe": "swempe",
  "sofia tang": "sofia",
  "danny cowx": "danny",
  "carlin leung": "carlin",
  "daniel shalinsky": "shalinsky",
  "anna zhao": "annazhao",
  "kristin ramsey": "kristinramsey",
  "lindsay vermeulen": "lindsay",
  "haley cameron": "haley",
  "brittany mcgillivray": "brittany",
  "andrea": "andreaga"
};

var findUser = function (name) {
  var re = new RegExp(name);
  for (var key in users) {
    if (re.test(key)) {
      return users[key];
    }
  }
};

module.exports = findUser;

