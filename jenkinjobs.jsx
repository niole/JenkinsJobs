JenkinJobs = React.createClass({
  getInitialState() {
    return { startIndex: 0,
             dayRange: 3,
             fromDate: moment.tz("America/New_York").format('MMMM DD YYYY')
             };

  },
  mixins: [ReactMeteorData],
  getMeteorData () {
    let startdate =new Date((this.formatDate(this.state.fromDate)).getTime() - this.state.dayRange*24*3600000);
    let builds = Builds.find({}).fetch();
    let allBuilds = [];
      builds.forEach( build => {
      let buildArray = [];
      let postsInRange = Posts.find({ buildId: build._id }).fetch();
      postsInRange.forEach( post => {
        if (post.build.pubDate <= this.formatDate((this.formatDate(this.state.fromDate)).getTime()+24*36000000) && post.build.pubDate >= startdate) {
          buildArray.push(post);
        }
      });
      allBuilds.push(buildArray);
    });
    this.groupBuildsOnTitle(allBuilds);

    return {
      Builds: allBuilds.length > 0 ? this.sortEachBuild(allBuilds) : [],
      Headers: ["builds"].concat(this.getRange(this.formatDate(this.state.fromDate), this.state.dayRange))
    };
  },
  formatDate(date) {
    if (typeof date === 'string' ||
        typeof date === 'number') {
      return new Date(date);
    }
    return date;
  },
  groupBuildsOnTitle(allBuilds) {
    if (allBuilds.length === 0) {
      return;
    }


    allBuilds.sort(function(a,b) {
      if (a[0] && b[0]) {
        return a[0].title  - b[0].title;
      }
      return a-b;
    });
  },
  getRange(start, range) {
    //assumes isodate objects
    //range: days into the past, include current day
    return _.range(range).map( mult => {
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
        let buildNumber = 'none';
        if (buildNumStr) {
          buildNumber = buildNumStr[0].replace(/#/,' ').trim();
        }
        const titleStatus = build.statusTitle.match(/\(([a-zA-Z?#(0-9)_ ]+)\)/g);
        const title = build.title;
        const buildConfig = build.title.match(/.*?^(?:(?!\/).)*/g)[0].replace(/-/gi,' ');
        //problem with regex below ---
        let buildConfigDesc = build.title.match(/\/([^=]+)/g);
        if (buildConfigDesc) {
          buildConfigDesc = buildConfigDesc[0].replace(/[_\/]/g,' ').trim();
        } else {
          buildConfigDesc = build.title;
        }
        const buildLabels = _.map(build.title.match(/=([a-zA-Z0-9.-]+)/g), label => {
          return label.replace(/=/,' ').trim();
        });


        if (groupedBuilds[title]) { groupedBuilds[title].push({
                                     build: build,
                                     configTitle: buildConfig,
                                     buildLabels: buildLabels,
                                     configDesc: buildConfigDesc,
                                     buildStatus: this.getBuildStatus(titleStatus),
                                     buildNumber: buildNumber});
        } else {
          groupedBuilds[title] = [{build: build,
                                   configTitle: buildConfig,
                                   buildLabels: buildLabels,
                                   configDesc: buildConfigDesc,
                                   buildStatus: this.getBuildStatus(titleStatus),
                                   buildNumber: buildNumber}];
        }
      });
   });

    for (var title in groupedBuilds) {
      groupedBuilds[title].sort(function(a,b) {
        let A = new Date(a.build.pubDate);
        let B = new Date(b.build.pubDate);
        if (A.getTime() > B.getTime()) {
          return -1;
        }
        if (A.getTime() < B.getTime()) {
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
    let timeDiff = Math.abs(startDate.getTime()+1000*60*60*24- dateData.getTime());
    let diff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.ceil(timeDiff / (1000 * 3600 * 24));

  },
  parseCellData(buildData,headers) {
    var tableData = [];
    for (var i=0; i<buildData.length; i++) {
        var data = buildData[i];
        var tableIndex = this.getTableIndex(this.formatDate(data.build.pubDate), headers[1])-1;
        if (tableData[tableIndex]) {
          tableData[tableIndex].push(data);
        } else {
          tableData.push([data]);
        }
    }
    return tableData;
  },
  buildBuildRow(headers, buildData) {
    let width = 600;
    let height = 25;
      return <TableRow
              groupedData={this.parseCellData(buildData,headers)}
              buildId={"buildId-"+buildData[0].build.buildId}
              dayRange={this.state.dayRange}
              width={width}
              height={height}
             />;
  },
  displayBuildQs() {
    let buildGroups = [];
    for (let build in this.data.Builds) {
      let buildAttr = this.data.Builds[build][0];
      console.log('buildAttr');
      console.log(buildAttr);
      buildGroups.push(
                       <tr>
                          <td className="row-header">
                             <p>
                               <strong>{buildAttr.configTitle.toLowerCase()}</strong><br/>
                               {buildAttr.configDesc.toLowerCase()}: <br/>
                               {buildAttr.buildLabels.length > 0 ? buildAttr.buildLabels[0].toLowerCase() : ''},&nbsp;
                               {buildAttr.buildLabels.length > 0 ? buildAttr.buildLabels[1].toLowerCase() : ''}
                             </p>
                          </td>
                          <td>
                            {this.buildBuildRow(this.data.Headers, this.data.Builds[build])}
                          </td>
                       </tr>
                      );
    }
    return buildGroups;
  },
  displayColHeaders() {
    return _.map(this.data.Headers, title => {
      let displayTitle = title;
      if (typeof title !== 'string') {
        //formats title to day.month.year
        const titleDate = title.toString().split(' ');
        displayTitle = titleDate[2]+'.'+titleDate[1]+'.'+titleDate[3];
      }
      return <td className="data-table col-header">{displayTitle}</td>;
    });
  },
  render() {
    return (
      <span>
        <table>
          <thead>
            <tr>{this.displayColHeaders()}</tr>
          </thead>
          <tbody>
            {this.displayBuildQs()}
          </tbody>
        </table>
     </span>
    );
  }
});
