"use strict";

import { OuroborosModule, SeededPerlin } from './module.js';
import { enumBiome } from './constants.js';
import { player } from './player.js';
import { Enemy, EnemyPositionsMap } from './enemy.js';

const { randomRandInt, randomRandChoice } = OuroborosModule;

function createPerlinPath(startX, startY, segmentLength, iterations, perlin, {
  scale = 0.18, forkScale = 0.18, forkOffset = 100,
  forkThreshold = 0.99,     // 0–1: higher = fewer forks
  maxForkDepth  = 2,        // how many levels of branching allowed
  forkIterRatio = 0.99,     // forks get this fraction of remaining iterations
} = {}) {
  const occupiedCells = new Set(); const allPaths = []; 

  const cardinals = [
    [0,            [ 1,  0]], [Math.PI / 2,  [ 0,  1]],
    [Math.PI,      [-1,  0]], [Math.PI * 1.5,[ 0, -1]],
  ];

  function walk(x, y, iters, depth) {
    let cx = x, cy = y;
    occupiedCells.add(`${cx},${cy}`);

    for (let i = 0; i < iters; i++) {
      // Sample noise → angle in [0, 2π)
      const n     = perlin.noise(cx * scale, cy * scale);  // [-1, 1] ish
      const angle = (n + 1) * Math.PI;                     // map to [0, 2π)

      const sorted = cardinals.slice().sort((a, b) => {
        const da = Math.abs(((a[0] - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        const db = Math.abs(((b[0] - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        return da - db;
      });

      let moved = false;
      for (const [, [dx, dy]] of sorted) {
        const cells = []; let blocked = false;

        for (let j = 1; j <= segmentLength; j++) {
          const nx = cx + dx * j, ny = cy + dy * j;
          if (occupiedCells.has(`${nx},${ny}`)) { blocked = true; break; }
          cells.push([nx, ny]);
        }

        if (!blocked) {
          cells.forEach(c => {
            occupiedCells.add(c.join(','));
            allPaths.push(c);
          });
          cx = cx + dx * segmentLength;
          cy = cy + dy * segmentLength;
          moved = true; break;
        }
      }

      if (!moved) break;  // trapped, help me

      // Fork check
      if (depth < maxForkDepth) {
        const fn = (perlin.noise(cx * forkScale + forkOffset, cy * forkScale + forkOffset) + 1) / 2;
        if (fn > forkThreshold) {
          const forkIters = Math.max(1, Math.floor((iters - i) * forkIterRatio));
          walk(cx, cy, forkIters, depth + 1);
        }
      }
    }
  }

  allPaths.push([startX, startY]);
  walk(startX, startY, iterations, 0);
  return allPaths;
}

function noodle(data = {
  startX: 0, startY: 0, locationValue: 0, length: 1,
  iteration: 1, secondaryValue: undefined, seed: 0,
}) {
  const perlin = new SeededPerlin(data.seed ?? 0);

  const select = createPerlinPath(
    data.startX, data.startY,
    data.length, data.iteration,
    perlin,
    { forkThreshold: data.forkThreshold ?? 0.72,
      maxForkDepth:  data.maxForkDepth  ?? 2, }
  );

  select.forEach(([x, y]) => player.biomeSet(x, y, data.locationValue));
  if (data.secondaryValue !== undefined) {
    select
      .filter(([x, y]) => Math.abs(x) > 0 && Math.abs(y) > 0)
      .forEach(([x, y]) => {
        const n = (perlin.noise(x * 0.3 + 50, y * 0.3 + 50) + 1) / 2;
        // scatter ~40% of path cells, noise-driven
        if (n > 0.6) player.biomeSet(x, y, data.secondaryValue);
      });
    select
      .filter(([x, y]) => Math.abs(x) > 0 && Math.abs(y) > 0);
  }
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
  seed: 0,
  forkThreshold: 0.70,  // optional tuning
  maxForkDepth: 2,
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
