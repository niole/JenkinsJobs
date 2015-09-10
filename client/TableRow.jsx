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
  mixins: [ReactMeteorData],
  getMeteorData() {
    const buttonData = BuildViews.find({buildId: this.props.buildId}).fetch();
    const RADIUS = 5; // Pixels
    const xScale = d3.scale.linear()
      .domain([
        moment(this.props.lastbuild).unix(),
        moment(this.props.firstbuild).unix()
      ])
      .range([RADIUS+50, this.props.width - RADIUS+50]);

    const buildStatusData = _.map(this.props.groupedData, (build) => {
      const buttonData = BuildViews.findOne({instanceId: build.build._id});
      return {
        cx: xScale(moment(build.build.pubDate).unix()),
        color: build.buildStatus ? 'green' : 'red',
        buildNumber: build.buildNumber,
        buildDate: build.build.pubDate,
        failCount: buttonData ? buttonData.testInfo.failCount : '... pending'
      }
    });
    return {
      Buttondata: buildStatusData
    };
  },
  componentDidMount() {
    const RADIUS = 5; // Pixels
    const svgContainer = d3.select("#"+this.props.buildId).append("svg")
      .attr("width", this.props.widthview)
      .attr("height", this.props.height);

    const tt = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svgContainer.selectAll("circle")
      .data(this.data.Buttondata)
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
            tt.transition()
                .duration(200)
                .text('build '+d.buildNumber
                        +', '+d.buildDate
                        +', failures: '+d.failCount)
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
