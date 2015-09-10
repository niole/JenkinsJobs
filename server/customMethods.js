Meteor.methods({
  'getTests': function(url) {
    var res = HTTP.call("GET", url)
    return JSON.parse(res.content);
  }
});
