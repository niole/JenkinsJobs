Meteor.startup(function() {
  console.log(Scrape.feed("https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssLatest"));

  var prevJobs = Scrape.feed("https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssLatest");
  prevJobs.items.forEach(function(build) {
    if (Posts.find( { pubDate: build.pubDate.toString()}).count() < 1) {
      var Build = {
            pubDate: build.pubDate.toString(),
            build: build
            }
      Posts.insert(Build);
    }
  });
});
