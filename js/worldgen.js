"use strict";

import { OuroborosModule, SeededPerlin } from './module.js';
import { enumBiome } from './constants.js';
import { player } from './player.js';
import { Enemy, EnemyPositionsMap } from './enemy.js';

const { randomRandInt, randomRandChoice } = OuroborosModule;

function createPath(startX, startY, segmentLength, iterations) {
  if (segmentLength < 1) {
    throw new Error("Segment length must be 1 or greater.");
  }

  const path = [], occupiedCells = new Set();
  let currentPos = [startX, startY];
  path.push(currentPos);
  occupiedCells.add(currentPos.join(','));

  const directions = [
    [ segmentLength,  0],
    [-segmentLength,  0],
    [0,  segmentLength],
    [0, -segmentLength],
  ];

  for (let i = 0; i < iterations; i++) {
    const validPaths = [];
    const [x1, y1]  = currentPos;

    for (const [dx, dy] of directions) {
      const x2 = x1 + dx, y2 = y1 + dy;
      let hasCollision = false;
      const cellsToOccupy = [];
      const stepX = Math.sign(dx), stepY = Math.sign(dy);

      for (let j = 1; j <= segmentLength; j++) {
        const checkX = x1 + j * stepX;
        const checkY = y1 + j * stepY;
        const key    = `${checkX},${checkY}`;
        if (occupiedCells.has(key)) { hasCollision = true; break; }
        cellsToOccupy.push([checkX, checkY]);
      }

      if (!hasCollision) {
        validPaths.push({ end: [x2, y2], cells: cellsToOccupy });
      }
    }

    if (validPaths.length === 0) break;

    const selected = validPaths[Math.floor(Math.random() * validPaths.length)];
    selected.cells.forEach(cell => {
      path.push(cell);
      occupiedCells.add(cell.join(','));
    });
    currentPos = selected.end;
  }

  return path;
}

function noodle(data = { startX: 0, startY: 0, locationValue: 0, length: 1, iteration: 1, secondaryValue: undefined }) {
  const select = createPath(data.startX, data.startY, data.length, data.iteration);
  select.forEach(element => player.biomeSet(...element, data.locationValue));

  let secondarySelect = select
    .filter(element => Math.abs(element[0]) > 0 && Math.abs(element[1]) > 0)
    .map(element => {
      const direction = randomRandChoice([[0, 1], [0, -1], [1, 0], [-1, 0]]);
      return [element[0] + direction[0], element[1] + direction[1]];
    });

  if (data.secondaryValue !== undefined) {
    secondarySelect.forEach(element => player.biomeSet(...element, data.secondaryValue));
  }
  console.log(secondarySelect);
}

function generateRandomNoiseMap() {
  return (new SeededPerlin(0)).generateMap(127, 127, 1);
}

function deduce(worldField) {
  worldField.forEach((row, dy) => {
    row.forEach((it, dx) => {
      if (it * 3 >= 2) {
        player.biomeSet(dx - 63, dy - 63, enumBiome["Forest Lake"]);
      } else if (it * 2 >= 2) {
        player.biomeSet(dx - 63, dy - 63, enumBiome["Peaceful Forest"]);
      }
    });
  });
}

export function generateWorld() {
  // Fill with base biome
  for   (let dy = -64; dy <= 64; dy++) {
    for (let dx = -64; dx <= 64; dx++) {
      player.biomeSet(dx, dy, enumBiome["Broad Forest"]);
    }
  }

  // Borders
  for (let i = 0; i <= 64; i++) {
    player.biomeSet( 64,  i,  enumBiome["Border"]);
    player.biomeSet( i,   64, enumBiome["Border"]);
    player.biomeSet( i,  -64, enumBiome["Border"]);
    player.biomeSet(-64,  i,  enumBiome["Border"]);
    player.biomeSet( 64, -i,  enumBiome["Border"]);
    player.biomeSet(-i,   64, enumBiome["Border"]);
    player.biomeSet(-i,  -64, enumBiome["Border"]);
    player.biomeSet(-64, -i,  enumBiome["Border"]);
  }

  // Roads and enemy huts
  noodle({
    startX: 0, startY: 0,
    locationValue:  enumBiome["Path"],
    secondaryValue: enumBiome["Enemy Hut"],
    length: 5, iteration: 12,
  });
  
  // Humidity / forest / lakes
  deduce(generateRandomNoiseMap()); 
  
  // Steep cliffs
  for (let i = 0; i < 64; i++) {
    let canApply = true;
    const [x, y] = [randomRandInt(-64, 64), randomRandInt(-64, 64)];
    outer:
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (player.locationType[`${x + dx}, ${y + dy}`] < enumBiome["Steep Cliff"]) {
          i--;
          canApply = false;
          break outer;
        }
      }
    }
    if (canApply) player.biomeSet(x, y, enumBiome["Steep Cliff"]);
  }
}
