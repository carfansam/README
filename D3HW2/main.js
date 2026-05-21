const svgW = 900;
const svgH = 600;

const svg = d3.select("body")
    .append("svg")
    .attr("width", svgW)
    .attr("height", svgH);

d3.csv("forestfires.csv").then(data => {

    console.log("DATA LOADED:", data.length);

    // convert area to number
    data.forEach(d => {
        d.area = +d.area || 0;
    });

    // GROUP BY MONTH (THIS IS THE KEY PART)
    const monthly = d3.rollups(
        data,
        v => d3.sum(v, d => d.area),
        d => d.month
    );

    // convert to usable array
    const formatted = monthly.map(d => ({
        month: d[0],
        total: d[1]
    }));

    console.log("MONTHLY DATA:", formatted);

    const x = d3.scaleBand()
        .domain(formatted.map(d => d.month))
        .range([60, svgW - 60])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formatted, d => d.total)])
        .range([svgH - 60, 60]);

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

    // labels (months)
    svg.selectAll("text.label")
        .data(formatted)
        .enter()
        .append("text")
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

}).catch(err => {
    console.log("CSV ERROR:", err);
});