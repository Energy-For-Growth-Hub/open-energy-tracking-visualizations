const svg = d3.select("#slope-chart");
const width = 600;
const height = 520;

const margin = {
  top: 84,
  right: 96,
  bottom: 44,
  left: 104
};

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const tiers = ["Tier 0/1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"];

const rowY = d3.scalePoint()
  .domain(tiers)
  .range([72, chartHeight - 24]);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const color = d3.scaleOrdinal()
  .domain(tiers)
  .range(["#d73027", "#f46d43", "#f2cf63", "#8fd05a", "#1f9448"]);

const params = new URLSearchParams(window.location.search);
const selectedCountry = params.get("country") || "senegal";

function formatPeople(value) {
  const absolute = Math.abs(value);

  if (absolute >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (absolute >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return d3.format(",.0f")(value);
}

function formatChange(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value / 1000000).toFixed(2)}M`;
}

function changeIcon(value) {
  if (value > 0) return "↑";
  if (value < 0) return "↓";
  return "→";
}

d3.csv("../../data/master_data_file.csv").then(data => {
  data.forEach(d => {
    d.year = +d.year;
    d.population = +d.population;
  });

  data = data.filter(d => d.slug === selectedCountry);

  if (!data.length) {
    d3.select(".chart-title").text("Country not found");
    d3.select(".chart-area").html("<p style=\"padding: 24px; color: #2E5C73;\">Country not found.</p>");
    return;
  }

  const countryName = data[0].country_name;
  d3.select(".chart-title").text(countryName);
  document.title = `${countryName} MTF Tier Slope Chart`;

  const years = Array.from(new Set(data.map(d => d.year)))
    .sort((a, b) => a - b);

  d3.select("#start-year")
    .selectAll("option")
    .data(years)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  d3.select("#end-year")
    .selectAll("option")
    .data(years)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  d3.select("#start-year").property("value", years[0]);
  d3.select("#end-year").property("value", years[years.length - 1]);

  update(years[0], years[years.length - 1]);

  d3.selectAll("#start-year, #end-year").on("change", function() {
    const startYear = +d3.select("#start-year").property("value");
    const endYear = +d3.select("#end-year").property("value");
    update(startYear, endYear);
  });

  function getTierPair(tier, startYear, endYear) {
    const start = data.find(d => d.tier === tier && d.year === startYear);
    const end = data.find(d => d.tier === tier && d.year === endYear);

    if (!start || !end) return null;

    return {
      tier,
      startYear,
      endYear,
      startPopulation: start.population,
      endPopulation: end.population,
      change: end.population - start.population
    };
  }

  function update(startYear, endYear) {
    g.selectAll("*").remove();

    const chartData = tiers
      .map(tier => getTierPair(tier, startYear, endYear))
      .filter(Boolean);

    const maxAbsChange = d3.max(chartData, d => Math.abs(d.change)) || 1;
    const changeOffset = d3.scaleLinear()
      .domain([-maxAbsChange, maxAbsChange])
      .range([42, -42]);

    const x = d3.scalePoint()
      .domain([startYear, endYear])
      .range([0, chartWidth]);

    g.selectAll(".guide-line")
      .data([startYear, endYear])
      .join("line")
      .attr("class", "guide-line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 34)
      .attr("y2", chartHeight - 8);

    g.selectAll(".year-label")
      .data([startYear, endYear])
      .join("text")
      .attr("class", "year-label")
      .attr("x", d => x(d))
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .text(d => d);

    g.selectAll(".slope-line")
      .data(chartData)
      .join("line")
      .attr("class", "slope-line")
      .attr("x1", d => x(d.startYear))
      .attr("x2", d => x(d.endYear))
      .attr("y1", d => rowY(d.tier))
      .attr("y2", d => rowY(d.tier) + changeOffset(d.change))
      .attr("stroke", d => color(d.tier));

    g.selectAll(".start-point")
      .data(chartData)
      .join("circle")
      .attr("class", "slope-point start-point")
      .attr("cx", d => x(d.startYear))
      .attr("cy", d => rowY(d.tier))
      .attr("r", 7)
      .attr("fill", d => color(d.tier));

    g.selectAll(".end-point")
      .data(chartData)
      .join("circle")
      .attr("class", "slope-point end-point")
      .attr("cx", d => x(d.endYear))
      .attr("cy", d => rowY(d.tier) + changeOffset(d.change))
      .attr("r", 7)
      .attr("fill", d => color(d.tier));

    g.selectAll(".left-value-label")
      .data(chartData)
      .join("text")
      .attr("class", "value-label left-value-label")
      .attr("x", -18)
      .attr("y", d => rowY(d.tier) + 6)
      .attr("text-anchor", "end")
      .text(d => formatPeople(d.startPopulation));

    g.selectAll(".right-value-label")
      .data(chartData)
      .join("text")
      .attr("class", "value-label right-value-label")
      .attr("x", chartWidth + 18)
      .attr("y", d => rowY(d.tier) + changeOffset(d.change) + 6)
      .attr("text-anchor", "start")
      .text(d => formatPeople(d.endPopulation));

    drawChangeCards(chartData);
  }

  function drawChangeCards(chartData) {
    const cards = d3.select(".change-list")
      .selectAll(".change-card")
      .data(chartData, d => d.tier)
      .join("div")
      .attr("class", "change-card")
      .style("border-color", d => color(d.tier));

    cards.html("");

    cards.append("span")
      .attr("class", "change-icon")
      .style("background", d => color(d.tier))
      .text(d => changeIcon(d.change));

    cards.append("span")
      .attr("class", "change-value")
      .style("color", d => color(d.tier))
      .text(d => formatChange(d.change));
  }

});
