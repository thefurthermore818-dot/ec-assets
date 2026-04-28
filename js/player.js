"use strict";

import { Module } from './module.js';
import { enumBiome, colourType } from './constants.js';
import { item } from './items.js';

const { arrayRemove } = Module;

export class Player {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.inventoryItems = [];
    this.woreItems = new Map();
    this.woreItems.set("Weapon", "None");
    this.woreItems.set("Body",   "None");
    this.woreItems.set("Head",   "None");
    this.woreItems.set("Legs",   "None");
    this.ItemStats = [0, 0, 0];

    for (let itemNode of this.woreItems.values()) {
      this.ItemStats[0] += item.itemAttributesTable.get(itemNode)[1] || 0;
      this.ItemStats[1] += item.itemAttributesTable.get(itemNode)[2] || 0;
      this.ItemStats[2] += item.itemAttributesTable.get(itemNode)[3] || 0;
    }
    [this.bonusHP, this.bonusATK, this.bonusDEF] = this.ItemStats;

    this.Level       = 1;
    this.Experience  = 1;
    this.baseMaxHP   = parseFloat((20 * (this.Level * 0.75)).toFixed(2));
    this.MaxHealth   = this.baseMaxHP + this.bonusHP;
    this.currentHP   = this.MaxHealth;
    this.baseAttack  = parseFloat((5  * (this.Level * 0.85)).toFixed(2));
    this.Attack      = this.baseAttack  + this.bonusATK;
    this.baseDefence = parseFloat((3  * (this.Level * 0.85)).toFixed(2));
    this.Defence     = this.baseDefence + this.bonusDEF;

    this.colourType         = colourType;
    this.locationDescriptor = Object.keys(enumBiome);
    this.locationType       = {};
    this.locationLoot       = {};

    this.locationLoot['0, 0']      = ["Leather_Tunic", "Wooden_Sword"];
    this.locationType['undefined'] = enumBiome['Corrupt'];
    this.locationType['0, 0']      = enumBiome["Spawn Hut"];
    this.locationType['0, 2']      = enumBiome["Enemy Hut"];

    this.locationValue  = undefined;
    this.locationBefore = undefined;
  }

  levelUp() {
    this.Level += 1;
    this.updateItemStats();
  }

  getBoxColour() {
    const colours = [];
    const offset  = [-1, 0, 1];
    for (let Boxdy of offset) {
      for (let Boxdx of offset) {
        const key = `${this.position.x + Boxdx}, ${this.position.y - Boxdy}`;
        colours.push(this.colourType[this.locationType[key]] || this.colourType[0]);
      }
    }
    return colours;
  }

  biomeSet(CoordinateX, CoordinateY, value) {
    if (
      !Number.isInteger(CoordinateX) ||
      !Number.isInteger(CoordinateY) ||
      !Number.isInteger(value)
    ) {
      console.error(CoordinateX, CoordinateY, value);
      throw new TypeError("Invalid arguments");
    }
    if (
      value <
      (this.locationType[`${CoordinateX}, ${CoordinateY}`] ??
        this.locationType['undefined'])
    ) {
      this.locationType[`${CoordinateX}, ${CoordinateY}`] = value;
    }
  }

  move(direction) {
    if (typeof direction !== 'string') {
      throw new TypeError("Invalid direction");
    }
    switch (direction) {
      case 'W': if (this.position.y <  63) this.position.y++; break;
      case 'S': if (this.position.y > -63) this.position.y--; break;
      case 'A': if (this.position.x > -63) this.position.x--; break;
      case 'D': if (this.position.x <  63) this.position.x++; break;
    }
    // Dynamic import avoids a circular dependency with ui.js
    import('./ui.js').then(({ updatePosition }) => updatePosition());
  }

  renderItems() {
    const container = document.getElementById('items-contained');
    container.innerHTML = '';
    if (this.inventoryItems.length === 0) {
      container.textContent = 'No items available';
    } else {
      this.inventoryItems.forEach(itemNode => {
        const handler = document.createElement('div');
        handler.className   = 'grid-item';
        handler.textContent = itemNode;
        handler.addEventListener('click', () => {
          const itemType          = item.itemAttributesTable.get(itemNode)[0];
          const currentlyEquipped = this.woreItems.get(itemType);
          if (currentlyEquipped === "None") {
            this.woreItems.set(itemType, itemNode);
            this.inventoryItems = arrayRemove(this.inventoryItems, itemNode);
          } else {
            this.inventoryItems.push(currentlyEquipped);
            this.inventoryItems = arrayRemove(this.inventoryItems, itemNode);
            this.woreItems.set(itemType, itemNode);
          }
          this.updateItemStats();
          this.renderItems();
        });
        container.appendChild(handler);
      });
    }
  }

  updateItemStats() {
    this.ItemStats = [0, 0, 0];
    for (let itemNode of this.woreItems.values()) {
      this.ItemStats[0] += item.itemAttributesTable.get(itemNode)[1];
      this.ItemStats[1] += item.itemAttributesTable.get(itemNode)[2];
      this.ItemStats[2] += item.itemAttributesTable.get(itemNode)[3];
    }
    [this.bonusHP, this.bonusATK, this.bonusDEF] = this.ItemStats;

    this.baseMaxHP   = parseFloat((20 * (this.Level * 0.75)).toFixed(2));
    this.MaxHealth   = this.baseMaxHP   + this.bonusHP;
    this.currentHP   = this.MaxHealth;
    this.baseAttack  = parseFloat((5  * (this.Level * 0.85)).toFixed(2));
    this.Attack      = this.baseAttack  + this.bonusATK;
    this.baseDefence = parseFloat((3  * (this.Level * 0.85)).toFixed(2));
    this.Defence     = this.baseDefence + this.bonusDEF;

    import('./ui.js').then(({ updateHPBar }) => updateHPBar());

    document.getElementById('player-weapon').textContent = `${this.woreItems.get("Weapon")}`;
    document.getElementById('player-body').textContent   = `${this.woreItems.get("Body")}`;
    document.getElementById('ATKStats').textContent = `ATK : ${this.baseAttack} (+${this.bonusATK})`;
    document.getElementById('DEFStats').textContent = `DEF : ${this.baseDefence} (+${this.bonusDEF})`;

    const weaponEl = document.getElementById('player-weapon');
    const bodyEl   = document.getElementById('player-body');
    weaponEl.disabled = weaponEl.textContent === "None";
    bodyEl.disabled   = bodyEl.textContent   === "None";
  }

  updateLoots() {
    const lootItemsDiv = document.getElementById('lootItems');
    lootItemsDiv.innerHTML = '';
    const currentLoots =
      this.locationLoot[`${this.position.x}, ${this.position.y}`] || [];
    currentLoots.forEach(loot => {
      const lootButton = document.createElement('button');
      lootButton.textContent        = typeof loot === 'string' ? loot : JSON.stringify(loot);
      lootButton.style.width        = '100%';
      lootButton.style.marginBottom = '2.5%';
      lootButton.addEventListener('click', () => {
        if (lootButton.textContent !== 'None') {
          this.inventoryItems.push(lootButton.textContent);
          arrayRemove(
            this.locationLoot[`${this.position.x}, ${this.position.y}`],
            lootButton.textContent
          );
          this.updateLoots();
          this.renderItems();
          this.updateItemStats();
        }
      });
      lootItemsDiv.appendChild(lootButton);
    });
  }

  updateLocation() {
    const boxColour = this.getBoxColour();
    const cells     = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      const index = parseInt(cell.dataset.index, 10);
      cell.style.backgroundColor = boxColour[index - 1];
      if (index === 5) {
        cell.textContent = String(
          this.locationDescriptor[
            this.locationType[`${this.position.x}, ${this.position.y}`]
          ]
        );
      }
    });
  }
}

// Shared singleton
export const player = new Player();
