TableAxis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    startdate: React.PropTypes.object.isRequired,
    enddate: React.PropTypes.object.isRequired
  },
  dateToNumber(date) {
    let toConvert = date;
    if (typeof date === 'string') {
      toConvert = new Date(date);
    }
    let time = toConvert.getTime();
    return time;

  },
  componentDidMount() {
    //Create the SVG Viewport
    const svgContainer = d3.select("#table-axis").append("svg")
                               .attr("width", this.props.width)
                               .attr("height", this.props.height);

    //Create the Scale we will use for the Axis
    const axisScale = d3.time.scale()
                             .domain([this.dateToNumber(this.props.enddate),
                                  this.dateToNumber(this.props.startdate)])
                             .range([0, this.props.width]);
    const xAxis = d3.svg.axis()
            .scale(axisScale);
    svgContainer.append("g")
                .call(xAxis);
  },
  render() {
    return (
      <div id="table-axis"/>
    );
  }
});
