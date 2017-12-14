var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

var title = d3.select('body')
  .append('div')
  .attr('id', 'title')
  .style('text-align', 'center')

title.append('h1')
  .text('Doping in Professional Bicycle Racing')
title.append('h2')
  .text('35 Fastest times up Alpe d');

d3.json(url).get((error, data) => {

  //window resize handling
  d3.select(window).on("resize",callFunction);

  callFunction();

  function callFunction() {
    var svgtest = d3.select('body').select('svg');
    if (!svgtest.empty()) {
      svgtest.remove();
    }

    var h = window.innerHeight * .6;
    var w = window.innerWidth;
    var margin = {left: 70, right:50, top: 20, bottom:50};

    var svg = d3.select('body')
      .append('svg')
      .attr('height', h)
      .attr('width', w);


    console.log(data);
    var xMax = d3.max(data, d => d.Year);
    var xMin = d3.min(data, d => d.Year);
    // console.log([xMin, xMax]);

    var toSeconds = str => { // func to convert string to seconds number
      var arr = str.split(":");
      var time = Number(arr[0])*60 + Number(arr[1]);
      return time
    }

    var yMax = d3.max(data, d => toSeconds(d.Time));
    var yMin = d3.min(data, d => toSeconds(d.Time));
    // console.log([yMin, yMax]);

    var yScale = d3.scaleLinear()
      .domain([yMin - 10, yMax + 10])
      .range([margin.top, h-margin.bottom]);

    var yAxis = d3.axisLeft()
      .scale(yScale)
      .tickFormat(d => { // formating the yAxis back to minutes:seconds format
        if (d%60 === 0) 
          return Math.floor(d/60) +":00";
        else 
          return Math.floor(d/60) +":"+ d%60; // adding additional zero
      });

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .attr('id', 'y-axis');

    var xScale = d3.scaleLinear()
      .domain([xMin-1, xMax+1])
      .range([margin.left, w-margin.right]);

    var xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d => d)

    svg.append('g')
      .attr('transform', `translate(0, ${h-margin.bottom})`)
      .call(xAxis)
      .attr('id', 'x-axis');

    // Define the div for the tooltip
    var div = d3.select("body").append("div")	
      .attr("id", "tooltip")				
      .style("opacity", 0);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(toSeconds(d.Time)))
        .attr('r', 5)
        .attr('fill',d => (d.Doping).trim().length === 0  ? 'green': 'red')
        .attr('stroke','black')
        .attr('class', 'dot')
        .attr('data-yvalue', d => toSeconds(d.Time))
        .attr('data-xvalue', d => d.Year)
        // .attr('data-xvalue', d => d3.timeParse('%Y-%m-%d')(d.Year) )

        .style('opacity', '0.6')
        .on("mousemove", function(d) {	// popingup  tooltip
            div.attr('data-year', d.Year)
                .transition()		
                .duration(200)		
                .style("opacity", .6);		
            div	.html('<p>'+d.Name+': '+d.Nationality+'</p>'
                      +'<p>Year: '+d.Year+', Time: '+d.Time+'</p>'
                      +'<p>'+d.Doping+'</p>'
                     )	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });

    
    var legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${w - margin.right}, ${h/2})`)
    
    legend.append('rect')  
        .attr('fill', 'red')
        .attr('height', 20)
        .attr('width', 20)

    legend.append('text')  
        .attr('text-anchor', 'end')
        .attr("transform", "translate(-10, 14)")
        .text('Riders with doping allegations')
        .style('font-size', 10)

    legend.append('rect')  
        .attr('fill', 'green')
        .attr('height', 20)
        .attr('width', 20)
        .attr('transform', `translate(0, 30)`)

    legend.append('text')  
        .attr('text-anchor', 'end')
        .attr("transform", "translate(-10, 44)")
        .text('No doping allegations')
        .style('font-size', 10)


    svg.append('text') // text to left axis
      .attr('text-anchor', 'middle')
      .attr("transform", "translate("+(margin.left-50)+", "+h/3+")rotate(-90)")
      .text('Time in minutes')
      .style('font-size', 20)


  }

});