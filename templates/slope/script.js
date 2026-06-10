
    function changeValue(d) {
      return endValue(d) - startValue(d);
    }

    function endY(d) {
      return baseY[d[0]] - changeValue(d) * slopeMultiplier;
    }

    function changePP(d) {
      return Math.round(changeValue(d) * 100);
    }

    g.selectAll(".guide-line")
      .data([startYear, endYear])
      .join("line")
      .attr("class", "guide-line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 30)
      .attr("y2", 465);

    g.selectAll(".year-label")
      .data([startYear, endYear])
      .join("text")
      .attr("class", "year-label")
      .attr("x", d => x(d))
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .text(d => d);

    g.selectAll(".slope-line")
      .data(grouped)
      .join("line")
      .attr("x1", d => x(startYear))
      .attr("x2", d => x(endYear))
      .attr("y1", d => baseY[d[0]])
      .attr("y2", d => endY(d))
      .attr("stroke", d => color(d[0]))
      .attr("stroke-width", 5)
      .attr("stroke-linecap", "round");

    g.selectAll(".start-point")
      .data(grouped)
      .join("circle")
      .attr("cx", x(startYear))
      .attr("cy", d => baseY[d[0]])
      .attr("r", 7)
      .attr("fill", d => color(d[0]));

    g.selectAll(".end-point")
      .data(grouped)
      .join("circle")
      .attr("cx", x(endYear))
      .attr("cy", d => endY(d))
      .attr("r", 7)
      .attr("fill", d => color(d[0]));

    g.selectAll(".tier-dot")
      .data(grouped)
      .join("circle")
      .attr("cx", -200)
      .attr("cy", d => baseY[d[0]])
      .attr("r", 8)
      .attr("fill", d => color(d[0]));

    g.selectAll(".tier-label")
      .data(grouped)
      .join("text")
      .attr("class", "tier-label")
      .attr("x", -178)
      .attr("y", d => baseY[d[0]] + 7)
      .text(d => d[0]);

    g.selectAll(".left-value-label")
      .data(grouped)
      .join("text")
      .attr("class", "value-label")
      .attr("x", -35)
      .attr("y", d => baseY[d[0]] + 7)
      .attr("text-anchor", "end")
      .text(d => formatPercent(startValue(d)));

    g.selectAll(".right-value-label")
      .data(grouped)
      .join("text")
      .attr("class", "value-label")
      .attr("x", chartWidth + 22)
      .attr("y", d => endY(d) + 7)
      .text(d => formatPercent(endValue(d)));

    drawChangePanel(grouped);
  }

  function drawChangePanel(grouped) {
    const panelX = chartWidth + 90;
    const panelY = 20;
    const cardWidth = 140;
    const cardHeight = 56;
    const gap = 14;

    g.append("text")
      .attr("class", "change-title")
      .attr("x", panelX + cardWidth / 2)
      .attr("y", panelY)
      .attr("text-anchor", "middle")
      .text("Change");

    g.append("text")
      .attr("class", "change-subtitle")
      .attr("x", panelX + cardWidth / 2)
      .attr("y", panelY + 22)
      .attr("text-anchor", "middle")
      .text("(percentage points)");

    const cards = g.selectAll(".change-card-group")
      .data(grouped)
      .join("g")
      .attr("class", "change-card-group")
      .attr("transform", (d, i) => `translate(${panelX}, ${panelY + 48 + i * (cardHeight + gap)})`);

    cards.append("rect")
      .attr("class", "change-card")
      .attr("width", cardWidth)
      .attr("height", cardHeight);

    cards.append("circle")
      .attr("cx", 32)
      .attr("cy", cardHeight / 2)
      .attr("r", 20)
      .attr("fill", d => color(d[0]));

    cards.append("text")
      .attr("class", "change-icon")
      .attr("x", 32)
      .attr("y", cardHeight / 2 + 8)
      .attr("text-anchor", "middle")
      .text(d => {
        const pp = Math.round((d[1][1].share - d[1][0].share) * 100);
        if (pp > 0) return "↑";
        if (pp < 0) return "↓";
        return "→";
      });

    cards.append("text")
      .attr("class", "change-text")
      .attr("x", 68)
      .attr("y", cardHeight / 2 + 8)
      .attr("fill", d => color(d[0]))
      .text(d => {
        const pp = Math.round((d[1][1].share - d[1][0].share) * 100);
        if (pp > 0) return `+${pp} pp`;
        if (pp < 0) return `${pp} pp`;
        return "0 pp";
      });
  }
});
