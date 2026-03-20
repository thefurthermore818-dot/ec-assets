"use strict";

import { OuroborosModule } from './module.js';
import { player } from './player.js';

const { arrayIota } = OuroborosModule;

export function EncodeWorld() {
  let output = '';
  for (let dx of arrayIota(-64, 64, 1)) {
    for (let dy of arrayIota(-64, 64, 1)) {
      output += `${dx} ${dy} ${player.locationType[`${dx}, ${dy}`]}\n`;
    }
  }
  return output;
}

export function Decode(StringWorld) {
  StringWorld.split('\n').forEach(line => {
    const parts = line.split(' ');
    if (parts.length !== 3) return;
    player.biomeSet(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
  });
}
