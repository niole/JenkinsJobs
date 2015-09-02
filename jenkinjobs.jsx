//group by group title

JenkinJobs = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData () {
    var builds = Posts.find({}).fetch();
    var groupedBuilds = {};
    builds.forEach(function(build) {
      let titleContent = build.build.title.split(" ");
      if (groupedBuilds[titleContent[0]]) {
        groupedBuilds[titleContent[0]].push(build);
      } else {
        groupedBuilds[titleContent[0]] = [build];
      }
    });
    console.log('groupedBuilds');
    console.log(groupedBuilds);
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
        var titleArray = data.build.title.split(" ");
        console.log('titleArray');
        console.log(titleArray);
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
