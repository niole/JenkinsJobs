Meteor.startup(function() {
  var Feeds = [
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop1.0,label=spark-test/rssAll",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.2,label=spark-test/rssAll",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.0,label=spark-test/rssAll",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.3,label=spark-test/rssAll"
              ];

  var scrapedFeeds = Feeds.map(function(feed) {
    return Scrape.feed(feed);
  });

  scrapedFeeds.forEach(function(F) {
    F.items.forEach(function(build) {

      if (Posts.find( { pubDate: build.title }).count() < 1) {

        var Build = {
              pubDate: build.pubDate.toString(),
              build: build,
              title: F.title,
              statusTitle: build.title
              };

        Posts.insert(Build);
      }
    });
  });
});
