FlowRouter.route("/", {
  action: function() {
    React.render(<JenkinJobs />, document.body);
  }
});
