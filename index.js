// Creating a Heat Map from Monthly Global Land-Surface Temperature.
// Using D3.js to visualize data with AJAX request and  JSON API.
// Creating the project for freeCodeCamp Data Visualization Certification as a third project.

const width = 1000;
const height = 450;
const padding = 85;

let xAxisScale;
let yAxisScale;

const tooltip = d3
  .select("#tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const legendContainer = [
  { color: "rgb(217, 30, 24)", variance: "+1 or more" },
  { color: "rgba(248, 148, 6, 1)", variance: "0 or above" },
  { color: "rgba(245, 229, 27, 1)", variance: "0 or below" },
  { color: "rgba(31, 58, 147, 1)", variance: "-1 or less" },
];

const svg = d3.select("svg");
svg.attr("viewBox", `0 0 1000 450`);

svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -240)
  .attr("y", 20)
  .text("Month")
  .style("fill", "white");

svg
  .append("text")
  .attr("x", 472)
  .attr("y", 410)
  .text("Year")
  .style("fill", "white");
svg
  .append("text")
  .attr("x", width - padding + 3)
  .attr("y", 200)
  .text("Variance")
  .style("fill", "white");

const createScales = (data) => {
  const yearsArray = data.map((elem) => {
    return elem.year;
  });

  const monthsArray = data.map((elem) => {
    return new Date(elem.month.toLocaleString()) - 1;
  });

  xAxisScale = d3
    .scaleLinear()
    .domain([d3.min(yearsArray), d3.max(yearsArray) + 1])
    .range([padding, width - padding]);

  yAxisScale = d3
    .scaleTime()
    .domain([d3.min(monthsArray), d3.max(monthsArray) + 1])
    .range([padding, height - padding - 25]);
};

const setLegendContainer = () => {
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .selectAll("#legend")
    .data(legendContainer)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      return "translate(0," + (height / 2 - i * 30) + ")";
    });

  legend
    .append("rect")
    .attr("y", 69)
    .attr("x", width - padding + 5)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (elem) => {
      return elem.color;
    });
  legend
    .append("text")
    .attr("x", width - padding + 28)
    .attr("y", 82)
    .text((d) => {
      return d.variance;
    })
    .attr("font-size", 10)
    .style("fill", "white");
};

const drawCells = (data, baseTemperature) => {
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (elem) => {
      if (elem.variance <= -1) {
        return "rgba(31, 58, 147, 1)";
      } else if (elem.variance <= 0) {
        return "rgba(245, 229, 27, 1)";
      } else if (elem.variance <= 1) {
        return "rgba(248, 148, 6, 1)";
      } else {
        return "rgb(217, 30, 24)";
      }
    })
    .attr("data-month", (elem) => {
      return new Date(elem.month) - 1;
    })
    .attr("data-year", (elem) => {
      return elem.year;
    })
    .attr("data-temp", (elem) => {
      return elem.variance;
    })
    .attr("height", (height - 2 * padding) / 12)
    .attr("width", () => {
      return (width - 2 * padding) / 262;
    })
    .attr("y", (elem) => {
      return yAxisScale(new Date(elem.month.toLocaleString()) - 1);
    })
    .attr("x", (item) => {
      return xAxisScale(item.year);
    })
    .on("mouseover", (d, i) => {
      const months = new Date(d.month) - 1;
      const monthName = monthNames[months];

      tooltip.style("visibility", "visible");
      tooltip.attr("data-year", d.year);
      tooltip.html(
        `${monthName} - ${d.year} <br> ${d3.format(".1f")(
          d.variance + baseTemperature
        )}&#8451; <br> ${d3.format(".1f")(d.variance)}&#8451; `
      );
      tooltip
        .style("top", event.pageY - 2 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", (d) => {
      tooltip.style("visibility", "hidden");
    });

  setLegendContainer();
};

const createAxes = () => {
  const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yAxisScale).tickFormat(d3.timeFormat("%B"));

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (height - padding) + ")");

  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ",0)");
};

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((res) => res.json())
  .then((res) => {
    createScales(res.monthlyVariance);
    drawCells(res.monthlyVariance, res.baseTemperature);
    createAxes();
  });
