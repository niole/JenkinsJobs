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
    const statusString = arguments[0];
    if (!statusString || statusString.indexOf('broken') > -1) {
      return false;
    }
    return true;
  },
  groupSortBuilds(builds) {
    let groupedBuilds = {};
    builds.forEach( build => {
      let buildNumStr = build.build.title.match(/#([0-9]+)/g);
      const buildNumber = parseInt(buildNumStr[0].slice(1,buildNumStr[0].length));
      const titleStatus = build.build.title.match(/\(([a-zA-Z_ ]+)\)/g);
      const title = build.build.title.split(" ")[0];

      //when titleStatus contains 'normal', or 'broken', indicates
      //a change in state for build config.
      //when titleStatus contains 'normal', aka a change back to 
      //'stable', this is not reflected in the object's tags
      //otherwise, titleStatus contains 'stable'

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
      return <li>{data}{this.displayBuildTags(data.build.build.tags)}</li>;
    });

  },
  displayBuildQs() {
    let buildGroups = [];
    for (var build in this.data.Builds) {
      buildGroups.push(
                       <span>
                         <h1>{build}</h1>
                         <h2>current status: {this.data.Builds[build][0].buildStatus ? 'stable' : 'broken'}</h2>
                         <ul>
                            {this.buildBuildRow(build, this.data.Builds[build])}
                         </ul>
                       </span>
                      );
    }
    return buildGroups;
  },
  render() {
    return (
      <span>
        {this.displayBuildQs()}
      </span>
    );
  }
});
