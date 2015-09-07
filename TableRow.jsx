TableRow = React.createClass({
  propTypes: {
    buildId: React.PropTypes.string.isRequired,
    groupedData: React.PropTypes.array.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },
  componentDidMount() {
     const svgContainer = d3.select("#"+this.props.buildId).append("svg")
                                                      .attr("width", this.props.width)
                                                      .attr("height", this.props.height);
       const dayScale = d3.scale.linear()
                          .domain([0, this.props.groupedData.length])
                          .range([0, this.props.width]);

       _.forEach(this.props.groupedData, (day, dayIdx) => {
         const cellScale = d3.scale.linear()
                                 .domain([0, day.length])
                                 .range([dayScale(dayIdx), dayScale(dayIdx+1)-10]);

          let cellDomain = day.map( (cellData, i) => {
            console.log('this.props.groupedData.length');

            console.log(this.props.groupedData.length);
            console.log('dayIdx');

            console.log(dayIdx);


             return {xVal: cellScale(i), buildStatus: cellData.buildStatus};

           });
           const circles = svgContainer.selectAll("circle")
                                       .data(
                                          _.map(cellDomain, x => {
                                           return {"cx": x.xVal, "color": x.buildStatus ? 'green': 'red'};
                                         }))
                                       .enter()
                                       .append("circle");

           const circleAttributes = circles
                                  .attr("cx", function (d) { return d.cx; })
                                  .attr("cy", function (d) { return "5px"; })
                                  .attr("r", function (d) { return "5px"; })
                                  .style("fill", function(d) { return d.color; });

     });
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
