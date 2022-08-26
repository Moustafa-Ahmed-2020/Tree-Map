document.addEventListener("DOMContentLoaded", () => {
  function draw(obj) {
    const w = 1400;
    const h = 600;
    const pad = { top: 50, bottom: 50, left: 25, right: 350 };
    const wLeg = 200;
    const hLeg = 300;
    const padLeg = { top: 20, bottom: 20, left: 20, right: 20 };

    const platforms = obj.children.map((x) => x.name);

    const color = d3
      .scaleSequential()
      .domain([0, platforms.length - 1])
      .interpolator(d3.interpolateRainbow);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const svg = d3
      .select("#container")
      .append("svg")
      .attr("class", "svg")
      .attr("width", w)
      .attr("height", h);

    const legend = d3
      .select(".svg")
      .append("svg")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("x", w - wLeg - padLeg.right)
      .attr("y", h / 2 - hLeg / 2 - pad.top);

    legend
      .append("text")
      .style("text-anchor", "middle")
      .text("Legend")
      .attr("x", wLeg / 2)
      .attr("y", padLeg.top / 2);

    legend
      .selectAll("rect")
      .data(platforms)
      .enter()
      .append("rect")
      .attr("class", "legend-item")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", padLeg.left)
      .attr("y", (d, i) => {
        return i * 15 + padLeg.top;
      })
      .attr("stroke", "black")
      .attr("fill", (d) => color(platforms.indexOf(d)));

    legend
      .selectAll("text")
      .data(platforms)
      .enter()
      .append("text")
      .attr("x", padLeg.left + 20)
      .attr("y", (d, i) => {
        return i * 16 + padLeg.top - 6;
      })
      .text((d) => d);

    const root = d3
      .hierarchy(obj)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const treemap = d3
      .treemap()
      .size([w - pad.left - pad.right, h - pad.top - pad.bottom])
      .paddingInner(1);

    treemap(root);

    const g = svg.selectAll("g").data(root.leaves()).enter().append("g");

    g.attr(
      "transform",
      (d) => `translate(${d.x0 + pad.left},${d.y0 + pad.top + pad.bottom / 2})`
    )
      .append("rect")
      .attr("class", "tile")
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("fill", (d) => color(platforms.indexOf(d.data.category)))
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .on("mouseover", (e, d) => {
        tooltip.attr("data-value", d.data.value);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.style("left", e.pageX + "px").style("top", e.pageY + "px");
        tooltip.html(`Platform: ${d.data.category}<br>Value: ${d.data.value}`);
      })
      .on("mouseout", () =>
        tooltip.transition().duration(200).style("opacity", 0)
      );

    g.append("text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/\s/g))
      .enter()
      .append("tspan")
      .attr("x", (d) => 4)
      .attr("y", (d, i) => 13 + i * 8)
      .text((d) => d)
      .style("font-size", "0.5em");

    svg
      .append("text")
      .attr("id", "title")
      .attr("x", w / 2)
      .attr("y", pad.top / 2)
      .attr("text-anchor", "middle")
      .text(obj.name)
      .style("font-size", "1.5em");

    svg
      .append("text")
      .attr("id", "description")
      .attr("x", w / 2)
      .attr("y", pad.top)
      .attr("text-anchor", "middle")
      .text("Top 100 games sold categorized by platform")
      .style("font-size", "1em");

    svg.call(
      d3.zoom().on("zoom", (e) => {
        svg.attr("transform", e.transform);
      })
    );
  }

  const data = d3
    .json(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
    )
    .then((json) => draw(json));
});