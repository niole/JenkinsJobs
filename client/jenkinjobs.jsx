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
      Headers: ["builds"].concat(this.getRange(this.formatDate(this.state.fromDate), this.state.dayRange)),
      Startdate: startdate,
      Enddate: this.state.fromDate
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
  buildBuildRow(width,height,headers, buildData) {
    return <TableRow
            groupedData={buildData}
            buildId={"buildId-"+buildData[0].build.buildId}
            width={width}
            height={height}
           />;
  },
  displayBuildQs(width,height) {
    let buildGroups = [];
    for (let build in this.data.Builds) {
      let buildAttr = this.data.Builds[build][0];
      buildGroups.push(
                       <tr>
                          <td className="row-header">
                             <p>
                               <strong>{buildAttr.configTitle.toLowerCase()}</strong><br/>
                               {buildAttr.buildLabels.length > 0 ? buildAttr.buildLabels[0].toLowerCase() : ''},&nbsp;
                               {buildAttr.buildLabels.length > 0 ? buildAttr.buildLabels[1].toLowerCase() : ''}
                             </p>
                          </td>
                          <td className="build-series">
                            {this.buildBuildRow(width,height,this.data.Headers, this.data.Builds[build])}
                          </td>
                       </tr>
                      );
    }
    return buildGroups;
  },
  displayColHeaders( width, height,headers) {
    return <TableAxis
            startdate={this.data.Startdate}
            enddate={this.data.Enddate}
            width={width}
            height={height}
           />;

  },
  render() {
    const width = 600;
    const heightBuilds = 10;
    const height = 50;


    return (
      <span>
        <table>
          <thead>
            <tr>
              <td></td>
              <td>
                {this.displayColHeaders(width,height,this.data.Headers)}
              </td>
            </tr>
          </thead>
          <tbody>
            {this.displayBuildQs(width,heightBuilds)}
          </tbody>
        </table>
     </span>
    );
  }
});
