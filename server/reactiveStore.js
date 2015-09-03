Meteor.startup(function() {
  var Feeds = [
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop1.0,label=spark-test/rssAll",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.2,label=spark-test/rssAll",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.0,label=spark-test/rssAll",
               "https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/job/Spark-Master-SBT/AMPLAB_JENKINS_BUILD_PROFILE=hadoop2.3,label=spark-test/rssAll"
              ];

  var feed_1 = Scrape.feed(Feeds[0]);
  var feed_2 = Scrape.feed(Feeds[1]);


    feed_1.items.forEach(function(build) {

      if (Posts.find( { pubDate: build.title }).count() < 1) {

        var Build = {
              pubDate: build.pubDate.toString(),
              build: build,
              title: feed_1.title,
              statusTitle: build.title
              };

        Posts.insert(Build);
      }
    });
    feed_2.items.forEach(function(build) {
      if (Posts.find( { statusTitle: build.title }).count() < 1) {

        var Build = {
              pubDate: build.pubDate.toString(),
              build: build,
              title: feed_2.title,
              statusTitle: build.title
              };

        Posts.insert(Build);
      }
    });

});
