JenkinJobs = React.createClass({
  getInitialState() {
    return { startIndex: 0,
             dayRange: 3,
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
    //assumes isodate objects
    //range: days into the past, include current day
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
        const buildConfig = build.title.match(/.*?^(?:(?!\/).)*/g)[0].replace(/-/gi,' ');
        const buildConfigDesc = build.title.match(/\/([^=]+)/g)[0].replace(/[_\/]/g,' ').trim();
        let buildLabels = build.title.match(/=([a-zA-Z0-9.-]+)/g);
        buildLabels[0] = buildLabels[0].replace(/=/,' ').trim();
        buildLabels[1] = buildLabels[1].replace(/=/,' ').trim();


        if (groupedBuilds[title]) { groupedBuilds[title].push({
                                     build: build,
                                     configTitle: buildConfig[0],
                                     buildLabels: buildLabels,
                                     configDesc: buildConfigDesc[0],
                                     buildStatus: this.getBuildStatus(titleStatus),
                                     buildIndex: buildNumber});
        } else {
          groupedBuilds[title] = [{build: build,
                                   configTitle: buildConfig,
                                   buildLabels: buildLabels,
                                   configDesc: buildConfigDesc,
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
      const cellWidth = {width: (group.length*10).toString()+"px"};

      return <td>
               <div style={cellWidth}>
                 {_.map(group, cellData => {
                      return (
                        <div className="config-data">
                          <svg className="status-circle" width="10" height="10">
                            <circle cx="5" cy="5" r="5" fill={cellData.buildStatus ? 'green' : 'red'}/>
                          </svg>
                          <span className="cell-info">
                            {cellData.build.pubDate}
                            {this.displayBuildTags(cellData.build.build.tags)}
                            build status: {cellData.buildStatus ? 'stable' : 'broken'}
                          </span>
                        </div>);
                   })
                }
              </div>
            </td>;
    });

  },
  displayBuildQs() {
    let buildGroups = [];
    for (let build in this.data.Builds) {
      let buildAttr = this.data.Builds[build][0];
      buildGroups.push(
                       <tr>
                          <td>
                             <p>{buildAttr.configTitle}</p>
                             <p>{buildAttr.configDesc}</p>
                             <p>{buildAttr.buildLabels[0]}</p>
                             <p>{buildAttr.buildLabels[1]}</p>
                          </td>
                          {this.buildBuildRow(this.data.Headers, this.data.Builds[build])}
                       </tr>
                      );
    }
    return buildGroups;
  },
  displayColHeaders() {
    const monthDict = {1: 'Jan', 2: 'Feb',3:'Mar', 4:'Apr', 5:'May',
                       6: 'Jun', 7:'Jul', 8: 'Aug', 9: 'Sep',10: 'Oct',
                       11: 'Nov', 12: 'Dec'};
    return _.map(this.data.Headers, title => {
      let displayTitle = title;
      if (typeof title !== 'string') {
        //formats title to day.month.year
        displayTitle = title.getDay().toString()+'.'+
                        monthDict[title.getMonth()]+'.'+
                        title.getFullYear().toString();
      }
      return <td>{displayTitle}</td>;
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
