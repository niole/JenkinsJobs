Meteor.methods({
  'getTests': function(url, buildStatus, buildId, instanceId) {
    if (!BuildViews.findOne({instanceId: instanceId})) {
      if (buildStatus) {
        BuildViews.insert( { buildStatus: buildStatus, testInfo: {failCount: 0}, instanceId: instanceId } );
      } else {
        var res = HTTP.call("GET", url);
        if (res) {
          console.log('CONTENT');
          var content = res.data;
          var suites = res.data.suites;
          var failCount = content.failCount;
          BuildViews.insert( { buildStatus: buildStatus,
                               testInfo: {failCount: failCount},
                               instanceId: instanceId } );
       }
      }
    }
  }
});
