//group by group title

JenkinJobs = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData () {
    const builds = Posts.find({}).fetch();

    return {
      Builds: this.groupSortBuilds(builds)
    };
  },
  groupSortBuilds(builds) {
    let groupedBuilds = {};
    builds.forEach(function(build) {
      let buildNumStr = build.build.title.match(/#([0-9]+)/g);
      let titleContent = build.build.title.split(" ");
      const buildNumber = parseInt(buildNumStr[0].slice(1,buildNumStr[0].length));

      if (groupedBuilds[titleContent[0]]) {
        groupedBuilds[titleContent[0]].push({build: build,
                                             buildIndex: buildNumber});
      } else {
        groupedBuilds[titleContent[0]] = [{build: build,
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
           {arguments[0].map(function(tag) {
              return <li>{tag}</li>;
            })}
          </ul>;
  },
  buildBuildRow() {
    const buildTitle = arguments[0];
    const buildData = arguments[1];
    return buildData.map(function(data) {
      return <li>{data}</li>;
    });

  },
  displayBuildQs() {
    let buildGroups = [];
    for (var build in this.data.Builds) {
      buildGroups.push(
                       <span>
                         <h1>{build}</h1>
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
