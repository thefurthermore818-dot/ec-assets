"use strict";

import { Start } from './module.js';
import { player } from './player.js';
import { generateWorld } from './worldgen.js';
import { updateHPBar, updateXPBar } from './ui.js';

// All event -> ui.js and enemy.js
import './enemy.js';
import './ui.js';

// generates world
generateWorld();

// init UI state
document.getElementById('ATKStats').textContent =
  `ATK : ${player.baseAttack} (+${player.bonusATK})`;
document.getElementById('DEFStats').textContent =
  `DEF : ${player.baseDefence} (+${player.bonusDEF})`;

const weaponEl = document.getElementById('player-weapon');
const bodyEl   = document.getElementById('player-body');
weaponEl.disabled = weaponEl.textContent === "None";
bodyEl.disabled   = bodyEl.textContent   === "None";

updateHPBar();
updateXPBar();

// log: DOMContentLoaded
(function $DocumentReady(callback = function () {}) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
})(() => { console.log(new Date() - Start); });
