console.log("Assignment 3");

//Set up drawing environment with margin conventions
var margin = {t:20,r:20,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.l - margin.r,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var plot = d3.select('#plot')
    .append('svg')
    .attr('width',width + margin.l + margin.r)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','plot-area')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Initialize axes
//Consult documentation here https://github.com/mbostock/d3/wiki/SVG-Axes


var scaleX,scaleY;

var axisX = d3.svg.axis()
    .orient('bottom');
var axisY = d3.svg.axis()
    .orient('left');


//Start importing data
d3.csv('data/world_bank_2012.csv', parse, dataLoaded);

function parse(d){

    //Eliminate records for which gdp per capita isn't available
    if (d['GDP per capita, PPP (constant 2011 international $)'] == "..")
    {
        return;
    }

    //Check "primary completion" and "urban population" columns
    //if figure is unavailable and denoted as "..", replace it with undefined
    return {

        cName: d['Country Name'],
        cCode: d['Country Code'],
        gdp: d['GDP per capita, PPP (constant 2011 international $)']!=='..'? +d['GDP per capita, PPP (constant 2011 international $)']:undefined,
        primary: d['Primary completion rate, total (% of relevant age group)']!=='..'? +d['Primary completion rate, total (% of relevant age group)']:undefined,
        urban: d['Urban population (% of total)']!=='..'? +d['Urban population (% of total)']:undefined

    };

}

function dataLoaded(error, rows){
    //with data loaded, we can now mine the data
    console.log(rows);


    //with mined information, set up domain and range for x and y scales
    var gdpMin=d3.min(rows, function(d) {return d.gdp;});
    var gdpMax=d3.max(rows, function(d) {return d.gdp;});
    var primaryMin=d3.min(rows, function(d) {return d.primary;});
    var primaryMax=d3.max(rows, function(d) {return d.primary;});
    var urbanMin=d3.min(rows, function(d) {return d.urban;});
    var urbanMax=d3.max(rows, function(d) {return d.urban;});


    //Log scale for x, linear scale for y
    //scaleX = d3.scale.log()...

    scaleX = d3.scale.log()
        .domain([gdpMin,gdpMax])
        .range([0,width]);

    scaleY = d3.scale.linear()
        .domain([0,100])
        .range([height,0]);

    axisX.scale(scaleX);
    axisY.scale(scaleY);

    //Draw axisX and axisY

    plot.append('g')
        .attr('class','axis axis-x')
        .attr('transform','translate(0,'+height+')')
        .call(axisX);

    plot.append('g')
        .attr('class','axis axis-y')
        .call(axisY);


    //draw <line> elements to represent countries
    //each country should have two <line> elements, nested under a common <g> element
    //<g class="country">
    //    <line class="primaryCompletion" ... > //red line
    //    <line class="urbanPopulation" ... > //blue line
    //    </g>


    var countries = plot.selectAll('.country')
        .data(rows)
        .enter()
        .append('g')
        .attr('class', function(d){return d.cName});

    countries
        .append('line')
        .attr('class', 'primaryCompletion')
        .attr('x1', function(d){return scaleX(d.gdp)} )
        .attr('y2', height )
        .attr('x2', function(d){return scaleX(d.gdp)} )
        .attr('y1', function(d){
            if (d.primary == undefined) {
                return ; // nasty hack
            }

            return scaleY(d.primary)})
        .style('stroke', 'red');

    countries
        .append('line')
        .attr('class', 'urbanPopulation')
        .attr('x1', function(d){return scaleX(d.gdp)} )
        .attr('y2', height )
        .attr('x2', function(d){return scaleX(d.gdp)} )
        .attr('y1', function(d){

            if (d.urban == undefined) {
                //console.log(d.urban);
                return ; // nasty hack
            }

            return scaleY(d.urban)} )

        .style('stroke', 'blue');


}

