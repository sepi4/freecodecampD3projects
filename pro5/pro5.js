$(document).ready(function(){
    $('#data-selector').change(function(){
      var newDataType = $("input[name='optradio']:checked").val();
      getNewData(newDataType);
       
    });
  
  var urlGames = ' https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';
  var urlMovies = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
  var urlKickstarter = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json';
  
  var colorsArr = [
    '#e6194b','#3cb44b','#ffe119','#0082c8','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff','#aa6e28','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#00ff00'
  ];
  
  function getNewData(type) {
    $('#legend').empty();
    $('#main-svg').empty();
    
    if (type === 'movies')
      url = urlMovies;
    else if (type === 'games')
      url = urlGames;
    else 
      url = urlKickstarter;
  
    d3.queue()
      .defer(d3.json, url)
      .await(ready)
  }
    
  
  function ready(error,data) {
    data.children.forEach( (x,i) => x.color = colorsArr[i])
    
    // console.log('after add colors')
    // console.log(data)
    
    var tooltip = d3.select('#tooltip')	
      .style("opacity", 0);
    
    var peli = 'Video Game Sales Data Top 100';
    
    var title = d3.select('#title')
    title.html(data.name);
    
    var description = d3.select('#description');
    if (data.name === peli) 
      description.html('Top 100 Most Sold Video Games Grouped by Platform');
    else if (data.name === 'Kickstarter')
      description.html('Top 100 Most Pledged Kickstarter Campaigns Grouped By Category');
    else if (data.name === 'Movies')
      description.html('Top 100 Highest Grossing Movies Grouped By Genre');
    
  
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
  
    var treemapLayout = d3.treemap()
      .size([width, height])
      .round(true)
      .paddingInner(1)
    
    var root = d3.hierarchy(data)
      .sum(d => d.value);
  
   
  
    
    treemapLayout(root);
  
    var nodes = d3.select('svg')
      .selectAll('rect')
      .data(root.leaves())//descendants())
      .enter()
      .append('g')
        .attr('transform', d => 'translate(' + [d.x0, d.y0] + ')')
  
    nodes.append('rect')
          .attr('class', 'tile')
          .attr('fill', (d,i) => d.parent.data.color)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('data-name', d => d.data.name)
          .attr('data-category', d => d.data.category)
          .attr('data-value', d => d.data.value)
          
    nodes.on("mousemove", function(d) {	// poping up  tooltip functionality
            var name = d.data.name;
            var category = d.data.category;
            var value = d.data.value;
            tooltip
              .attr('id', 'tooltip')
              .attr('data-value', value)
            tooltip.transition()		
              .style("opacity", .7);		
            tooltip.html('<p>Name: '+name+'</p>'+
                         '<p>Category: '+category+'</p>'+
                         '<p>Value: '+value+'</p>'
                        
                        )	
              .style("left", (d3.event.pageX+5) + "px")		
              .style("top", (d3.event.pageY-15) + "px");
          })					
          .on("mouseout", function(d) {		
            tooltip.transition()		
              .style("opacity", 0);	
          });
  
    var t = nodes.append('text')
          .attr('dx', 0)
          .attr('dy', 14)   
          .selectAll("tspan")
          .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
          .enter()
          .append('tspan')
            .attr('dy', '1.4em')
            .attr('x', 4)
            .text(d => d)
    
    // LEGEND      
    var legend = d3.select('#legend')
      .append('svg')
      .attr('height', 200)
      .attr('width', 400);
    
    var legendRectSize = 20;  
    
    // legend groups
    var g = legend.selectAll('rect')
      .data(data.children)
      .enter()
      .append('g')
        .attr('transform', (d,i) => {
          return 'translate('+(i % 3) * 150 +','+_.floor(i/3) * legendRectSize +')'
        }) 
    
    g.append('rect')
        .attr('class', 'legend-item')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .attr('fill', d => d.color)
    
    g.append('text')
      .text(d => d.name)
      .attr('y', legendRectSize * .7 )
      .attr('x', legendRectSize + 10)
        
  }
      getNewData('games');
  
  });
  