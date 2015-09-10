Meteor.methods({
  'getTests': function(url) {
    var result = HTTP.call("GET", url);
    console.log(result);
    return result;

//    $.ajax({
//             url: url,
//             dataType: 'json',
//             success: function(res) {
//              console.log('success');
//              return res;
//             },
//             error: function(err) {
//              console.error(err);
//             }
//          });
  }
});
