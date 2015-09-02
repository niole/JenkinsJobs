Meteor.startup(function() {
  var Feeds = [
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssLatest",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop1.0,label=spark-test/rssAll"
              ];

  Feeds.forEach(function(feed) {
    var currFeed = Scrape.feed(feed);
    currFeed.items.forEach(function(build) {

      if (Posts.find( { pubDate: build.pubDate.toString()}).count() < 1) {

        var Build = {
              category: build.title,
              pubDate: build.pubDate.toString(),
              build: build
              };

        Posts.insert(Build);
      }
    });
  });
});
