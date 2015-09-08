JenkinJobs = React.createClass({
  getInitialState() {
    return {
             dayRange: 3,
             fromDate: moment.tz("America/New_York").format('MMMM DD YYYY')
           };

  },
  mixins: [ReactMeteorData],
  getMeteorData () {
    let rowHeadWidth = $('.row-header')[0] ? $('.row-header')[0].offsetWidth : 125;
    let dataWidth = Math.max( document.documentElement.clientWidth,
                                                 window.innerWidth - rowHeadWidth*2 || 600 );
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

    let allDates = _.flatten(allBuilds).sort( function(a,b) {
      return (new Date(a.build.pubDate)).getTime()-(new Date(b.build.pubDate)).getTime();
    });

    return {
      Builds: allBuilds.length > 0 ? this.sortEachBuild(allBuilds) : [],
      Startdate: startdate,
      Enddate: this.state.fromDate,
      Earliestbuild: allDates[0] ? allDates[0].build.pubDate : 0,
      Latestbuild: allDates[allDates.length-1] ? allDates[allDates.length-1].build.pubDate : 0,
      Datawidth: dataWidth

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
  buildBuildRow(firstBuild,lastBuild,width,height,headers, buildData) {
    return <TableRow
            firstbuild={firstBuild}
            lastbuild={lastBuild}
            groupedData={buildData}
            buildId={"buildId-"+buildData[0].build.buildId}
            width={width-150}
            widthview={width}
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
                               <span className="build-type">{buildAttr.configTitle.toLowerCase()}</span><br/>
                               {buildAttr.buildLabels.length > 0 ? buildAttr.buildLabels[0].toLowerCase() +", ": <br/>}
                               {buildAttr.buildLabels.length > 0 ? buildAttr.buildLabels[1].toLowerCase() : ''}
                             </p>
                          </td>
                          <td className="build-series">
                            {this.buildBuildRow(this.data.Earliestbuild, this.data.Latestbuild, width,height,this.data.Headers, this.data.Builds[build])}
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
            widthview={width}
            width={width-150}
            height={height}
           />;

  },
  render() {
    const width = this.data.Datawidth;
    const heightBuilds = 10;
    const height = 50;
    return (
      <span>
        <table className="striped">
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
        {'made with \u2661 by Niole'}
     </span>
    );
  }
});
