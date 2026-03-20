"use strict";

export class Item {
  constructor() {
    this.itemAttributesTable = new Map();
    this.itemAttributesTable.set("None",          [true,       0, 0, 0, null]);
    this.itemAttributesTable.set("Leather_Tunic", ["Body",     4, 0, 1, "Common"]);
    this.itemAttributesTable.set("Wooden_Sword",  ["Weapon",   0, 3, 1, "Common"]);
    this.itemAttributesTable.set("Health_Potion", ["Consumable", 0, 0, 1, "Common"]);
    // this.itemAttributesTable.set("Shield",     ["Armor",    0, 2, 1, "Common"]);
    this.itemAttributesTable.set("Leather_Armor", ["Body",     6, 0, 2, "Uncommon"]);
    this.itemAttributesTable.set("Iron_Sword",    ["Weapon",   0, 5, 2, "Uncommon"]);
    this.itemAttributesTable.set("Magic_Staff",   ["Weapon",   0, 4, 1, "Rare"]);
  }

  isValidItem(itemName) {
    return this.itemAttributesTable.has(itemName);
  }
}

// Shared singleton, but I am not shared ;D
export const item = new Item();
