"use strict";

import { Module } from './module.js';
import { enumBiome, DialogueObject } from './constants.js';
import { player } from './player.js';
import { EnemyPositionsMap, Enemy } from './enemy.js';
import { Encode, Decode } from './serialisation.js';

const { randomRandInt, randomRandChoice, getKey } = Module;

// ---------------------------------------------------------------------------
// HP, XP -> bars
// ---------------------------------------------------------------------------

export function updateHPBar() {
  const hpBar = document.getElementsByClassName('hp-bar')[0];
  if (player.currentHP >= player.MaxHealth) player.currentHP = player.MaxHealth;
  const hpPercentage = player.currentHP / player.MaxHealth * 100;
  hpBar.textContent  = `${player.currentHP} / ${player.MaxHealth}`;
  hpBar.style.width  = hpPercentage + '%';
}

export function updateXPBar() {
  const xpBar = document.getElementsByClassName('exp-bar')[0];
  if (player.Experience >= player.Level * 3) {
    player.Level++;
    player.Experience = 0;
  }
  const xpPercentage = player.Experience / (3 * player.Level) * 100;
  xpBar.textContent  = `${player.Experience} / ${player.Level * 3}`;
  xpBar.style.width  = `${xpPercentage}%`;
}

// ---------------------------------------------------------------------------
// Location narrator
// ---------------------------------------------------------------------------

function makeDescriptor(information = { Place: player.locationValue, repeatingPlace: false }) {
  const locationValue = getKey({ from: enumBiome, target: information.Place });

  const templates = [
    'You are on a $place.',
    'You $act2 into the $place.',
    'You see a $place and decided to take $act1 on it.',
    'This $place has many $noun nearby.',
    'This $place seemed $adjective.',
  ];

  const templateFill = {
    'Spawn Hut':      { act1: 'a look',    act2: 'walk',    adjective: 'cozy',     noun: 'trees'      },
    'Cabin':          { act1: 'a rest',    act2: 'enter',   adjective: 'rustic',   noun: 'animals'    },
    'Enemy Hut':      { act1: 'an approach', act2: 'sneak', adjective: 'ominous',  noun: 'shadows'    },
    'Path':           { act1: 'a walk',    act2: 'follow',  adjective: 'narrow',   noun: 'rocks'      },
    'Steep Cliff':    { act1: 'a climb',   act2: 'ascend',  adjective: 'dizzying', noun: 'ledges'     },
    'Peaceful Forest':{ act1: 'an explore',act2: 'wander',  adjective: 'serene',   noun: 'birds'      },
    'Forest Lake':    { act1: 'a swim',    act2: 'approach',adjective: 'calm',     noun: 'fish'       },
    'Cave Entrance':  { act1: 'an enter',  act2: 'venture', adjective: 'dark',     noun: 'stalactites'},
    'Broad Forest':   { act1: 'a hike',    act2: 'roam',    adjective: 'vast',     noun: 'clearings'  },
  };

  const selectedAttribute = templateFill[locationValue];

  return randomRandChoice(templates)
    .replace('$place',    locationValue.toLowerCase())
    .replace('$act1',     selectedAttribute.act1)
    .replace('$act2',     selectedAttribute.act2)
    .replace('$noun',     selectedAttribute.noun)
    .replace('$adjective',selectedAttribute.adjective);
}

// ---------------------------------------------------------------------------
// Position update (called after every move, needs to be more efficient)
// TODO: REFACTOR
// ---------------------------------------------------------------------------

export function updatePosition() {
  player.locationBefore = player.locationValue;
  player.locationValue  =
    player.locationType[`${player.position.x}, ${player.position.y}`];

  document.getElementById('coordinates-describe').textContent =
    `${makeDescriptor({
      Place: player.locationValue,
      repeatingPlace: player.locationValue === player.locationBefore,
    })}`;

  if (player.locationValue === enumBiome["Steep Cliff"]) {
    player.currentHP -= 1;
  }

  if (player.locationValue === enumBiome["Enemy Hut"]) {
    document.getElementById('enemy-container').style.display = 'block';
    document.getElementById('game').style.display            = 'none';

    const posKey = `${player.position.x}, ${player.position.y}`;
    if (!EnemyPositionsMap.get(posKey)) {
      EnemyPositionsMap.set(
        posKey,
        new Enemy(player.position.x, player.position.y, randomRandInt(1, 3))
      );
    }
    document.getElementById('enemy-level').textContent =
      'Level : ' + EnemyPositionsMap.get(posKey).level;
    EnemyPositionsMap.get(posKey).updateEnemyHealthBar();
  }

  if (player.currentHP <= 0) {
    document.getElementById('death').style.display = 'block';
    document.getElementById('game').style.display  = 'none';
  }

  player.renderItems();
  player.updateLocation();
  player.updateLoots();
  updateHPBar();
}

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

// Start button
document.getElementById('start-button').addEventListener('click', function () {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game').style.display         = 'block';
  updatePosition();
  document.getElementById('coordinates-describe').textContent = '';
  (async () => new Promise(resolve => {
    setTimeout(() => {
      if (player.position.x === 0 && player.position.y === 0) {
        document.getElementById('coordinates-describe').textContent =
          DialogueObject.premise;
      }
    }, 1000);
  }))();
});

// D-PAD, or arrows, whatever
document.querySelectorAll(".dpad input[type='button']").forEach(dpadButton =>
  dpadButton.addEventListener('click', () => {
    if (document.getElementById('game').style.display !== 'none') {
      player.move(dpadButton.value);
    }
  })
);

// Grid click-to-move, I was going to deprecated this though... 
document.getElementById('grid').addEventListener('click', event => {
  if (document.getElementById('game').style.display !== 'none') {
    const cell = event.target.closest('.cell');
    if (!cell) return;
    const index        = parseInt(cell.dataset.index, 10);
    const userMovement = [];
    if ([1, 2, 3].includes(index)) userMovement.push('W');
    if ([7, 8, 9].includes(index)) userMovement.push('S');
    if (index % 3 === 1)           userMovement.push('A');
    if (index % 3 === 0)           userMovement.push('D');
    if (index === 5) {
      const loots = document.getElementById('loots');
      loots.style.display = loots.style.display === 'none' ? 'block' : 'none';
      player.updateLoots();
    }
    userMovement.forEach(direction => player.move(direction));
  }
});

// Save / download
// TODO: FIX
document.getElementById('download').addEventListener('click', function () {
  const startTime = new Date();
  const text      = Encode();
  const blob      = new Blob([text], { type: 'text/plain' });
  const link      = document.createElement('a');
  link.href       = URL.createObjectURL(blob);
  link.download   = 'save.bin';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  console.log(Number(new Date()) - Number(startTime), "ms");
});

// Import by text
document.getElementById('submit-import').addEventListener('click', () => {
  Decode(document.getElementById('import-world').value);
});

// Import by file
document.getElementById('fileInput').addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file) throw new RangeError();
  const reader    = new FileReader();
  reader.onerror  = () => { throw new RangeError(); };
  reader.onload   = () => Decode(reader.result);
  reader.readAsText(file);
});

// Unequip on click
document.querySelectorAll('.equipment').forEach(element => {
  element.addEventListener('click', () => {
    console.log(element.textContent);
    if (element.textContent !== 'None') {
      player.inventoryItems.push(element.textContent);
      player.renderItems();
    }
  });
});

// Toggle user box
document.getElementById('toggleBox').addEventListener('click', function () {
  const userBox = document.getElementById('user-box');
  if (userBox.style.display === 'none' || userBox.style.display === '') {
    userBox.style.display = 'block';
    this.textContent      = 'Close User Box';
  } else {
    userBox.style.display = 'none';
    this.textContent      = 'Open User Box';
  }
});

// Help modal open
document.getElementById('help-button').addEventListener('click', () => {
  document.getElementById('help-modal').style.display = 'block';
});

// Close buttons (help modal + user box)
document.querySelectorAll('.close-button').forEach(node => {
  node.addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'none';
    document.getElementById('user-box').style.display   = 'none';
  });
});

// Click outside help modal to close
window.addEventListener('click', event => {
  if (event.target === document.getElementById('help-modal')) {
    document.getElementById('help-modal').style.display = 'none';
  }
});
