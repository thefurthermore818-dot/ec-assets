"use strict";

export const enumBiome = {
  'Border': 0,
  'Spawn Hut': 1,
  'Cabin': 2,
  'Enemy Hut': 3,
  'Path': 4,
  'Steep Cliff': 5,
  'Peaceful Forest': 6,
  'Forest Lake': 7,
  'Cave Entrance': 8,
  'Broad Forest': 9,
  'Corrupt': 128,
};

export const itemKeys = [
  'None',
  'Leather_Tunic', 'Wooden_Sword', 'Leather_Armor',
  'Iron_Sword', 'Health_Potion', 'Magic_Staff', 'Shield'
];

const trimString = (strings, ...values) => strings
  .reduce((acc, str, i) => acc + str + (values[i] ?? ""), "")
  .replace(/\s+/g, " ").trim();

export const DialogueObject = {
  premise: trimString`You awoke suddenly in a straw and wood cottage,
                      with a fantasy world beyond. You blinked twice 
                      to see if you were dreaming; it was not a dream.`,
};

export const colourType = [
  '#000000',
  '#C19A6B', '#FFFFFF', '#EF8E4C',
  '#6D6760', '#888C8D', '#42F572', '#4254F5',
  '#746580', '#2ECC71'
];
