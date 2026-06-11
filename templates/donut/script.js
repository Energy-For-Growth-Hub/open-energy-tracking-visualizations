const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const radius = 170;

const chartG = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2 + 8})`);

const centerG = chartG.append("g")
  .attr("class", "center-label");

const tooltip = d3.select(".tooltip");

const color = d3.scaleOrdinal()
  .domain(["Tier 0/1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"])
  .range([
    "#d73027",
    "#f46d43",
    "#f2cf63",
    "#8fd05a",
    "#1f9448"
  ]);

const pie = d3.pie()
  .value(d => d.share)
  .sort(null);

const arc = d3.arc()
  .innerRadius(76)
  .outerRadius(radius);

const labelArc = d3.arc()
  .innerRadius(radius * 0.72)
  .outerRadius(radius * 0.72);

const outsideLabelArc = d3.arc()
  .innerRadius(radius + 26)
  .outerRadius(radius + 26);

const leaderArc = d3.arc()
  .innerRadius(radius + 4)
  .outerRadius(radius + 4);

const params = new URLSearchParams(window.location.search);
const selectedCountry = params.get("country") || "senegal";

d3.csv("../../data/master_data_file.csv").then(data => {

  data.forEach(d => {
    d.share = +d.share;
    d.population = +d.population;
  });

  data = data.filter(d => d.slug === selectedCountry);

  if (!data.length) {
    d3.select(".chart-title").text("Country not found");
    return;
  }

  const countryName = data[0].country_name;

  d3.select(".chart-title").text(countryName);
  document.title = `${countryName} MTF Tier Donut Chart`;

  const years = Array.from(new Set(data.map(d => d.year)))
    .sort((a, b) => +a - +b);

  d3.select("#year-select")
    .selectAll("option")
    .data(years)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  update(years[years.length - 1]);

  d3.select("#year-select")
    .property("value", years[years.length - 1])
    .on("change", function() {
      update(this.value);
    });

  function update(selectedYear) {

    const yearData = data.filter(d => d.year === selectedYear);
    const pieData = pie(yearData);

    centerG.selectAll("*").remove();

    centerG.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -10)
      .attr("font-size", 38)
      .attr("font-weight", 700)
      .attr("fill", "#2E5C73")
      .text(selectedYear);

    centerG.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 24)
      .attr("font-size", 16)
      .attr("font-weight", 600)
      .attr("fill", "#2E5C73")
      .text("% of population");

    centerG.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 48)
      .attr("font-size", 16)
      .attr("font-weight", 600)
      .attr("fill", "#2E5C73")
      .text("by MTF tier");

    const slices = chartG.selectAll("path")
      .data(pieData, d => d.data.tier);

    slices.join(
      enter => enter.append("path")
        .attr("fill", d => color(d.data.tier))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("d", arc)
        .each(function(d) { this._current = d; })

        .on("mouseover", function(event, d) {

          tooltip
            .style("opacity", 1)
            .html(`
              <strong>${d.data.tier}</strong><br>
              ${d3.format(".1%")(d.data.share)} of population<br>
              ${d3.format(",")(d.data.population)} people
            `);

        })

        .on("mousemove", function(event) {

          tooltip
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY - 28) + "px");

        })

        .on("mouseout", function() {

          tooltip.style("opacity", 0);

        }),

      update => update
        .transition()
        .duration(700)
        .attrTween("d", function(d) {

          const interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(1);

          return t => arc(interpolate(t));

        }),

      exit => exit.remove()
    );

    chartG.selectAll(".leader-line")
      .data(pieData.filter(d => d.data.share < 0.05), d => d.data.tier)
      .join("polyline")
      .attr("class", "leader-line")
      .attr("points", d => {
        const labelPoint = outsideLabelArc.centroid(d);
        labelPoint[0] += labelPoint[0] < 0 ? -8 : 8;

        return [
          arc.centroid(d),
          leaderArc.centroid(d),
          labelPoint
        ];
      });

    const labels = chartG.selectAll("text.slice-label")
      .data(pieData, d => d.data.tier);

    labels.join(
      enter => enter.append("text")
        .attr("class", d => d.data.share < 0.05 ? "slice-label outside" : "slice-label")
        .attr("text-anchor", d => {
          if (d.data.share >= 0.05) return "middle";
          return outsideLabelArc.centroid(d)[0] < 0 ? "end" : "start";
        })
        .attr("transform", d => {
          if (d.data.share >= 0.05) return `translate(${labelArc.centroid(d)})`;

          const point = outsideLabelArc.centroid(d);
          point[0] += point[0] < 0 ? -12 : 12;
          return `translate(${point})`;
        })
        .text(d => d3.format(".0%")(d.data.share)),

      update => update
        .attr("class", d => d.data.share < 0.05 ? "slice-label outside" : "slice-label")
        .attr("text-anchor", d => {
          if (d.data.share >= 0.05) return "middle";
          return outsideLabelArc.centroid(d)[0] < 0 ? "end" : "start";
        })
        .transition()
        .duration(700)
        .attr("transform", d => {
          if (d.data.share >= 0.05) return `translate(${labelArc.centroid(d)})`;

          const point = outsideLabelArc.centroid(d);
          point[0] += point[0] < 0 ? -12 : 12;
          return `translate(${point})`;
        })
        .text(d => d3.format(".0%")(d.data.share)),

      exit => exit.remove()
    );
  }

});
