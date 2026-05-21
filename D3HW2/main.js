// svg size
const svgW = 900;
const svgH = 600;

//create svg
const svg = d3.select("body")
    .append("svg")
    .attr("width", svgW)
    .attr("height", svgH);

// load csv
d3.csv("forestfires.csv").then(data => {

    // convert area to number
    data.forEach(d => {
        d.area = +d.area || 0;
    });

    // group by month manually
    const monthTotals = {};
    data.forEach(d => {
        if (!monthTotals[d.month]) {
            monthTotals[d.month] = 0;
        }
        monthTotals[d.month] += d.area;
    });

    // correct month order
    const monthOrder = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

    // convert grouped data into array
    const formatted = monthOrder
        .filter(m => monthTotals[m] !== undefined)
        .map(m => ({
            month: m,
            total: monthTotals[m]
        }));

    // x scale
    const x = d3.scaleBand()
        .domain(formatted.map(d => d.month))
        .range([60, svgW - 60])
        .padding(0.2);

    // y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(formatted, d => d.total)])
        .range([svgH - 60, 60]);

    // color scale
    const color = d3.scaleSequential()
        .domain([0, d3.max(formatted, d => d.total)])
        .interpolator(d3.interpolateOrRd);

    // title
    svg.append("text")
        .attr("x", svgW / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Total Fire Area by Month");

    // bars
    svg.selectAll("rect")
        .data(formatted)
        .enter()
        .append("rect")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d.total))
        .attr("width", x.bandwidth())
        .attr("height", d => svgH - 60 - y(d.total))
        .attr("fill", d => color(d.total))
        .attr("stroke", "black");

    //month labels
    svg.selectAll(".label")
        .data(formatted)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.month) + x.bandwidth() / 2)
        .attr("y", svgH - 30)
        .attr("text-anchor", "middle")
        .text(d => d.month);

    // y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -svgH / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Total Burned Area");

});
