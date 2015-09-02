Meteor.startup(function() {
  console.log(Scrape.feed("https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssLatest"));

  var prevJobs = Scrape.feed("https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssLatest");
  prevJobs.items.forEach(function(build) {
    Posts.insert({build: build});
  });
});
