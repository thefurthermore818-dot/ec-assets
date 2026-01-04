"use strict";

function $CreateElement(
  elementObject = {elementType : 'div'}
) {
  return document.createElement(elementObject.elementType)
    .modify(($) => {$.innerHTML = elementType.innerHTML;
      return $;
    });
}

const [randomRandInt, randomRandChoice, randomRandChoices,
  arrayRemove, arrayIota, getKey] = [OuroborosModule.randomRandInt,
  OuroborosModule.randomRandChoice, OuroborosModule.randomRandChoices,
  OuroborosModule.arrayRemove, OuroborosModule.arrayIota, OuroborosModule.getKey
];

/* @interface */
const enumBiome = {
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
}

const trimString = (strings, ...values) => strings
  .reduce((acc, str, i) => acc + str + (values[i] ?? ""), "")
  .replace(/\s+/g, " ").trim();

const DialogueObject =
{
  premise: trimString`You awoke suddenly in a straw and wood cottage,
                      with a fantasy world beyond. You blinked twice 
                      to see if you were dreaming; it was not a dream.`,
};

const itemKeys = ['None',
  'Leather_Tunic', 'Wooden_Sword', 'Leather_Armor',
  'Iron_Sword', 'Health_Potion', 'Magic_Staff', 'Shield'
];

class Item
{
  constructor()
  {
    this.itemAttributesTable = new Map();
    this.itemAttributesTable.set("None", [true, 0, 0, 0, null]);
    this.itemAttributesTable.set("Leather_Tunic", ["Body", 4, 0, 1, "Common"]);
    this.itemAttributesTable.set("Wooden_Sword", ["Weapon", 0, 3, 1, "Common"]);
    this.itemAttributesTable.set("Health_Potion", ["Consumable", 0, 0, 1, "Common"]);
    // this.itemAttributesTable.set("Shield", ["Armor", 0, 2, 1, "Common"]);
    this.itemAttributesTable.set("Leather_Armor", ["Body", 6, 0, 2, "Uncommon"]);
    this.itemAttributesTable.set("Iron_Sword", ["Weapon", 0, 5, 2, "Uncommon"]);
    this.itemAttributesTable.set("Magic_Staff", ["Weapon", 0, 4, 1, "Rare"]);
  }

  isValidItem(itemName)
  { return this.itemAttributesTable.has(itemName); }
}
const item = new Item();

(function $DocumentReady(callback = function () {})
{
  if (document.readyState === "loading")
  { document.addEventListener("DOMContentLoaded", callback); }
  else { callback(); }
})(() => {console.log(new Date() - Start)});

class Player
{
  constructor()
  {
    this.position = { x: 0, y: 0 };
    this.inventoryItems = [];
    this.woreItems = new Map();
    this.woreItems.set("Weapon", "None");
    this.woreItems.set("Body", "None");
    this.woreItems.set("Head", "None");
    this.woreItems.set("Legs", "None");
    this.ItemStats = [0, 0, 0];

    for (let itemNode of this.woreItems.values())
    {
      this.ItemStats[0] = this.ItemStats[0] + (item.itemAttributesTable.get(itemNode)[1] || 0);
      this.ItemStats[1] = this.ItemStats[1] + (item.itemAttributesTable.get(itemNode)[2] || 0);
      this.ItemStats[2] = this.ItemStats[2] + (item.itemAttributesTable.get(itemNode)[3] || 0);
    }
    [this.bonusHP, this.bonusATK, this.bonusDEF] = this.ItemStats;

    this.Level = 1; this.Experience = 1;
    this.baseMaxHP = parseFloat((20 * (this.Level * 0.75)).toFixed(2));
    this.MaxHealth = this.baseMaxHP + this.bonusHP;
    this.currentHP = this.MaxHealth;
    this.baseAttack = parseFloat((5 * (this.Level * 0.85)).toFixed(2));
    this.Attack = this.baseAttack + this.bonusATK;
    this.baseDefence = parseFloat((3 * (this.Level * 0.85)).toFixed(2));
    this.Defence = this.baseDefence + this.bonusDEF;
    this.colourType =
    [ '#000000',
      '#C19A6B', '#FFFFFF', '#EF8E4C',
      '#6D6760', '#888C8D', '#42F572', '#4254F5',
      '#746580', '#2ECC71'
    ];
    this.locationDescriptor = Object.keys(enumBiome);
    this.locationType = {}; this.locationLoot = {};
    this.locationLoot['0, 0'] = ["Leather_Tunic", "Wooden_Sword"];
    this.locationType['undefined'] = enumBiome['Corrupt'];
    this.locationType['0, 0'] = enumBiome["Spawn Hut"];
    this.locationType['0, 2'] = enumBiome["Enemy Hut"];
  }

  levelUp()
  {
    this.Level = this.Level + 1;
    this.updateItemStats();
  }

  getBoxColour()
  {
    const colours = [];
    const offset = [-1, 0, 1];
    for (let Boxdy of offset)
    {
      for (let Boxdx of offset)
      {
        const key = `${this.position.x + Boxdx}, ${this.position.y - Boxdy}`;
        colours.push(this.colourType[this.locationType[key]] || this.colourType[0]);
      }
    }
    return colours;
  }

  biomeSet(CoordinateX, CoordinateY, value)
  {
    if (!Number.isInteger(CoordinateX) || !Number.isInteger(CoordinateY)
      || !Number.isInteger(value))
    {
      console.error(CoordinateX, CoordinateY, value)
      throw new TypeError("Invalid arguments");
    }
    if (value < (this.locationType[`${CoordinateX}, ${CoordinateY}`] ||
        this.locationType['undefined']))
    { this.locationType[`${CoordinateX}, ${CoordinateY}`] = value; }
  }

  move(direction)
  {
    if (typeof direction != 'string')
    { throw new TypeError("Invalid direction"); }
    switch (direction)
    {
      case 'W':
        if (this.position.y < 63)
        { this.position.y++; }
        break;
      case 'S':
        if (this.position.y > -63)
        { this.position.y--; }
        break;
      case 'A':
        if (this.position.x > -63)
        { this.position.x--; }
        break;
      case 'D':
        if (this.position.x < 63)
        { this.position.x++; }
        break;
    }
    updatePosition();
  }

  renderItems()
  {
    const container = document.getElementById('items-contained');
    container.innerHTML = '';
    if (this.inventoryItems.length === 0)
    { container.textContent = 'No items available'; }
    else
    {
      this.inventoryItems.forEach(itemNode =>
      {
        const handler = document.createElement('div');
        handler.className = 'grid-item';
        handler.textContent = itemNode;
        handler.addEventListener('click', () =>
        {
          const itemType = item.itemAttributesTable.get(itemNode)[0];
          const currentlyEquipped = this.woreItems.get(itemType);
          if (currentlyEquipped === "None")
          {
            this.woreItems.set(itemType, itemNode);
            this.inventoryItems = arrayRemove(this.inventoryItems, itemNode);
          }
          else
          {
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

  updateItemStats()
  {
    this.ItemStats = [0, 0, 0];
    for (let itemNode of this.woreItems.values())
    {
      this.ItemStats[0] = this.ItemStats[0] + item.itemAttributesTable.get(itemNode)[1];
      this.ItemStats[1] = this.ItemStats[1] + item.itemAttributesTable.get(itemNode)[2];
      this.ItemStats[2] = this.ItemStats[2] + item.itemAttributesTable.get(itemNode)[3];
    }
    [this.bonusHP, this.bonusATK, this.bonusDEF] = this.ItemStats;

    this.baseMaxHP = parseFloat((20 * (this.Level * 0.75)).toFixed(2));
    this.MaxHealth = this.baseMaxHP + this.bonusHP;
    this.currentHP = this.MaxHealth;
    this.baseAttack = parseFloat((5 * (this.Level * 0.85)).toFixed(2));
    this.Attack = this.baseAttack + this.bonusATK;
    this.baseDefence = parseFloat((3 * (this.Level * 0.85)).toFixed(2));
    this.Defence = this.baseDefence + this.bonusDEF;

    updateHPBar();
    document.getElementById('player-weapon').textContent = `${this.woreItems.get("Weapon")}`;
    document.getElementById('player-body').textContent = `${this.woreItems.get("Body")}`;
    document.getElementById('ATKStats').textContent = `ATK : ${player.baseAttack} (+${player.bonusATK})`;
    document.getElementById('DEFStats').textContent = `DEF : ${player.baseDefence} (+${player.bonusDEF})`;
    document.getElementById('player-weapon').textContent === "None" ?
      document.getElementById('player-weapon').disabled = true :
      document.getElementById('player-weapon').disabled = false;
    document.getElementById('player-body').textContent === "None" ?
      document.getElementById('player-body').disabled = true :
      document.getElementById('player-body').disabled = false;
  }

  updateLoots()
  {
    const lootItemsDiv = document.getElementById('lootItems');
    lootItemsDiv.innerHTML = '';
    const currentLoots = this.locationLoot[
      `${this.position.x}, ${this.position.y}`] || Array();
    currentLoots.forEach(loot =>
    {
      const lootButton = document.createElement('button');
      lootButton.textContent = typeof loot === 'string' ? loot : JSON.stringify(loot);
      lootButton.style.width = '100%';
      lootButton.style.marginBottom = '2.5%';
      lootButton.addEventListener('click', () =>
      {
        if (lootButton.textContent != 'None')
        {
          this.inventoryItems.push(lootButton.textContent);
          arrayRemove(this.locationLoot[`${this.position.x}, ${this.position.y}`],
            lootButton.textContent);
          this.updateLoots();
          this.renderItems();
          this.updateItemStats();
        }
      });
      lootItemsDiv.appendChild(lootButton);
    });
  }

  updateLocation()
  {
    const boxColour = this.getBoxColour();
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell =>
    {
      const index = parseInt(cell.dataset.index, 10);
      cell.style.backgroundColor = boxColour[index - 1];
      index == 5 ? cell.textContent = String(this.locationDescriptor[
        this.locationType[`${this.position.x}, ${this.position.y}`]]) :
      {};
    });
  }
}
const player = new Player();

class Enemy
{
  constructor(posX, posY, level = randomRandInt(1, 3))
  {
    this.position = { x: posX, y: posY };
    this.level = level;
    this.maxHP = 10 * this.level;
    this.currentHP = this.maxHP;
    this.baseAttack = 3;
  }

  reset() { this.currentHP = this.maxHP; }

  updateEnemyHealthBar()
  {
    document.getElementById('health-enemy')
      .style.width = 100 * (this.currentHP / this.maxHP) + '%';
    document.getElementById('health-text')
      .innerText = `Health: ${this.currentHP}/${this.maxHP}`;
  }

  takeDamage(damage)
  {
    this.currentHP -= damage;
    if (this.currentHP < 0)
    { this.currentHP = 0; }
  }

  isDefeated() { return this.currentHP <= 0; }
}

document.getElementById('ATKStats')
  .textContent = `ATK : ${player.baseAttack} (+${player.bonusATK})`;
document.getElementById('DEFStats')
  .textContent = `DEF : ${player.baseDefence} (+${player.bonusDEF})`;
document.getElementById('player-weapon').textContent === "None" ?
  document.getElementById('player-weapon').disabled = true :
  document.getElementById('player-weapon').disabled = false;
document.getElementById('player-body').textContent === "None" ?
  document.getElementById('player-body').disabled = true :
  document.getElementById('player-body').disabled = false;



function createPath(startX, startY, segmentLength, iterations)
{
  if (segmentLength < 1)
  { throw new Error("Segment length must be 1 or greater."); }

  const path = [], occupiedCells = new Set();
  let currentPos = [startX, startY];
  const startCoordStr = currentPos.join(',');
  path.push(currentPos);
  occupiedCells.add(startCoordStr);
  const directions = [
    [segmentLength, 0],
    [-segmentLength, 0],
    [0, segmentLength],
    [0, -segmentLength]
  ];

  for (let i = 0; i < iterations; i++)
  {
    let validPaths = [];
    const [x1, y1] = currentPos;

    for (const [dx, dy] of directions)
    {
      const x2 = x1 + dx, y2 = y1 + dy;
      const nextPos = [x2, y2];

      let hasCollision = false, cellsToOccupy = [];
      const stepX = Math.sign(dx), stepY = Math.sign(dy);
      const numSteps = segmentLength;

      for (let j = 1; j <= numSteps; j++)
      {
        let checkX = x1 + j * stepX, checkY = y1 + j * stepY;
        const checkCoordStr = `${checkX},${checkY}`;
        if (occupiedCells.has(checkCoordStr))
        { hasCollision = true; break; }
        cellsToOccupy.push([checkX, checkY]);
      }

      if (!hasCollision) { validPaths.push(
        { end: nextPos, cells: cellsToOccupy });
      }
    }

    if (validPaths.length === 0) break;
    const randomIndex = Math.floor(Math.random() * validPaths.length);
    const selectedPath = validPaths[randomIndex];
    selectedPath.cells.forEach(cell =>
    { path.push(cell);
      occupiedCells.add(cell.join(','));
    }); currentPos = selectedPath.end;
  } return path;
}

function noodle(data = {startX, startY, locationValue, length, iteration})
{
  let select = createPath(data.startX, data.startY, data.length, data.iteration);
  select.forEach(element => { player.biomeSet(...element, data.locationValue) });
  let secondarySelect = select.filter(element => Math.abs(element[0]) > 5 && Math.abs(element[1]) > 5)
    .filter(element => true);
   secondarySelect = secondarySelect.map(element => {
     const direction = randomRandChoice([[0, 1], [0, -1], [1, 0], [-1, 0]]);
     return [element[0] + direction[0], element[1] + direction[1]];
   }); data.secondaryValue === undefined ? {} :
   secondarySelect.forEach(element => {player.biomeSet(...element, data.secondaryValue)})
   console.log(secondarySelect)
}

function generateRandomNoiseMap(rules = {
  dimension: 1, iterations: 0, delta: 1
})
{
  let [dimension, iterations, delta] = [
    rules.dimension, rules.iterations, rules.delta
  ];
  let preWorld = {};

  for (let dy = -dimension; dy <= dimension; dy++)
  {
    for (let dx = -dimension; dx <= dimension; dx++)
    { preWorld[`${dx}, ${dy}`] = 0; }
  }

  while (iterations >= 0)
  {
    let x = randomRandInt(0, dimension);
    let y = randomRandInt(0, dimension);
    preWorld[`${x}, ${y}`] = delta;
    iterations--;
  }
  return preWorld;
}

function smoothNoise(preWorld)
{
  let postWorld = {...preWorld};
  const dimension = (Object.values(preWorld).length)
    .modify(($) => Math.sqrt($) / 2)
    .modify(($) => Math.floor($));

  for (let dy = -dimension; dy <= dimension; dy++)
  {
    for (let dx = -dimension; dx <= dimension; dx++)
    {
      let neighbors = 0;
      neighbors += preWorld[`${dx + 1}, ${dy}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx - 1}, ${dy}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx}, ${dy + 1}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx}, ${dy - 1}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx + 1}, ${dy + 1}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx - 1}, ${dy - 1}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx - 1}, ${dy + 1}`] == 1 ? 1 : 0;
      neighbors += preWorld[`${dx + 1}, ${dy - 1}`] == 1 ? 1 : 0;

      if (neighbors >= 6 && preWorld[`${dx}, ${dy}`])
      { randomRandInt(0, 1) ? postWorld[`${dx}, ${dy}`] = 2 : {}; }
    }
  }

  return postWorld;
}

function deduce(rawWorld = {
  humidity: {}, height: {}
})
{
  const fallbackValue = 9; const dimension = 64;
  for (let dy = -63; dy <= 63; dy++)
  {
    for (let dx = -63; dx <= 63; dx++)
    {
      if (rawWorld.humidity[`${dx}, ${dy}`] == 2)
      { player.biomeSet(dx, dy, enumBiome["Forest Lake"]); }
      if (rawWorld.humidity[`${dx}, ${dy}`] == 1)
      { player.biomeSet(dx, dy, enumBiome["Peaceful Forest"]); }
      else { continue; }
    }
  }
}

Object.prototype.modify = function (
  modifierFunction = function (_) {})
{ return modifierFunction(this); }

let EnemyPositionsMap = new Map();
(function generateWorld()
{
  for (let dy = -64; dy <= 64; dy++)
  {
    for (let dx = -64; dx <= 64; dx++)
    { player.biomeSet(dx, dy, enumBiome["Broad Forest"]); }
  }
  // @ Border
  for (let i = 0; i <= randomRandInt(59, 73); i++)
  {
    player.biomeSet(64, i, enumBiome["Border"]);
    player.biomeSet(i, 64, enumBiome["Border"]);
    player.biomeSet(i, -64, enumBiome["Border"]);
    player.biomeSet(-64, i, enumBiome["Border"]);
    player.biomeSet(64, -i, enumBiome["Border"]);
    player.biomeSet(-i, 64, enumBiome["Border"]);
    player.biomeSet(-i, -64, enumBiome["Border"]);
    player.biomeSet(-64, -i, enumBiome["Border"]);
  }

  let humidity = generateRandomNoiseMap(
  { dimension: 63, iterations: 4096, delta: 1
  }).modify(smoothNoise);
  deduce({humidity: humidity});

  // @ Road, Enemy Hut
  noodle({startX: 0, startY: 0,
    locationValue: enumBiome["Path"],
    length: 5, iteration: 12})

  for (let i = 0; i < 64; i++)
  {
    let canApply = true;
    let [x, y] = [randomRandInt(-64, 64), randomRandInt(-64, 64)];
    for (let dx = -2; dx <= 2; dx++)
    {
      for (let dy = -2; dy <= 2; dy++)
      {
        if (player.locationType[`${x + dx}, ${y + dy}`] < enumBiome["Steep Cliff"])
        { i--; canApply = false; break; }
        else { continue; }
      }
    }
    canApply ? player.biomeSet(x, y, enumBiome["Steep Cliff"]) : {};
  }
})();

async function resetEnemy(locationArray = [0, 0])
{ return new Promise((resolve) =>
  {
    EnemyPositionsMap.get(`${player.position.x}, ${player.position.y}`).currentHP =
      EnemyPositionsMap.get(`${player.position.x}, ${player.position.y}`).maxHP; 
    setTimeout(() =>
    { player.locationType[`${locationArray[0]}, ${locationArray[1]}`] = 
      enumBiome["Enemy Hut"];
      player.updateLocation();
    }, 1000);
  });
}

function attackEnemy()
{
  document.getElementById('message-battle').innerText = '';
  const damageSent = Math.floor(Math.random() * player.Attack) + 1;
  let locationHandler = `${player.position.x}, ${player.position.y}`;
  
  EnemyPositionsMap.get(locationHandler).currentHP -= damageSent;
  if (EnemyPositionsMap.get(locationHandler).currentHP < 0)
  { EnemyPositionsMap.get(locationHandler).currentHP = 0; }
  
  EnemyPositionsMap.get(`${locationHandler}`).updateEnemyHealthBar();
  document.getElementById('message-battle')
    .innerText = `You attacked the enemy for ${damageSent} damage! The monster looked angry.`;
  if (EnemyPositionsMap.get(`${locationHandler}`).isDefeated())
  {
    document.getElementById('message-battle').innerText += " You defeated the enemy!";
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('flee-btn').disabled = true;
    new Promise(mstimer => setTimeout(mstimer, 2048)).then(() =>
    {
      document.getElementById('enemy-container').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      player.biomeSet(player.position.x, player.position.y, 2);
      let lootItem = (() => {
        switch (EnemyPositionsMap.get(`${locationHandler}`).level)
        {
          case 1:
            return randomRandChoice(Array.from(
              item.itemAttributesTable.keys().map(loot =>
              { if (item.itemAttributesTable.get(loot)[4] === "Common")
                { return loot; }})));
            break;
          
          case 2:
          case 3:
            let lootTable = Array.from(
              item.itemAttributesTable.keys().map(loot => {
                if (item.itemAttributesTable.get(loot)[4] === "Common")
                { return loot; }}).filter(loot => loot !== undefined));
            let lootWeight = lootTable.map(loot =>
            { return item.itemAttributesTable.get(loot)[4] === "Common" 
              ? 1 : 0.5; });
            return randomRandChoices(lootTable, lootWeight);
            break;
          default: return "Leather_Tunic"; break;
        }
      })();
      player.inventoryItems.push(lootItem);
      player.renderItems(); player.updateLocation();
    }).finally(() =>
    {
      player.Experience = player.Experience + randomRandInt(3, 7);
      updateHPBar(); updateXPBar();
      document.getElementById('attack-btn').disabled = false;
      document.getElementById('flee-btn').disabled = false;
      (async function () { await resetEnemy([player.position.x, player.position.y]); })();
      // EnemyPositionsMap.get(`${player.position.x}, ${player.position.y}`).reset();
    });
  }
}

function battleflee()
{
  const successFlee = Math.random() <= 0.4;
  document.getElementById('attack-btn').disabled = true;
  document.getElementById('flee-btn').disabled = true;
  if (successFlee)
  {
    document.getElementById('message-battle')
      .innerText = "You successfully fled!";
    new Promise(mstimer => setTimeout(mstimer, 2048)).then(() =>
    {
      document.getElementById('enemy-container').style.display = 'none';
      document.getElementById('game').style.display = 'block';
    }).finally(() =>
    {
      document.getElementById('attack-btn').disabled = false;
      document.getElementById('flee-btn').disabled = false;
    });
  }
  else
  {
    document.getElementById('message-battle').innerText = "Fleeing failed! The enemy is still here.";
    document.getElementById('attack-btn').disabled = false;
    document.getElementById('flee-btn').disabled = false;
  }
}

document.getElementById('attack-btn').addEventListener( 'click', () => { attackEnemy(); });
document.getElementById('flee-btn').addEventListener( 'click', () => { battleflee(); });

function makeDescriptor(information =
  {Place: player.locationValue, repeatingPlace: Boolean(0)})
{
  const locationValue = getKey
  ({  from : enumBiome, 
    target : information.Place });
  
  const templates = [
    'You are on a $place.', 
    'You $act2 into the $place.', 
    'You see a $place and decided to take $act1 on it.', 
    'This $place has many $noun nearby.', 
    'This $place seemed $adjective.', 
  ];
  
  const templateFill = {
    'Spawn Hut': {
      act1: 'a look',
      act2: 'walk',
      adjective: 'cozy',
      noun: 'trees'
    },
    'Cabin': {
      act1: 'a rest',
      act2: 'enter',
      adjective: 'rustic',
      noun: 'animals'
    },
    'Enemy Hut': {
      act1: 'an approach',
      act2: 'sneak',
      adjective: 'ominous',
      noun: 'shadows'
    },
    'Path': {
      act1: 'a walk',
      act2: 'follow',
      adjective: 'narrow',
      noun: 'rocks'
    },
    'Steep Cliff': {
      act1: 'a climb',
      act2: 'ascend',
      adjective: 'dizzying',
      noun: 'ledges'
    },
    'Peaceful Forest': {
      act1: 'an explore',
      act2: 'wander',
      adjective: 'serene',
      noun: 'birds'
    },
    'Forest Lake': {
      act1: 'a swim',
      act2: 'approach',
      adjective: 'calm',
      noun: 'fish'
    },
    'Cave Entrance': {
      act1: 'an enter',
      act2: 'venture',
      adjective: 'dark',
      noun: 'stalactites'
    },
    'Broad Forest': {
      act1: 'a hike',
      act2: 'roam',
      adjective: 'vast',
      noun: 'clearings'
    }
  }
  
  let selectedAttribute = templateFill[locationValue];
  
  return randomRandChoice(templates)
    .replace('$place', locationValue.toLowerCase())
    .replace('$act1', selectedAttribute.act1)
    .replace('$act2', selectedAttribute.act2)
    .replace('$noun', selectedAttribute.noun)
    .replace('$adjective', selectedAttribute.adjective)
}

let updatePosition = () =>
{
  player.locationBefore = player.locationValue;
  player.locationValue = player.locationType[`${player.position.x}, ${player.position.y}`];
  
  document.getElementById('coordinates-describe')
    .textContent = `${makeDescriptor({ Place: player.locationValue,
      repeatingPlace: player.locationValue == player.locationBefore})}`;

  if (player.locationValue === enumBiome["Steep Cliff"])
  { player.currentHP = player.currentHP - 1; }

  if (player.locationValue === enumBiome["Enemy Hut"])
  {
    document.getElementById('enemy-container').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    if (!EnemyPositionsMap.get(`${player.position.x}, ${player.position.y}`))
    { EnemyPositionsMap.set(`${player.position.x}, ${player.position.y}`,
        new Enemy(player.position.x, player.position.y, randomRandInt(1, 3))); }
    document.getElementById('enemy-level').textContent = 'Level : ' +
      EnemyPositionsMap.get(`${player.position.x}, ${player.position.y}`).level;
    EnemyPositionsMap.get(`${player.position.x}, ${player.position.y}`).updateEnemyHealthBar();
  }

  if (player.currentHP <= 0)
  {
    document.getElementById('death').style.display = 'block';
    document.getElementById('game').style.display = 'none';
  }
  player.renderItems(); player.updateLocation();
  player.updateLoots(); updateHPBar();
};

document.getElementById('start-button').addEventListener('click', function ()
{
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  updatePosition(); document.getElementById('coordinates-describe')
    .textContent = String();
  (async () => { return new Promise ((resolve) =>
    { setTimeout(() => 
    { if (player.position.x == 0 && player.position.y == 0) document.getElementById('coordinates-describe')
        .textContent = DialogueObject.premise;
    }, 1000); });
  })();
});

document.querySelectorAll(".dpad input[type='button']").forEach(
  dpadButton => dpadButton.addEventListener('click', () =>
  {
    if (document.getElementById('game').style.display !== 'none')
    { player.move(dpadButton.value); }
  }));

document.getElementById('download').addEventListener('click', function ()
{
  let startTime = new Date();
  let text = String();
  text = text.concat(EncodeWorld());
  const filename = "save.bin";
  const blob = new Blob([text],
  { type: 'text/plain', });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  let endTime = new Date(); // console.log(text);
  console.log(Number(endTime) - Number(startTime), "ms");
});

document.getElementById('submit-import').addEventListener(
  'click', (event) => { Decode(document.getElementById('import-world').value); }
);

document.getElementById('fileInput').addEventListener(
  'change', (event) =>
  {
    const file = event.target.files?.[0];
    let reader = new FileReader();
    if (!file) throw RangeError();
    reader.onerror = () => { throw RangeError(); }
    reader.onload = () => { Decode(reader.result); }
    reader.readAsText(file);
  }
)

function EncodeWorld()
{
  let output = String();
  for (let dx of arrayIota(-64, 64, 1))
  {
    for (let dy of arrayIota(-64, 64, 1))
    {
      output = output.concat(`${dx} ${dy} `,
        `${player.locationType[`${dx}, ${dy}`]}`,
        '\n');
    }
  }
  return output;
}

function Decode(StringWorld)
{
  StringWorld.split('\n').forEach(line =>
  {
    let $ = line.split(' ');
    if ($.length != 3) return;
    player.biomeSet(parseInt($[0]), parseInt($[1]),
      parseInt($[2]));
  });
}

document.querySelectorAll('.equipment').forEach((element) => 
{
  element.addEventListener('click', () => 
    { console.log(element.textContent);
      if (element.textContent != 'None')
      { player.inventoryItems.push(element.textContent);
        player.renderItems(); }
    } 
  )
})

document.getElementById('grid').addEventListener('click', event =>
{
  if (document.getElementById('game').style.display !== 'none')
  {
    const cell = event.target.closest('.cell');
    if (!cell) { return; }
    const index = parseInt(cell.dataset.index, 10);
    let userMovement = [];
    if ([1, 2, 3].includes(index)) { userMovement.push('W'); }
    if ([7, 8, 9].includes(index)) { userMovement.push('S'); }
    if (index % 3 == 1) { userMovement.push('A'); }
    if (index % 3 == 0) { userMovement.push('D'); }
    if (index == 5)
    {
      document.getElementById('loots').style.display =
        document.getElementById('loots')
          .style.display === 'none' ? 'block' : 'none';
      player.updateLoots();
    }
    userMovement.forEach(direction => { player.move(direction); });
  }
});

// document.addEventListener('keydown', event =>
// {
//   if (Boolean(['W', 'A', 'S', 'D'].includes(event.key.toUpperCase())) &&
//     document.getElementById('game').style.display !== 'none')
//   { player.move(event.key.toUpperCase()); }
// });

document.getElementById('toggleBox').addEventListener('click', function ()
{
  const userBox = document.getElementById('user-box');
  if (userBox.style.display === 'none' || userBox.style.display === '')
  {
    userBox.style.display = 'block';
    player.textContent = 'Close User Box';
  }
  else
  {
    userBox.style.display = 'none';
    player.textContent = 'Open User Box';
  }
});

function updateHPBar()
{
  const hpBar = document.getElementsByClassName('hp-bar')[0];
  if (player.currentHP >= player.MaxHealth)
  { player.currentHP = player.MaxHealth; }
  const hpPercentage = player.currentHP / player.MaxHealth * 100;
  hpBar.textContent = `${player.currentHP} / ${player.MaxHealth}`;
  hpBar.style.width = hpPercentage + '%';
}
updateHPBar();

function updateXPBar()
{
  const xpBar = document.getElementsByClassName('exp-bar')[0];
  if (player.Experience >= player.Level * 3)
  { player.Level++; player.Experience = 0; }
  const xpPercentage = player.Experience / (3 * player.Level) * 100;
  xpBar.textContent = `${player.Experience} / ${player.Level * 3}`;
  xpBar.style.width = `${xpPercentage}%`;
}
updateXPBar();

document.getElementById('help-button').addEventListener('click', () =>
{ document.getElementById('help-modal').style.display = 'block'; });
document.querySelectorAll('.close-button').forEach(node =>
{
  node.addEventListener('click', () =>
  {
    document.getElementById('help-modal').style.display = 'none';
    document.getElementById('user-box').style.display = 'none';
  });
});

window.addEventListener('click', (event) =>
{
  if (event.target === document.getElementById('help-modal'))
  { document.getElementById('help-modal').style.display = 'none'; }
});