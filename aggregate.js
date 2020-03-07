#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");

const CELL_DIMENSIONS = 1000;
const aggregated = {};

(async () => {
  const text = await fs.readFile(path.resolve(".", process.argv[2]), "utf8");

  const lines = text.split('\n').slice(1);
  const rawData = new Array(lines.length);

  let minLat = Number.POSITIVE_INFINITY;
  let minLng = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;

  let count = 0;

  lines.forEach((line) => {
    const items = line.split(",");

    if (items.length < 3) {
      return;
    }

    rawData[count] = {
      latitude: parseFloat(items[0]),
      longitude: parseFloat(items[1]),
      population: parseFloat(items[2])
    };

    minLat = Math.min(minLat, rawData[count].latitude);
    minLng = Math.min(minLng, rawData[count].longitude);
    maxLat = Math.max(maxLat, rawData[count].latitude);
    maxLng = Math.max(maxLng, rawData[count].longitude);
    count++;
  });

  rawData.length = count;

  const rangeLat = maxLat - minLat;
  const stepLat = rangeLat / CELL_DIMENSIONS;
  const rangeLng = maxLng - minLng;
  const stepLng = rangeLng / CELL_DIMENSIONS;

  let dataCount = 0;
  rawData.forEach((item) => {
    const x = Math.floor((item.longitude - minLng) / stepLng);
    const y = Math.floor((item.latitude - minLat) / stepLat);

    aggregated[x] = aggregated[x] || {};
    if (!aggregated[x][y]) {
      aggregated[x][y] = {
        latitude: minLat + parseFloat(y) * stepLat,
        longitude: minLng + parseFloat(x) * stepLng,
        population: 0,
        index: dataCount++,
        area: 0
      };
    }
    aggregated[x][y].population += item.population;
    aggregated[x][y].area += 900; // 30x30m grid tiles https://dataforgood.fb.com/docs/methodology-high-resolution-population-density-maps-demographic-estimates/
  });

  const data = new Array(dataCount);
  for (const x in aggregated) {
    for (const y in aggregated[x]) {
      const {index, latitude, longitude, population, area} = aggregated[x][y];
      data[index] = {
        latitude,
        longitude,
        population: (population / area) * 1000000 // Convert to persons / km^2
      }
    }
  }

  console.log(JSON.stringify(data));
})();
