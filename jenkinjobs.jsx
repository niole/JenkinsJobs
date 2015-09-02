JenkinJobs = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData () {
    var builds = Posts.find({}).fetch();
    return {
      Builds: builds
    };
  },
  displayBuildTags() {
    return <ul>
            {arguments[0].map(function(tag) {
                return <li>{tag}</li>;
              })}
          </ul>;
  },
  getJobs() {
    return this.data.Builds.map(function(data) {
        console.log('data: ');
        return <li>{data.build.title}{data.pubDate}{this.displayBuildTags(data.build.tags)}</li>;
    }.bind(this));
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
