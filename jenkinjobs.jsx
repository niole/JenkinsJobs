JenkinJobs = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData () {
//    var feedData = Scrape.feed("https://amplab.cs.berkeley.edu/jenkins/view/Spark-QA-Test/rssLatest");
    var builds = Posts.find({}).fetch();
    return {
      Builds: builds
    };
  },
  getJobs() {
    return this.data.Builds.map(function(data) {
        console.log('data: ');
        return <li>{data.build.title}{data.pubDate}</li>;
    });
  },
  render() {
    return (
      <span>
        <ul>
          {this.getJobs()}
        </ul>
      </span>
    );
  }
});
