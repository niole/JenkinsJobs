Meteor.startup(function() {
  var Feeds = [
    //            "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssAll"
//              "https://amplab.cs.berkeley.edu/jenkins/view/All/rssAll"
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop1.0,label=spark-test/rssAll",
//               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.2,label=spark-test/rssAll",
//               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.0,label=spark-test/rssAll",
//               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.3,label=spark-test/rssAll"
              ];

  var scrapedFeeds = Feeds.map(function(feed) {
    return Scrape.feed(feed);
  });

  scrapedFeeds.forEach(function(F) {
    F.items.forEach(function(build) {

      if (Posts.find( { statusTitle: build.title }).count() < 1) {
        console.log('new POST');
        if (Builds.find( {title: build.title.split(' ')[0]} ).count() < 1) {
         console.log('new BUILD');
          Builds.insert({title: build.title.split(' ')[0]} );
        }
        var buildConfig = Builds.findOne({title: build.title.split(' ')[0]});
        var Build = {
              buildId: buildConfig._id,
              pubDate: build.pubDate.toString(),
              build: build,
              title: build.title.split(' ')[0],
              statusTitle: build.title
              };

        Posts.insert(Build);
      }
    });
  });
});
