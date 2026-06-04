
// SETUP
const width = 900;
const height = 400;
const margin = { top: 40, right: 40, bottom: 50, left: 60 };

// Create SVGs
const svg1 = d3.select("#chart1").append("svg")
    .attr("width", width)
    .attr("height", height);

const svg2 = d3.select("#chart2").append("svg")
    .attr("width", width)
    .attr("height", height);

const svg3 = d3.select("#chart3").append("svg")
    .attr("width", width)
    .attr("height", height);

// LOAD DATA
d3.csv("vehicles.csv").then(data => {

    console.log("Data loaded");

    data.forEach(d => {
        d.year = +d.year;
        d.comb08 = +d.comb08;
        d.co2TailpipeGpm = +d.co2TailpipeGpm;
    });

    data = data.filter(d =>
        !isNaN(d.year) &&
        !isNaN(d.comb08) &&
        !isNaN(d.co2TailpipeGpm)
    );

    // GROUP BY YEAR
    const yearly = Array.from(
        d3.group(data, d => d.year),
        ([year, values]) => ({
            year: year,
            avg_mpg: d3.mean(values, d => d.comb08),
            avg_co2: d3.mean(values, d => d.co2TailpipeGpm)
        })
    ).sort((a, b) => a.year - b.year);

    // VIS 1 — MPG OVER TIME
    const x1 = d3.scaleLinear()
        .domain(d3.extent(yearly, d => d.year))
        .range([margin.left, width - margin.right]);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(yearly, d => d.avg_mpg)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const line1 = d3.line()
        .x(d => x1(d.year))
        .y(d => y1(d.avg_mpg));

    svg1.append("path")
        .datum(yearly)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line1);

    svg1.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x1).tickFormat(d3.format("d")));

    svg1.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y1));

    svg1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Average MPG");


    svg1.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average MPG Over Time");

    // VIS 2 — CO₂ OVER TIME
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(yearly, d => d.avg_co2)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const line2 = d3.line()
        .x(d => x1(d.year))
        .y(d => y2(d.avg_co2));

    svg2.append("path")
        .datum(yearly)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line2);

    svg2.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x1).tickFormat(d3.format("d")));

    svg2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Average CO₂ Emissions (g/mi)");


    svg2.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y2));

    svg2.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average CO₂ Emissions Over Time");

    
// VIS 3 — ATV TYPE COUNTS OVER TIME

// remove blanks and group atvs
function normalizeATV(type) {
    if (!type) return null;

    const t = type.trim().toUpperCase();

    // alternative fuels group
    if (
        t === "BIFUEL (CNG)" ||
        t === "CNG" ||
        t === "FFV" ||
        t === "BIFUEL (LPG)" ||
        t === "FCV"
    ) {
        return "Alternative Fuels";
    }

    // EV group (EV + eFCV)
    if (t === "EV" || t === "EFCV") {
        return "Electric Vehicles";
    }

    
    return type.trim();
}

const atvData = data
    .filter(d => d.atvType && d.atvType.trim() !== "")
    .map(d => ({
        ...d,
        atvGroup: normalizeATV(d.atvType)
    }));

// Get unique ATV types
const atvTypes = [...new Set(atvData.map(d => d.atvGroup))];

// Count vehicles per year per ATV type
const yearlyATV = [];

// LIMIT YEARS TO 2025
const years = [...new Set(atvData.map(d => d.year))]
    .filter(y => y <= 2025)
    .sort((a, b) => a - b);

years.forEach(year => {

    const row = { year: year };

    atvTypes.forEach(type => {

        row[type] = atvData.filter(d =>
            d.year === year &&
            d.atvGroup === type
        ).length;

    });

    yearlyATV.push(row);

});

// Create separate time series for each alternative fuel
const series = atvTypes.map(type => ({
    name: type,
    values: yearlyATV.map(d => ({
        year: d.year,
        count: d[type]
    }))
}));

// Scales
const x3 = d3.scaleLinear()
    .domain(d3.extent(yearlyATV, d => d.year))
    .range([margin.left, width - margin.right]);

const y3 = d3.scaleLinear()
    .domain([
        0,
        d3.max(series, s =>
            d3.max(s.values, v => v.count)
        )
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

// Color scale
const color = d3.scaleOrdinal()
    .domain(atvTypes)
    .range(d3.schemeCategory10);

// line
const line = d3.line()
    .x(d => x3(d.year))
    .y(d => y3(d.count));

// Draw one line per ATV type
series.forEach(s => {

    svg3.append("path")
        .datum(s.values)
        .attr("fill", "none")
        .attr("stroke", color(s.name))
        .attr("stroke-width", 2)
        .attr("d", line);

});

// Axes
svg3.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x3).tickFormat(d3.format("d")));

svg3.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y3));

// Title
svg3.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Volume of Models by Fuel Type");
// y Axis Lab
svg3.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("New Models");

// Legend
const legend = svg3.append("g")
    .attr("transform", `translate(${width - 220},40)`);

atvTypes.forEach((type, i) => {

    legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 18)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(type));

    legend.append("text")
        .attr("x", 18)
        .attr("y", i * 18 + 10)
        .style("font-size", "11px")
        .text(type);

});


});