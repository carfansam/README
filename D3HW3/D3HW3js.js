const margin = { top: 50, right: 30, bottom: 100, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left},${margin.top})`);

d3.csv("vehiclesampledata.csv").then(function(data) {

    data.forEach(function(d) {
        d.UCity = +d.UCity;
        d.UHighway = +d.UHighway;
    });

    // Keep first 6 vehicles
    data = data.slice(0, 6);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`);

    const yAxis = svg.append("g");

    function update(metric) {

        x.domain(data.map(d => d.make + " " + d.model));

        y.domain([0, d3.max(data, d => d[metric])]);

        xAxis
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");

        yAxis
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y));

        const bars = svg.selectAll(".bar")
            .data(data);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", d => x(d.make + " " + d.model))
            .attr("y", d => y(d[metric]))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d[metric]));

        bars.exit().remove();
    }

    update("UCity");

    d3.select("#metricSelect")
        .on("change", function() {

            const selectedMetric = this.value;
            update(selectedMetric);

        });

    // X axis label
    // removed because the label is redeundant

    // Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .text("Fuel Economy (MPG)");

});