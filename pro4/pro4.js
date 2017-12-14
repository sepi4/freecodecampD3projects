var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

var path = d3.geoPath();

// Define the div for the tooltip
var tooltip = d3.select("body").append("div")	
.style("opacity", 0);

// MAP
var url = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

var url2 = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';  


d3.queue()
.defer(d3.json, url)
.defer(d3.json, url2)
.await(ready)



function ready(error, data, us) {
if (error) throw error;
console.log('data');
console.log(data);
console.log('us');
console.log(us);

var educationExtent = d3.extent(data, d => d.bachelorsOrHigher)

var colors = d3.schemeReds[7];
colors = _.tail(colors)

var min = d3.min(data, d => d.bachelorsOrHigher);

var max = d3.max(data, d => d.bachelorsOrHigher);
var diff = max - min;
var plus = diff/(colors.length);


var arr = _.range(min + plus, max, plus);
var roundedArr = arr.map(x => _.round(x))

var colorScale = d3.scaleThreshold()
.domain(roundedArr)
.range(colors);


//COUNTIES
svg.append("g")
  .selectAll('path')
  .data(topojson.feature(us, us.objects.counties).features)
  .enter().append('path')
  .attr("class", "counties")
  .attr('class', 'county')
  .attr('fill', d =>	{
        var obj = _.find(data, o => o.fips === d.id);
    d.objekti = obj;
    var educationRatio = obj.bachelorsOrHigher;
        return colorScale(educationRatio);

  })
  .attr('d', path)
  .attr('data-fips', s => s.objekti.fips)
  .attr('data-education', s => s.objekti.bachelorsOrHigher)
  .on("mousemove", function(d) {	// poping up  tooltip functionality
    var name = d.objekti.area_name;
    var state = d.objekti.state;
    var er = d.objekti.bachelorsOrHigher;
    tooltip
      .attr('id', 'tooltip')
      .attr('data-education', er)
    tooltip.transition()		
      .style("opacity", .7);		
    tooltip.html('<p>'+`${name}, ${state}, ${er} %`+'</p>')	
      .style("left", (d3.event.pageX+5) + "px")		
      .style("top", (d3.event.pageY-15) + "px");
  })					
  .on("mouseout", function(d) {		
    tooltip.transition()		
      .style("opacity", 0);	
  });



//STATES BORDERS
svg.append('path')
      .datum(topojson.mesh(us, us.objects.states, (a,b) => a!==b))
      .attr('class', 'states')
      .attr('d', path)


// LEGEND
var legend = svg.append('g')
.attr('id', 'legend')
.attr('transform', `translate(${width/2},0)`)

var legendWidth = 30;
var legendHeight = 10;
var legendTicksPositions = _.range(legendWidth, legendWidth*colors.length, legendWidth)

var legendScale = d3.scaleOrdinal()
.domain(roundedArr)
.range(legendTicksPositions)

var legendAxis = d3.axisBottom(legendScale)
.tickFormat(x => x+'%')


legend.selectAll('rect')
.data(colors)
.enter().append('rect')
  .attr('height', legendHeight)
  .attr('x', (d,i) => i*legendWidth)
  .attr('width', legendWidth)
  .attr('fill', d => d)

legend.append('g')
.call(legendAxis)
.attr('transform', 'translate(0,'+legendHeight+')')
.selectAll('path')
  .style('display', 'none')



}
