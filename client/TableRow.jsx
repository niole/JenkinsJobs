TableRow = React.createClass({
  propTypes: {
    firstbuild: React.PropTypes.object.isRequired,
    lastbuild: React.PropTypes.object.isRequired,
    widthview: React.PropTypes.number.isRequired,
    buildId: React.PropTypes.string.isRequired,
    groupedData: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },
  componentDidMount() {
    function createCORSRequest(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        // CORS not supported.
        xhr = null;
      }
      return xhr;
    }

    // Helper method to parse the title tag from the response.
    function getTitle(text) {
      return text.match('<title>(.*)?</title>')[1];
    }

    const RADIUS = 5; // Pixels
    const svgContainer = d3.select("#"+this.props.buildId).append("svg")
      .attr("width", this.props.widthview)
      .attr("height", this.props.height);
    const buildDates = _.map(this.props.groupedData, (build) => {
      return moment(build.build.pubDate);
    });
    const xScale = d3.scale.linear()
      .domain([
        moment(this.props.lastbuild).unix(),
        moment(this.props.firstbuild).unix()
      ])
      .range([RADIUS+50, this.props.width - RADIUS+50]);
    const buildStatusData = _.map(this.props.groupedData, (build) => {
      return {
        cx: xScale(moment(build.build.pubDate).unix()),
        color: build.buildStatus ? 'green' : 'red',
        buildNumber: build.buildNumber,
        buildDate: build.build.pubDate,
        link: build.build.build.link
      };
    });

    const tt = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .attr("class", "tooltip")
      .style("opacity", 0);


    svgContainer.selectAll("circle")
      .data(buildStatusData)
      .enter()
        .append("svg:a")
        .attr("xlink:href", function(d){return d.link;})
        .attr("target", "_blank")
        .append("circle")
        .classed('status-circle', true)
        .attr("cx", function (d) { return d.cx; })
        .attr("cy", function (d) { return "5px"; })
        .attr("r", function (d) { return RADIUS + "px"; })
        .style("fill", function(d) { return d.color; })
        .on("mouseover", function(d) {
            Meteor.call('getTests', d.link+"/testReport/api/json",
              function(err, res) {
              if (err) {
                throw Error(err);
              } else {
                console.log(res);
                tt.text("build "+d.buildNumber+", "+this.formatDate(d.buildDate) +", "+res.failCount.toString())
              }
            }.bind(this))


            tt.transition()
                .duration(200)
                .style("opacity", 1)

                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            }.bind(this))
        .on("mouseout", function(d) {
            tt.transition()
                .duration(500)
                .style("opacity", 0);
        }.bind(this));
  },
  formatDate(date) {
    let inProg = date;
    if (typeof date === 'string' ||
        typeof date === 'number') {
      inProg = new Date(date);
    }

    return moment(inProg).format('lll');
  },
  render() {
    return (
      React.createElement('span',{},
        React.createElement('div',{ id: 'spinner' }),
        React.createElement('div', {
                                   style: {
                                    width: this.props.width,
                                    height: this.props.height
                                   },
                                   id: this.props.buildId
                                   })
      )
    );
  }
});
