"use strict";

import { Module } from './module.js';
import { enumBiome } from './constants.js';
import { item } from './items.js';
import { player } from './player.js';
import { updateHPBar, updateXPBar } from './ui.js';

const { randomRandInt, randomRandChoices } = Module;

export class Enemy {
  constructor(posX, posY, level = randomRandInt(1, 3)) {
    this.position   = { x: posX, y: posY };
    this.level      = level;
    this.maxHP      = 10 * this.level;
    this.currentHP  = this.maxHP;
    this.baseAttack = 3;
  }

  reset() {
    this.currentHP = this.maxHP;
  }

  updateEnemyHealthBar() {
    document.getElementById('health-enemy').style.width =
      100 * (this.currentHP / this.maxHP) + '%';
    document.getElementById('health-text').innerText =
      `Health: ${this.currentHP}/${this.maxHP}`;
  }

  takeDamage(damage) {
    this.currentHP -= damage;
    if (this.currentHP < 0) this.currentHP = 0;
  }

  isDefeated() {
    return this.currentHP <= 0;
  }
}

export const EnemyPositionsMap = new Map();

async function resetEnemy(locationArray = [0, 0]) {
  return new Promise((resolve) => {
    const key = `${player.position.x}, ${player.position.y}`;
    EnemyPositionsMap.get(key).currentHP = EnemyPositionsMap.get(key).maxHP;
    setTimeout(() => {
      player.locationType[`${locationArray[0]}, ${locationArray[1]}`] =
        enumBiome["Enemy Hut"];
      player.updateLocation();
    }, 1000);
  });
}

function getLootForLevel(level) {
  switch (level) {
    case 1: {
      const commonLoot = Array.from(
        item.itemAttributesTable.keys()
      ).filter(loot => item.itemAttributesTable.get(loot)[4] === "Common");
      return commonLoot[Math.floor(Math.random() * commonLoot.length)];
    }
    case 2:
    case 3: {
      const lootTable = Array.from(
        item.itemAttributesTable.keys()
      ).filter(loot => item.itemAttributesTable.get(loot)[4] === "Common");
      const lootWeight = lootTable.map(loot =>
        item.itemAttributesTable.get(loot)[4] === "Common" ? 1 : 0.5
      );
      return randomRandChoices(lootTable, lootWeight);
    }
    default:
      return "Leather_Tunic";
  }
}

export function attackEnemy() {
  document.getElementById('message-battle').innerText = '';
  const damageSent    = Math.floor(Math.random() * player.Attack) + 1;
  const locationHandler = `${player.position.x}, ${player.position.y}`;
  const enemy         = EnemyPositionsMap.get(locationHandler);

  enemy.currentHP -= damageSent;
  if (enemy.currentHP < 0) enemy.currentHP = 0;

  enemy.updateEnemyHealthBar();
  document.getElementById('message-battle').innerText =
    `You attacked the enemy for ${damageSent} damage! The monster looked angry.`;

  if (enemy.isDefeated()) {
    document.getElementById('message-battle').innerText += " You defeated the enemy!";
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('flee-btn').disabled   = true;

    new Promise(mstimer => setTimeout(mstimer, 2048))
      .then(() => {
        document.getElementById('enemy-container').style.display = 'none';
        document.getElementById('game').style.display            = 'block';
        player.biomeSet(player.position.x, player.position.y, 2);

        const lootItem = getLootForLevel(enemy.level);
        player.inventoryItems.push(lootItem);
        player.renderItems();
        player.updateLocation();
      })
      .finally(() => {
        player.Experience += randomRandInt(3, 7);
        updateHPBar();
        updateXPBar();
        document.getElementById('attack-btn').disabled = false;
        document.getElementById('flee-btn').disabled   = false;
        (async function () {
          await resetEnemy([player.position.x, player.position.y]);
        })();
      });
  }
}

export function battleflee() {
  const successFlee = Math.random() <= 0.4;
  document.getElementById('attack-btn').disabled = true;
  document.getElementById('flee-btn').disabled   = true;

  if (successFlee) {
    document.getElementById('message-battle').innerText = "You successfully fled!";
    new Promise(mstimer => setTimeout(mstimer, 2048))
      .then(() => {
        document.getElementById('enemy-container').style.display = 'none';
        document.getElementById('game').style.display            = 'block';
      })
      .finally(() => {
        document.getElementById('attack-btn').disabled = false;
        document.getElementById('flee-btn').disabled   = false;
      });
  } else {
    document.getElementById('message-battle').innerText =
      "Fleeing failed! The enemy is still here.";
    document.getElementById('attack-btn').disabled = false;
    document.getElementById('flee-btn').disabled   = false;
  }
}

// Combat event listeners
document.getElementById('attack-btn').addEventListener('click', () => attackEnemy());
document.getElementById('flee-btn').addEventListener('click',   () => battleflee());
