TableAxis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    startdate: React.PropTypes.object.isRequired,
    enddate: React.PropTypes.object
  },
  //dateToNumber(date) {
    //return moment(date).unix();
  //},
  componentDidMount() {
    //Create the SVG Viewport
    const svgContainer = d3.select("#table-axis").append("svg")
                               .attr("width", this.props.width)
                               .attr("height", this.props.height);
    const x = d3.time.scale()
      .domain([
        new Date(this.props.enddate),
        new Date(this.props.startdate)
      ])
      .range([0, this.props.width]);
    const xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.day, 1)
      .tickSize(16, 0)
      .tickFormat(d3.time.format("%b %d"));

    svgContainer
      .append("g")
      .attr("class", "x axis")
      .call(xAxis)
  },
  getAxisData(end) {
    //get just a range of days between these two and return
    return _.map(_.range(0, 4), daysPast => {
      return moment(end).subtract(daysPast, 'days');
    })
  },
  render() {
    return (
      <div id="table-axis"/>
    );
  }
});
