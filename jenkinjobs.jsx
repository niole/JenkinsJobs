JenkinJobs = React.createClass({
  getInitialState() {
    return { startIndex: 0,
             dayRange: 1,
             fromDate: new Date()
             };

  },
  mixins: [ReactMeteorData],
  getMeteorData () {
    let startdate =new Date(this.state.fromDate.getTime() - this.state.dayRange*24*3600000);
    let builds = Builds.find({}).fetch();
    const allBuilds = builds.map( build => {
      let buildArray = [];
      let postsInRange = Posts.find({ buildId: build._id }).fetch();
      postsInRange.forEach( post => {

        if (post.build.pubDate <= this.state.fromDate && post.build.pubDate >= startdate) {
          buildArray.push(post);
        }
      });
      return buildArray;
    });

    this.groupBuildsOnTitle(allBuilds);

    return {
      Builds: this.sortEachBuild(allBuilds),
      Headers: ["build titles"].concat(this.getRange(this.state.fromDate, this.state.dayRange))
    };
  },
  groupBuildsOnTitle(allBuilds) {
    allBuilds.sort(function(a,b) {
      return a[0].title - b[0].title;
    });
  },
  getRange(start, range) {
    //assumes isodates of the "string" form
    //range is number of days into the past
    //includes the current day
    return _.range(range+1).map( mult => {
      return new Date(start.getTime() - mult*24*3600000);
    });
  },
  getBuildStatus(titleArray) {
    if (titleArray[0].indexOf('broken') > -1) {
      return false;
    }
    return true;
  },
  sortEachBuild(allBuilds) {
    let groupedBuilds = {};
    allBuilds.forEach( builds => {
      builds.forEach( build => {
        let buildNumStr = build.statusTitle.match(/#([0-9]+)/g);
        const buildNumber = parseInt(buildNumStr[0].slice(1,buildNumStr[0].length));
        const titleStatus = build.statusTitle.match(/\(([a-zA-Z?#(0-9)_ ]+)\)/g);
        const title = build.title;

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
  getTableIndex(dateData, startDate) {
    let timeDiff = Math.abs(startDate.getTime() - dateData.getTime());
    return diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  },
  parseCellData(buildData,headers) {
    var tableData = [];
    var tableIndex;
    var data;
    var i;

    for (i=0; i<buildData.length; i++) {
        data = buildData[i];
        tableIndex = this.getTableIndex(new Date(data.build.pubDate), headers[1])-1;
        if (tableData[tableIndex]) {
          tableData[tableIndex].push(data);
        } else {
          tableData.push([data]);
        }
    }
    return tableData;
  },
  buildBuildRow(headers, buildData) {

    return this.parseCellData(buildData, headers).map( group => {
      return <td>
         {_.map(group, cellData => {
              return (
                <div>
                  build status: {cellData.buildStatus ? 'stable' : 'broken'}
                  {cellData.build.pubDate}
                  {this.displayBuildTags(cellData.build.build.tags)}
                </div>);
           })
        }
      </td>;
    });

  },
  displayBuildQs() {
    let buildGroups = [];
    for (var build in this.data.Builds) {
      buildGroups.push(
                       <tr>
                          <td>
                             <h4>{this.data.Builds[build][0].build.title}</h4>
                             <h4>current status: {this.data.Builds[build][0].buildStatus ? 'stable' : 'broken'}</h4>
                          </td>
                          {this.buildBuildRow(this.data.Headers, this.data.Builds[build])}
                       </tr>
                      );
    }
    return buildGroups;
  },
  displayColHeaders() {
    return _.map(this.data.Headers, title => {
      return <td>{title.toString()}</td>;
    });
  },
  render() {
    return (
      <table>
        <thead>
          <tr>{this.displayColHeaders()}</tr>
        </thead>
        <tbody>
          {this.displayBuildQs()}
        </tbody>
      </table>
    );
  }
});
