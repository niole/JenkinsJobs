TableRow = React.createClass({
  propTypes: {
    buildId: React.PropTypes.string.isRequired,
    groupedData: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },
  componentDidMount() {
    const RADIUS = 5; // Pixels
    const svgContainer = d3.select("#"+this.props.buildId).append("svg")
      .attr("width", this.props.width)
      .attr("height", this.props.height);
    const buildDates = _.map(this.props.groupedData, (build) => {
      return moment(build.build.pubDate);
    });
    const xScale = d3.scale.linear()
      .domain([
        _.max(buildDates).unix(),
        _.min(buildDates).unix()
      ])
      .range([RADIUS, this.props.width - RADIUS]);
    const buildStatusData = _.map(_.flatten(this.props.groupedData), (build) => {
      return {
        cx: xScale(moment(build.build.pubDate).unix()),
        color: build.buildStatus ? 'green' : 'red'
      };
    });
    svgContainer.selectAll("circle")
      .data(buildStatusData)
      .enter()
        .append("circle")
        .attr("cx", function (d) { return d.cx; })
        .attr("cy", function (d) { return "5px"; })
        .attr("r", function (d) { return RADIUS + "px"; })
        .style("fill", function(d) { return d.color; });
  },
  render() {
    return (
      React.createElement('div', {
                                 style: {
                                  width: this.props.width,
                                  height: this.props.height
                                 },
                                 id: this.props.buildId
                                 })
    );
  }
});
