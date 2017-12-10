var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

var title = d3.select('body')
  .append('h1')
  .attr('id', 'title')
  .text('GDP');

d3.json(url).get((error, data) => {

  //window resize handling
  d3.select(window).on("resize",callFunction);
  callFunction();

  function callFunction() {
    //delete old svg if exists
    var svgtest = d3.select('body').select('svg');
    if (!svgtest.empty()) {
      svgtest.remove();
    }

    var h = window.innerHeight * 0.8;
    var w = window.innerWidth;
    var padding = 50;

    var svg = d3.select('body')
      .append('svg')
      .attr('height', h)
      .attr('w', w);

    // SCALING
    var yExtent = d3.extent(data.data, d => d[1]);
    var yScale = d3.scaleLinear()
      .domain([0,d3.max(data.data, d => d[1])])
      .range([h-padding, padding]);

    var xExtent = d3.extent(data.data, d => new Date(d[0]));
    var xScale = d3.scaleTime()
      .domain(xExtent)
      .range([padding, w-padding]);

    //RECTANGLES
    var rectWidth =(w-padding*2)/data.data.length;
    var rect = svg.selectAll('rect')
      .data(data.data)
      .enter()
      .append('rect')
        .attr('width', rectWidth)
        .attr('height', d => (h - padding) - yScale(d[1]))
        .attr('data-gdp', d => d[1])
        .attr('data-date', d => d[0])
        .attr('x', (d,i) => xScale(new Date(d[0])))
        .attr('y', d => yScale(d[1]))
        .attr('class', 'bar')
        .attr('fill', 'blue')
        // making popup tooltip that show more info
        .append("svg:title") 
          .attr('id', 'tooltip')
          .attr('data-date', d => d[0])
          .text(d => d[0]+'\n'+'$'+d[1]+' Billion')
    
    //AXISES
    var yAxis = d3.axisLeft()
      .scale(yScale)
    
    svg.append('g')
      .attr('transform', `translate(${padding},0)`)
      .call(yAxis)
      .attr('id', 'y-axis');

    var xAxis = d3.axisBottom()
      .scale(xScale);
    
    svg.append('g')
      .attr('transform', `translate(0,${h-padding})`)
      .call(xAxis)
      .attr('id', 'x-axis');

    svg.append('text') // text to left axis
      .style('text-anchor', 'middle')
      .attr("transform", "translate("+(padding+20)+", "+h/2+")rotate(-90)")
      .text('Gross Domestic Product')
    

  }

});