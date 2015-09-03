//group by group title

JenkinJobs = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData () {
    const builds = Posts.find({}).fetch();

    return {
      Builds: this.groupSortBuilds(builds)
    };
  },
  getBuildStatus() {
    const statusString = arguments[0][0];
    if (statusString.indexOf('broken') > -1) {
      return false;
    }
    return true;
  },
  groupSortBuilds(builds) {
    let groupedBuilds = {};

    builds.forEach( build => {
      let buildNumStr = build.build.title.match(/#([0-9]+)/g);
      const buildNumber = parseInt(buildNumStr[0].slice(1,buildNumStr[0].length));
      const titleStatus = build.build.title.match(/\(([a-zA-Z?#(0-9)_ ]+)\)/g);
      const title = build.build.title.split(" ")[0];

      if (groupedBuilds[title]) {
        groupedBuilds[title].push({build: build,
                                   buildStatus: this.getBuildStatus(titleStatus),
                                   buildIndex: buildNumber});
      } else {
        groupedBuilds[title] = [{build: build,
                                 buildStatus: this.getBuildStatus(titleStatus),
                                 buildIndex: buildNumber}];

      }
    });

    for (var title in groupedBuilds) {
      groupedBuilds[title].sort(function(a,b) {
        if (a.buildIndex > b.buildIndex) {
          return -1;
        }
        if (a.buildIndex < b.buildIndex) {
          return 1;
        }
        return 0;
      });
    }
    return groupedBuilds;
  },
  displayBuildTags() {
    return <ul>
           {arguments[0].map( tag => {
              return <li>{tag}</li>;
            })}
          </ul>;
  },
  buildBuildRow() {
    const buildTitle = arguments[0];
    const buildData = arguments[1];
    return buildData.map( data => {
      return <li className="config-data">
                build status: {data.buildStatus ? 'stable' : 'broken'} <br/>
                {data.build.pubDate}
                {this.displayBuildTags(data.build.build.tags)}
             </li>;
    });

  },
  displayBuildQs() {
    let buildGroups = [];
    for (var build in this.data.Builds) {
      buildGroups.push(
                       <span>
                          <div className="build-config-header">
                             <h1>{this.data.Builds[build][0].build.title}</h1>
                             <h2>current status: {this.data.Builds[build][0].buildStatus ? 'stable' : 'broken'}</h2>
                          </div>

                         <li className="config-row">
                             <ul className="config-data-box">
                                {this.buildBuildRow(build, this.data.Builds[build])}
                             </ul>
                         </li>
                       </span>
                      );
    }
    return buildGroups;
  },
  render() {
    return (
      <ul>
        {this.displayBuildQs()}
      </ul>
    );
  }
});
