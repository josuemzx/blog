// ---------
// variables
// ---------

var CHART1 = {
  "meta": {
    "type": "pareto",
    "keys": ["600","1000","2000","3000","5000","7000","9000"],
    "keyLabel": "Score = ",
    "dotSize": 3,
    "file": "https://cdn.openai.com/research-covers/science-of-ai/pareto.json",
    "dom": "#chart1",
    "title": "Atari Beamrider: Pareto Fronts",
    "x": "Optimization Steps",
    "y": "Game Frames Processed",
    "caption": "Large batch sizes become more useful later in training as the noise scale increases.",
    "gridTicks": [1.5, 2],
    "axisTicks": [1.5, 2],
    "domainX": [1800, 160000],
    "domainY": [1000000, 400000000],
    "margin": {top: 55, right: 10, bottom: 150, left: 50},
    "aspect": 0.625
  }
};

var CHART2 = {
  "meta": {
    "type": "line",
    "file": "https://cdn.openai.com/research-covers/science-of-ai/efficiency.json",
    "thin": null,
    "dom": "#chart2",
    "title": "Atari Beamrider: Training Efficiency",
    "x": "Game Frames Processed",
    "y": "Game Score",
    "caption": "Small batch sizes train most efficiently.",
    "gridTicks": [3, 1.5],
    "axisTicks": [3, 1.5],
    "domainX": [null, null],
    "domainY": [null, null],
    "margin": {top: 55, right: 10, bottom: 150, left: 50},
    "aspect": 0.625
  }
};

var CHART3 = {
  "meta": {
    "type": "line",
    "file": "https://cdn.openai.com/research-covers/science-of-ai/speed.json",
    "thin": null,
    "dom": "#chart3",
    "title": "Atari Beamrider: Training Speed",
    "x": "Optimization Steps",
    "y": "Game Score",
    "caption": "Large batch sizes train most quickly.",
    "gridTicks": [3, 1.5],
    "axisTicks": [3, 1.5],
    "domainX": [null, null],
    "domainY": [null, null],
    "margin": {top: 55, right: 10, bottom: 150, left: 50},
    "aspect": 0.625
  }
};

var SLIDER = {
  "meta": {
    "height": 50,
    "margin": {top: 20, right: 65, bottom: 10, left: 65},
    "labelPrefix": "Batch size "
  },
  "values": [
    40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 20480
  ]
};

var GLOBAL = {};

GLOBAL.charts = [CHART1, CHART2, CHART3];
GLOBAL.tickSize = 4;
GLOBAL.superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹";

GLOBAL.formatPower = function (d) {
    return (d + "").split("").map(function(c) {
      return (c === "-") ? "⁻" : GLOBAL.superscript[c];
    }).join("");
  };

GLOBAL.tickFormatFunction = function (d) { return 10 + GLOBAL.formatPower(Math.round(Math.log(d) / Math.LN10)); }

GLOBAL.transpose = function (a) {
  return Object.keys(a[0]).map(function(c) {
    return a.map(function(r) { return r[c]; });
  });
}

GLOBAL.wrap = function (text, width) {
  text.each(function () {
    var text = d3.select(this);
    if (text.node().children.length === 0) {
      var words = text.text().split(/\s+/).reverse();
    } else {
      var textChildren = text.node().children;
      var words = [];
      for (var i = 0; i < textChildren.length; i++) {
        var childContent = textChildren[i].textContent.split(/\s+/);
        words = words.concat(childContent);
      }
      words.reverse();
    }
    var word;
    var line = [];
    var lineNumber = 0;
    var lineHeight = 1.3; // em
    var y = text.attr("y");
    var x = text.attr("x");
    var dy = text.attr("dy") === null ? 0 : parseFloat(text.attr("dy"));
    var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  })
}

GLOBAL.thinArray = function (oldArray, n, m) {
  // removes n out of every m elements from array
  if (!n) return newArray;
  var newArray = [];
  for (var i = 0; i < oldArray.length; i += m) {
    var j = i;
    while (j < i + m - n) {
      if (oldArray[j]) newArray.push(oldArray[j]);
      j++;
    }
  }
  return newArray;
}

// ---------
// functions
// ---------

function initLineChart (C) {
  // init scales
  C.x = d3.scaleLog();
  C.y = d3.scaleLog();
  C.dataThinned = [];
  C.dataX = [];
  C.dataY = [];
  for (var i = 0; i < C.data.length; i++) {
    C.dataThinned[i] = (C.meta.thin)
      ? GLOBAL.thinArray(C.data[i].coordinates, C.meta.thin[0], C.meta.thin[1])
      : C.data[i].coordinates;
    // C.dataThinned[i] = C.data[i].coordinates;
    C.dataX[i] = C.dataThinned[i].map(function (xy) { return xy[0]; });
    C.dataY[i] = C.dataThinned[i].map(function (xy) { return xy[1]; });
  }
  C.dataXFlattened = [].concat.apply([], C.dataX);
  C.dataYFlattened = [].concat.apply([], C.dataY);
  C.xMin = (C.meta.domainX[0] !== null) ? C.meta.domainX[0] : d3.min(C.dataXFlattened);
  C.xMax = (C.meta.domainX[1] !== null) ? C.meta.domainX[1] : d3.max(C.dataXFlattened);
  C.yMin = (C.meta.domainY[0] !== null) ? C.meta.domainY[0] : d3.min(C.dataYFlattened);
  C.yMax = (C.meta.domainY[1] !== null) ? C.meta.domainY[1] : d3.max(C.dataYFlattened);
  C.x.domain([C.xMin, C.xMax]);
  C.y.domain([C.yMin, C.yMax]);//.nice();

  // init svg elements
  C.svg = d3.select(C.meta.dom).append("svg");
  C.svgGroup = C.svg.append("g");
  C.chartClip = C.svgGroup.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect");
  C.chartBackground = C.svgGroup.append("rect")
    .attr("class", "chartBackground");

  // init axes and gridlines
  C.svgGroup.append("g").attr("class", "x gridlines");
  C.svgGroup.append("g").attr("class", "y gridlines");
  C.xGridlines = d3.axisBottom(C.x);
  C.yGridlines = d3.axisLeft(C.y);

  C.svgGroup.append("g").attr("class", "x axis");
  C.svgGroup.append("g").attr("class", "y axis");
  C.xAxis = d3.axisBottom(C.x);
  C.yAxis = d3.axisLeft(C.y);

  // init labels
  C.titleLabel = C.svg.append("text")
    .text(C.meta.title)
    .attr("class", "title label")
    .style("text-anchor", "middle");
  C.xAxisLabel = C.svg.append("text")
    .text(C.meta.x)
    .attr("class", "x label")
    .style("text-anchor", "middle");
  C.yAxisLabel = C.svg.append("text")
    .text(C.meta.y)
    .attr("class", "y label")
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)");
  C.captionLabel = C.svg.append("text")
    .text(C.meta.caption)
    .attr("class", "chartCaption label")
    .style("text-anchor", "middle");

  // init lines
  C.pathsGroup = C.svgGroup.append("g").attr("class", "paths").attr("clip-path", "url(#clip)");
  C.paths = [];
  C.lines = [];
  for (var i = 0; i < C.data.length; i++) {
    C.paths[i] = C.pathsGroup.append("path")
      .data([C.dataThinned[i]])
      .attr("class", "line z-line");
    C.lines[i] = d3.line()
      .curve(d3.curveBasis)
      .x(function (d, i) { return C.x(d[0]); })
      .y(function (d, i) { return C.y(d[1]); });
  }

  // init horizontal line from CHART1 keys
  C.hLine = C.pathsGroup.append("line")
    .attr("class", "line h-line");
}

function updateLineChart (C) {
  // update height and width based on parent width
  var parentWidth = d3.select(C.meta.dom).node().getBoundingClientRect().width;
  C.width = parentWidth - C.meta.margin.left - C.meta.margin.right;
  C.height = C.width * C.meta.aspect;

  // update scales
  C.x.range([0, C.width]);
  C.y.range([C.height, 0]);

  // update svg elements
  C.svg
    .attr("width", C.width + C.meta.margin.left + C.meta.margin.right)
    .attr("height", C.height + C.meta.margin.top + C.meta.margin.bottom);
  C.svgGroup.attr("transform", "translate(" + C.meta.margin.left + "," + C.meta.margin.top + ")");
  C.chartClip
    .attr("width", C.width)
    .attr("height", C.height);
  C.chartBackground
    .attr("width", C.width)
    .attr("height", C.height);

  // update axes and gridlines
  C.xGridlines.scale(C.x).tickSize([-C.height]).tickFormat("").ticks(C.meta.gridTicks[0]);
  C.yGridlines.scale(C.y).tickSize([-C.width]).tickFormat("").ticks(C.meta.gridTicks[1]);
  C.xAxis
    .scale(C.x)
    .tickPadding(6)
    .tickSize([GLOBAL.tickSize])
    .ticks(C.meta.axisTicks[0], GLOBAL.tickFormatFunction);
  C.yAxis
    .scale(C.y)
    .tickSize([GLOBAL.tickSize])
    .ticks(C.meta.axisTicks[1], GLOBAL.tickFormatFunction);

  C.svg.select(".x.gridlines")
    .attr("transform", "translate(0," + C.height + ")")
    .call(C.xGridlines);
  C.svg.select(".y.gridlines")
    .call(C.yGridlines);
  C.svg.selectAll(".gridlines .domain")
    .remove();
  C.svg.select(".x.axis")
    .attr("transform", "translate(0," + C.height + ")")
    .call(C.xAxis);
  C.svg.select(".y.axis")
    .call(C.yAxis);

  // update labels
  C.titleLabel.attr("y", 0)
    .attr("x", (C.width + C.meta.margin.left + C.meta.margin.right) / 2)
    .attr("dy", "30");
  C.xAxisLabel.attr("y", (C.height + C.meta.margin.top))
    .attr("x", (C.width + C.meta.margin.left + C.meta.margin.right) / 2)
    .attr("dx", (C.meta.margin.left - C.meta.margin.right) / 2)
    .attr("dy", "45");
  C.yAxisLabel.attr("y", 0)
    .attr("x", -(C.height + C.meta.margin.top + C.meta.margin.bottom) / 2)
    .attr("dx", (C.meta.margin.bottom - C.meta.margin.top) / 2)
    .attr("dy", "15");
  C.captionLabel.attr("y", (C.height + C.meta.margin.top))
    .attr("x", (C.width + C.meta.margin.left + C.meta.margin.right) / 2)
    .attr("dy", "5em")
    .call(GLOBAL.wrap, C.width);

  // update lines
  for (var i = 0; i < C.data.length; i++) {
    C.paths[i]
      .attr("d", C.lines[i])
      .attr("z", C.data[i].z);
  }

  // update horizontal line from CHART1 keys
  C.hLine
    .attr("x1", C.x.range()[0])
    .attr("x2", C.x.range()[1]);
}

function initParetoChart (C) {
  C.exp = {}; // exp
  C.fit = {}; // fit

  // init scales
  C.x = d3.scaleLog();
  C.y = d3.scaleLog();
  C.exp.dataX = [];
  C.exp.dataY = [];
  C.exp.dataZYX = [];
  C.fit.dataX = [];
  C.fit.dataY = [];
  for (var i = 0; i < C.meta.keys.length; i++) {
    var key = C.meta.keys[i];
    C.exp.dataX[i] = C.data["experiment results"][key].map(function (zyx) { return zyx[2] });
    C.exp.dataY[i] = C.data["experiment results"][key].map(function (zyx) { return zyx[1] }); // switched these due to data format
    C.exp.dataZYX[i] = C.data["experiment results"][key];
    C.fit.dataX[i] = C.data["fit points"][key][0];
    C.fit.dataY[i] = C.data["fit points"][key][1];
  }
  C.fit.dataXFlattened = [].concat.apply([], C.fit.dataX.concat(C.exp.dataX));
  C.fit.dataYFlattened = [].concat.apply([], C.fit.dataY.concat(C.exp.dataY));
  C.xMin = (C.meta.domainX[0] !== null) ? C.meta.domainX[0] : d3.min(C.fit.dataXFlattened);
  C.xMax = (C.meta.domainX[1] !== null) ? C.meta.domainX[1] : d3.max(C.fit.dataXFlattened);
  C.yMin = (C.meta.domainY[0] !== null) ? C.meta.domainY[0] : d3.min(C.fit.dataYFlattened);
  C.yMax = (C.meta.domainY[1] !== null) ? C.meta.domainY[1] : d3.max(C.fit.dataYFlattened);
  C.x.domain([C.xMin, C.xMax]);//.nice();
  C.y.domain([C.yMin, C.yMax]);//.nice();

  // init svg elements
  C.svg = d3.select(C.meta.dom).append("svg");
  C.svgGroup = C.svg.append("g");
  C.chartClip = C.svgGroup.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect");
  C.chartBackground = C.svgGroup.append("rect")
    .attr("class", "chartBackground");

  // init axes and gridlines
  C.svgGroup.append("g").attr("class", "x gridlines");
  C.svgGroup.append("g").attr("class", "y gridlines");
  C.xGridlines = d3.axisBottom(C.x);
  C.yGridlines = d3.axisLeft(C.y);

  C.svgGroup.append("g").attr("class", "x axis");
  C.svgGroup.append("g").attr("class", "y axis");
  C.xAxis = d3.axisBottom(C.x);
  C.yAxis = d3.axisLeft(C.y);

  // init labels
  C.titleLabel = C.svg.append("text")
    .text(C.meta.title)
    .attr("class", "title label")
    .style("text-anchor", "middle");
  C.xAxisLabel = C.svg.append("text")
    .text(C.meta.x)
    .attr("class", "x label")
    .style("text-anchor", "middle");
  C.yAxisLabel = C.svg.append("text")
    .text(C.meta.y)
    .attr("class", "y label")
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)");
  C.captionLabel = C.svg.append("text")
    .text(C.meta.caption)
    .attr("class", "chartCaption label")
    .style("text-anchor", "middle");

  // init lines
  C.pathsGroup = C.svgGroup.append("g").attr("class", "paths");//.attr("clip-path", "url(#clip)");
  C.exp.paths = [];
  C.exp.lines = [];
  C.exp.dots = [];
  C.fit.groups = [];
  C.fit.paths = [];
  C.fit.pathOverlays = [];
  C.fit.lines = [];
  C.fit.labels = [];
  for (var i = 0; i < C.meta.keys.length; i++) {
    // exp lines
    C.exp.paths[i] = C.pathsGroup.append("path")
      .data([C.exp.dataZYX[i]])
      .attr("data-key", C.meta.keys[i])
      .attr("class", "line dashed");
    C.exp.lines[i] = d3.line()
      .x(function (d, i) { return C.x(d[2]); })
      .y(function (d, i) { return C.y(d[1]); });
    // exp scatter
    C.exp.dots[i] = C.pathsGroup.selectAll("circle[i='" + i + "']")
      .data(C.exp.dataZYX[i])
      .enter()
      .append("circle")
      .attr("data-key", C.meta.keys[i])
      .attr("class", "dot")
      .attr("r", C.meta.dotSize);
    // fit lines
    C.fit.groups[i] = C.pathsGroup.append("g")
      .attr("class", "fit-group")
      .attr("data-key", C.meta.keys[i])
      .on("mousemove", function () {
        GLOBAL.updateKeys(d3.select(this).attr("data-key"));
      });
    C.fit.paths[i] = C.fit.groups[i].append("path")
      .data([GLOBAL.transpose([C.fit.dataX[i], C.fit.dataY[i]])])
      .attr("class", "line");
    C.fit.pathOverlays[i] = C.fit.groups[i].append("path")
      .data([GLOBAL.transpose([C.fit.dataX[i], C.fit.dataY[i]])])
      .attr("class", "line-overlay")
      .attr("stroke-width", 10)
      .attr("stroke", "transparent")
      .attr("fill", "none")
      .style("pointer-events", "stroke");
    C.fit.lines[i] = d3.line()
      .x(function (d, i) { return C.x(d[0]); })
      .y(function (d, i) { return C.y(d[1]); });
    C.fit.labels[i] = C.fit.groups[i].append("text")
      .text(C.meta.keyLabel + d3.format(",")(C.meta.keys[i]))
      .attr("class", "line-label");
  }

  C.svg.selectAll(".fit-group").raise();
}

GLOBAL.updateKeys = function (k) {
  CHART1.svg.selectAll(".fit-group")
    .attr("data-hover", "0");
  CHART1.svg.select(".fit-group[data-key='" + k + "']")
    .attr("data-hover", "1");
  CHART1.svg.selectAll(".dot")
    .attr("data-hover", "0");
  CHART1.svg.selectAll(".dot[data-key='" + k + "']")
    .attr("data-hover", "1");
  CHART1.svg.selectAll(".line.dashed")
    .attr("data-hover", "0");
  CHART1.svg.selectAll(".line.dashed[data-key='" + k + "']")
    .attr("data-hover", "1");

  if (!CHART2.pathsGroup || !CHART3.pathsGroup) return;
  
  CHART2.pathsGroup.select(".h-line")
    .attr("y1", CHART2.y(k))
    .attr("y2", CHART2.y(k));
  CHART3.pathsGroup.select(".h-line")
    .attr("y1", CHART3.y(k))
    .attr("y2", CHART3.y(k));
};

function updateParetoChart (C) {
  // update height and width based on parent width
  var parentWidth = d3.select(C.meta.dom).node().getBoundingClientRect().width;
  C.width = parentWidth - C.meta.margin.left - C.meta.margin.right;
  C.height = C.width * C.meta.aspect;

  // update scales
  C.x.range([0, C.width]);
  C.y.range([C.height, 0]);

  // update svg elements
  C.svg
    .attr("width", C.width + C.meta.margin.left + C.meta.margin.right)
    .attr("height", C.height + C.meta.margin.top + C.meta.margin.bottom);
  C.svgGroup.attr("transform", "translate(" + C.meta.margin.left + "," + C.meta.margin.top + ")");
  C.chartClip
    .attr("width", C.width)
    .attr("height", C.height);
  C.chartBackground
    .attr("width", C.width)
    .attr("height", C.height);

  // update axes and gridlines
  C.xGridlines.scale(C.x).tickSize([-C.height]).tickFormat("").ticks(C.meta.gridTicks[0]);
  C.yGridlines.scale(C.y).tickSize([-C.width]).tickFormat("").ticks(C.meta.gridTicks[1]);
  C.xAxis
    .scale(C.x)
    .tickPadding(6)
    .tickSize([GLOBAL.tickSize])
    .ticks(C.meta.axisTicks[0], GLOBAL.tickFormatFunction);
  C.yAxis
    .scale(C.y)
    .tickSize([GLOBAL.tickSize])
    .ticks(C.meta.axisTicks[1], GLOBAL.tickFormatFunction);

  C.svg.select(".x.gridlines")
    .attr("transform", "translate(0," + C.height + ")")
    .call(C.xGridlines);
  C.svg.select(".y.gridlines")
    .call(C.yGridlines);
  C.svg.selectAll(".gridlines .domain")
    .remove();
  C.svg.select(".x.axis")
    .attr("transform", "translate(0," + C.height + ")")
    .call(C.xAxis);
  C.svg.select(".y.axis")
    .call(C.yAxis);

  // update labels
  C.titleLabel.attr("y", 0)
    .attr("x", (C.width + C.meta.margin.left + C.meta.margin.right) / 2)
    .attr("dy", "30");
  C.xAxisLabel.attr("y", (C.height + C.meta.margin.top))
    .attr("x", (C.width + C.meta.margin.left + C.meta.margin.right) / 2)
    .attr("dx", (C.meta.margin.left - C.meta.margin.right) / 2)
    .attr("dy", "45");
  C.yAxisLabel.attr("y", 0)
    .attr("x", -(C.height + C.meta.margin.top + C.meta.margin.bottom) / 2)
    .attr("dx", (C.meta.margin.bottom - C.meta.margin.top) / 2)
    .attr("dy", "15");
  C.captionLabel.attr("y", (C.height + C.meta.margin.top))
    .attr("x", (C.width + C.meta.margin.left + C.meta.margin.right) / 2)
    .attr("dy", "5em")
    .call(GLOBAL.wrap, C.width);

  // update lines
  for (var i = 0; i < C.meta.keys.length; i++) {
    C.exp.paths[i]
      .attr("d", C.exp.lines[i]);
    C.exp.dots[i]
      .attr("z", function (d, i) { return d[0]; })
      .attr("cx", function (d, i) { return C.x(d[2]); })
      .attr("cy", function (d, i) { return C.y(d[1]); }); // switched these due to data format
    C.fit.paths[i]
      .attr("d", C.fit.lines[i]);
    C.fit.pathOverlays[i]
      .attr("d", C.fit.lines[i]);
    var pathBox = C.fit.paths[i].node().getBBox();
    C.fit.labels[i]
      .attr("x", pathBox.x + 25)
      .attr("y", pathBox.y + (pathBox.height / 2));
  }
}

function initSlider () {
  // init scales
  SLIDER.x = d3.scaleLinear()
    .domain([0, (SLIDER.values.length - 1)])
    .clamp(true);

  // init value
  SLIDER.v = SLIDER.values[0];

  // init svg elements
  SLIDER.svg = d3.select("#slider").append("svg");
  SLIDER.slider = SLIDER.svg.append("g")
    .attr("class", "slider")
  SLIDER.track = SLIDER.slider.append("line") 
    .attr("class", "track");
  SLIDER.trackOverlay = SLIDER.slider.append("line")
    .attr("class", "track-overlay")
    .attr("stroke-width", SLIDER.meta.height)
    .attr("stroke", "transparent")
    .call(d3.drag()
      .on("start.interrupt", function () { SLIDER.slider.interrupt(); })
      .on("start drag", function () {
        SLIDER.p = +d3.format('.0f')(SLIDER.x.invert(d3.event.x));
        SLIDER.update();
      }));
  SLIDER.ticks = SLIDER.slider.insert("g", ".track-overlay")
    .attr("class", "slider-ticks")
    .attr("transform", "translate(0," + 25 + ")")
    .selectAll("text")
    .data(SLIDER.x.ticks(SLIDER.values.length))
    .enter().append("text")
    .attr("text-anchor", "middle")
    .text(function (d) {
      if (!this.previousSibling) {
        return "smaller";
      } else if (!this.nextSibling) {
        return "larger";
      }
      return "";
    });
  SLIDER.handle = SLIDER.slider.insert("circle", ".track-overlay")
    .attr("class", "slider-handle")
    .attr("r", 9);
  SLIDER.label = SLIDER.slider.insert("text", ".track-overlay")
    .attr("class", "slider-label")
    .attr("transform", "translate(0,-" + 20 + ")")
    .style("text-anchor", "middle");

  // init slider position
  SLIDER.p = 3;
}

SLIDER.update = function () {
  // update position of slider and text
  SLIDER.v = SLIDER.values[SLIDER.p];
  SLIDER.handle
    .attr("cx", SLIDER.x(SLIDER.p));
  SLIDER.label
    .attr("x", SLIDER.x(SLIDER.p))
    .text(SLIDER.meta.labelPrefix + d3.format(",")(SLIDER.v));

  // update charts based off slider value SLIDER.v
  CHART1.pathsGroup.selectAll(".dot")
    .attr("data-active", "0");
  CHART2.pathsGroup.selectAll(".z-line")
    .attr("data-active", "0");
  CHART3.pathsGroup.selectAll(".z-line")
    .attr("data-active", "0");

  CHART1.pathsGroup.selectAll(".dot[z='" + SLIDER.v + "']")
    .attr("data-active", "1");
  CHART2.pathsGroup.select(".z-line[z='" + SLIDER.v + "']")
    .attr("data-active", "1")
    .raise();
  CHART3.pathsGroup.select(".z-line[z='" + SLIDER.v + "']")
    .attr("data-active", "1")
    .raise();
};

function updateSlider () {
  var parentWidth = d3.select("#slider").node().getBoundingClientRect().width;
  SLIDER.width = parentWidth - SLIDER.meta.margin.left - SLIDER.meta.margin.right;

  // update scales
  SLIDER.x
    .range([0, SLIDER.width]);

  // update svg elements
  SLIDER.svg
    .attr("width", parentWidth)
    .attr("height", SLIDER.meta.height + SLIDER.meta.margin.top + SLIDER.meta.margin.bottom);
  SLIDER.slider
    .attr("transform", "translate(" + SLIDER.meta.margin.left + "," + (SLIDER.meta.margin.top + (SLIDER.meta.height / 2)) + ")");
  SLIDER.track
    .attr("x1", SLIDER.x.range()[0])
    .attr("x2", SLIDER.x.range()[1]);
  SLIDER.trackOverlay
    .attr("x1", SLIDER.x.range()[0])
    .attr("x2", SLIDER.x.range()[1]);
  SLIDER.ticks
    .attr("x", SLIDER.x);

  // update slider position
  SLIDER.update();
}

// ---------------
// call everything
// ---------------

d3.json(CHART1.meta.file).then(function(data) {
  CHART1.data = data;
  initParetoChart(CHART1);
  updateParetoChart(CHART1);
  window.addEventListener("resize", function () {
    updateParetoChart(CHART1);
  });
})
.then(function() {
  d3.json(CHART2.meta.file).then(function(data) {
    CHART2.data = data;
    initLineChart(CHART2);
    updateLineChart(CHART2);
    window.addEventListener("resize", function () {
      updateLineChart(CHART2);
    });
  })
  .then(function() {
    d3.json(CHART3.meta.file).then(function(data) {
      CHART3.data = data;
      initLineChart(CHART3);
      updateLineChart(CHART3);
      window.addEventListener("resize", function () {
        updateLineChart(CHART3);
      });
    })
    .then(function() {
      GLOBAL.updateKeys(CHART1.meta.keys[2]);
      initSlider();
      updateSlider();
      window.addEventListener("resize", function () {
        updateSlider();
      });
    });
  });
});