TableAxis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    startdate: React.PropTypes.object.isRequired,
    enddate: React.PropTypes.object.isRequired
  },
  dateToNumber(date) {
    return moment(date).unix();
  },
  componentDidMount() {
    //Create the SVG Viewport
    const svgContainer = d3.select("#table-axis").append("svg")
                               .attr("width", this.props.width)
                               .attr("height", this.props.height);

    //Create the Scale we will use for the Axis
    const axisScale = d3.scale.linear()
                             .domain([
                                this.dateToNumber(this.props.enddate),
                                this.dateToNumber(this.props.startdate)
                              ])
                             .range([0, this.props.width]);

    const axisData = _.map(this.getAxisData(this.props.enddate), tick => {
      return {
        moment: tick,
        xPos: axisScale(tick.unix())
      };
    });

    svgContainer.selectAll("circle")
      .data(axisData)
      .enter()
        .append("circle")
        .attr("cx", d => { return d.xPos; })
        .attr("cy", "5px")
        .attr("r", "2px");
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
