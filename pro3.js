var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

var title = d3.select('body')
  .append('div')
  .attr('id', 'title')
  .style('text-align', 'center')

title.append('h1')
  .text('Monthly Global Land-Surface Temperature')
title.append('h2')
  .attr('id', 'description')
  .text('1753 - 2015: base temperature 8.66℃');

// Define the div for the tooltip
var div = d3.select("body").append("div")	
  .style("opacity", 0);


d3.json(url).get((error, data) => {

  var numToMonth = num => {
    var months = ['January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December']
    return months[num - 1];
  }

  console.log(data);

  //window resize handling
  d3.select(window).on("resize",newChart);

  newChart();

  function newChart() {
    // test if old chart exist and delete it
    var svgtest = d3.select('body').select('svg');
    if (!svgtest.empty()) { 
      svgtest.remove();
    }

    var h = window.innerHeight * .8;
    var w = window.innerWidth;

    var margin = {left: 100, right:50, top: 0, bottom:70};

    var svg = d3.select('body')
      .append('svg')
        .attr('height', h)
        .attr('width', w);


    // XSCALE
    var maxYear = d3.max(data.monthlyVariance, d => d.year);
    var minYear = d3.min(data.monthlyVariance, d => d.year);

    
    var xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([margin.left, w - margin.right])
    

    //XAXIS
    var xAxis = d3.axisBottom()
      .scale(xScale)
      .ticks((maxYear - minYear)/10)
      .tickFormat(d => d)
    
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h-margin.bottom})`)
      .call(xAxis)

    //YSCALE
    var yScale = d3.scaleBand()
      .domain([1,2,3,4,5,6,7,8,9,10,11,12])
      .range([margin.top, h - margin.bottom])


    //YAXIS
    var yAxis = d3.axisLeft()
      .scale(yScale)
      .tickFormat(d => numToMonth(d))

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${margin.left-1}, 0)`)
      .call(yAxis)
    
    //COLOR
    var maxTemp = data.baseTemperature + d3.max(data.monthlyVariance, d => d.variance);

    var minTemp = data.baseTemperature + d3.min(data.monthlyVariance, d => d.variance);

    var makeColorScale = (arrMinMax, colors) => {
      var range = arrMinMax[1] - arrMinMax[0];
      var distance = range / colors.length;

      var scales = [];
      for (let i = 1; i < colors.length; i++) {
        var toPush = _.round((arrMinMax[0] + distance * i), 1).toFixed(1);
        scales.push(toPush);
      }
      return scales;
    }
    
    var colors = _.reverse([ 
                            '#67001f',
                            '#b2182b',
                            '#d6604d',
                            '#f4a582',
                            '#fddbc7',
                            '#f7f7f7',
                            '#d1e5f0',
                            '#92c5de',
                            '#4393c3',
                            '#2166ac'
                          ]);
    
    // making colorScale from avaible colors and min-max range
    var colorScale = makeColorScale([minTemp,maxTemp], colors);

    var pickColor = num => {
      for (let i = 0; i < colors.length - 1; i++) {
        if (num < colorScale[i]) {
          return colors[i];
        }
      }
      return _.last(colors)
    }
    
    // RECTS
    var rectWidth = (w - margin.left - margin.right) / (maxYear - minYear);
    var rectHeigth = (h - margin.top - margin.bottom) / 12;


    var cell = svg.selectAll('rect')
      .data(data.monthlyVariance)
      .enter()
      .append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeigth)
        .attr('fill', d => pickColor(data.baseTemperature + d.variance))
        .attr('class', 'cell')
        // .attr('data-month', d => numToMonth(d.month))
        .attr('data-month', d => d.month-1) // -1 just for test to be correct
        .attr('data-year', d => d.year)
        .attr('data-temp', d => data.baseTemperature + d.variance)
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.month) )
        .on("mouseover", function(d) {	// poping up  tooltip functionality
          div
            .attr('id', 'tooltip')
            .attr('data-year', d.year)
          div.transition()		
            .duration(200)		
            .style("opacity", .7);		
          div.html(
                  '<p>'+d.year+' - '+numToMonth(d.month)+'</p>'+
                  '<p>Temp: '+_.round(data.baseTemperature + d.variance, 1).toFixed(1)+'</p>'+
                  '<p>Variance: '+_.round(d.variance, 1).toFixed(1)+'</p>'
          )	
            .style("left", (d3.event.pageX + rectWidth) + "px")		
            .style("top", (d3.event.pageY - rectHeigth) + "px");
        })					
        .on("mouseout", function(d) {		
          div.transition()		
            .duration(500)		
            .style("opacity", 0);	
        });
      

    var sizeLegend = 28;
    var legendTicksPositions = ((arr) => {
      var list = []
      for(let i = 1; i <= arr.length; i++)
        list.push(sizeLegend*i);
      return list;
    })(colorScale)

    
    var legendScale = d3.scaleOrdinal()
      .domain(colorScale)
      .range(legendTicksPositions)

    var legendAxis = d3.axisBottom(legendScale);

    var legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${margin.left}, ${h - margin.bottom / 2})`)
    

    legend.selectAll('rect')
      .data(colors)
      .enter('rect')
      .append('rect')
        .attr('width', sizeLegend)
        .attr('height', sizeLegend)
        // .attr('class', 'black')
        .attr('fill', d => d)
        .attr('x', (d,i) => sizeLegend*i)
    
    legend.append('g')
      .call(legendAxis)
      .attr('transform', 'translate(0,'+sizeLegend+')')
      .attr('class', 'legend-axis')

    svg.append('text')
      .text('Months')
      .attr('text-anchor', 'start')
      .attr('transform', 'translate('+margin.left/3+','+h/(2)+')rotate(-90)')
      .style('font', '20px sans-serif')

    svg.append('text')
      .text('Years')
      .attr('text-anchor', 'end')
      .attr('transform', 'translate('+(margin.left+w/2)+','+(margin.top+h)+')')
      .style('font', '20px sans-serif')
  }

});