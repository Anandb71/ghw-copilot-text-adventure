const rooms = {
  entrance: {
    name: 'The Entrance',
    detail: 'A cold stairwell descends into darkness.',
    description: 'A rusted service stairwell leads deeper underground. An old lamp flickers above a security desk.',
    exits: { east: 'archive', south: 'floodedHall' },
    items: ['lamp']
  },
  archive: {
    name: 'The Archive',
    detail: 'Shelves of damp records lean toward the east wall.',
    description: 'Dusty ledgers fill the room. A brass key glints beneath a collapsed map case.',
    exits: { west: 'entrance', east: 'observatory' },
    items: ['brass key']
  },
  floodedHall: {
    name: 'The Flooded Hall',
    detail: 'Shallow water ripples across the old tile.',
    description: 'The ceiling drips steadily. Something metallic is half-submerged beside a broken pump.',
    exits: { north: 'entrance', east: 'sealedDoor' },
    items: ['wire cutters']
  },
  sealedDoor: {
    name: 'The Sealed Door',
    detail: 'A black iron door blocks the eastern passage.',
    description: 'A heavy iron door bears a keyhole shaped like a narrow eye. The way east is locked.',
    exits: { west: 'floodedHall', east: 'treasureRoom' },
    items: []
  },
  observatory: {
    name: 'The Observatory',
    detail: 'A cracked glass dome shows a sliver of moonlight.',
    description: 'An abandoned instrument points toward the ceiling. The air here tastes clean, almost warm.',
    exits: { west: 'archive' },
    items: ['star chart']
  },
  treasureRoom: {
    name: 'The Treasure Room',
    detail: 'The hidden heart of the undercroft.',
    description: 'Gold and forgotten artifacts glow in the lamp light. You found the undercroft treasure.',
    exits: { west: 'sealedDoor' },
    items: []
  }
};

const itemAliases = { key: 'brass key', 'brass-key': 'brass key', cutters: 'wire cutters', chart: 'star chart' };
const state = { room: 'entrance', inventory: [], turns: 0, doorUnlocked: false, won: false };
const output = document.querySelector('#output');
const input = document.querySelector('#command-input');
const form = document.querySelector('#command-form');
const inventoryList = document.querySelector('#inventory-list');
const locationName = document.querySelector('#location-name');
const locationDetail = document.querySelector('#location-detail');
const turnCount = document.querySelector('#turn-count');

function print(message, type = '') {
  const paragraph = document.createElement('p');
  paragraph.className = type;
  paragraph.textContent = message;
  output.append(paragraph);
  output.scrollTop = output.scrollHeight;
}

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function canonicalItem(value) {
  const normalized = normalize(value).replace(/^the /, '');
  return itemAliases[normalized] || normalized;
}

function updateHud() {
  const room = rooms[state.room];
  locationName.textContent = room.name;
  locationDetail.textContent = room.detail;
  turnCount.textContent = String(state.turns).padStart(3, '0');
  inventoryList.replaceChildren();
  if (!state.inventory.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'Nothing yet';
    inventoryList.append(empty);
    return;
  }
  state.inventory.forEach((item) => {
    const entry = document.createElement('li');
    entry.textContent = item;
    inventoryList.append(entry);
  });
}

function describeRoom() {
  const room = rooms[state.room];
  const exits = Object.keys(room.exits).join(', ');
  print(`${room.name.toUpperCase()}\n${room.description}\nExits: ${exits}.`);
  if (room.items.length) print(`You notice: ${room.items.join(', ')}.`, 'important');
  if (state.room === 'sealedDoor' && state.doorUnlocked) print('The iron door stands open to the east.', 'success');
}

function go(direction) {
  const room = rooms[state.room];
  if (!room.exits[direction]) {
    print(`You cannot go ${direction} from here.`, 'important');
    return;
  }
  if (state.room === 'sealedDoor' && direction === 'east' && !state.doorUnlocked) {
    print('The iron door is locked. A brass key might fit.', 'important');
    return;
  }
  state.room = room.exits[direction];
  print(`You go ${direction}.`);
  describeRoom();
  if (state.room === 'treasureRoom') {
    state.won = true;
    print('TRANSMISSION COMPLETE: YOU FOUND THE UNDERCROFT TREASURE.', 'success');
    print('Type "look" to explore the room, or "restart" to play again.', 'system');
  }
}

function take(itemText) {
  const item = canonicalItem(itemText);
  const roomItems = rooms[state.room].items;
  const index = roomItems.indexOf(item);
  if (index === -1) {
    print(`There is no ${item} here.`, 'important');
    return;
  }
  roomItems.splice(index, 1);
  state.inventory.push(item);
  print(`Taken: ${item}.`, 'success');
  updateHud();
}

function use(itemText) {
  const item = canonicalItem(itemText);
  if (!state.inventory.includes(item)) {
    print(`You are not carrying ${item}.`, 'important');
    return;
  }
  if (item === 'brass key' && state.room === 'sealedDoor') {
    state.doorUnlocked = true;
    print('The brass key turns. The sealed door unlocks with a deep metallic clunk.', 'success');
    return;
  }
  if (item === 'lamp') print('The lamp burns brighter, revealing every corner of the room.');
  else if (item === 'wire cutters') print('The cutters are sturdy, but there is nothing here that needs cutting.');
  else if (item === 'star chart') print('The chart maps a sky that no longer exists.');
  else print(`You cannot use ${item} here.`);
}

function showInventory() {
  print(state.inventory.length ? `You are carrying: ${state.inventory.join(', ')}.` : 'Your inventory is empty.');
}

function showHelp() {
  print('COMMANDS\n  go <north|south|east|west>  Move between rooms\n  take <item>                 Pick up an item\n  use <item>                  Use an item\n  look                        Inspect your surroundings\n  inventory                   Check what you carry\n  help                        Show this list\n  restart                     Begin again');
}

function resetGame() {
  Object.assign(state, { room: 'entrance', inventory: [], turns: 0, doorUnlocked: false, won: false });
  Object.values(rooms).forEach((room) => {
    if (room.name === 'The Entrance') room.items = ['lamp'];
    if (room.name === 'The Archive') room.items = ['brass key'];
    if (room.name === 'The Flooded Hall') room.items = ['wire cutters'];
    if (room.name === 'The Observatory') room.items = ['star chart'];
  });
  output.replaceChildren();
  print('SESSION RESET. The undercroft waits.');
  describeRoom();
  updateHud();
  input.focus();
}

function handleCommand(rawCommand) {
  const command = normalize(rawCommand);
  if (!command) return;
  state.turns += 1;
  print(`> ${command}`, 'command-echo');
  const [verb, ...parts] = command.split(' ');
  const argument = parts.join(' ');
  if (verb === 'go' || verb === 'move' || ['north', 'south', 'east', 'west'].includes(verb)) go(verb === 'go' || verb === 'move' ? argument : verb);
  else if (verb === 'take' || verb === 'get' || verb === 'grab') take(argument);
  else if (verb === 'use') use(argument);
  else if (verb === 'look' || verb === 'l') describeRoom();
  else if (verb === 'inventory' || verb === 'inv' || verb === 'i') showInventory();
  else if (verb === 'help' || verb === '?') showHelp();
  else if (verb === 'restart') resetGame();
  else print(`Unknown command: ${verb}. Type "help" for available commands.`, 'important');
  updateHud();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  handleCommand(input.value);
  input.value = '';
  input.focus();
});

document.querySelector('#reset-button').addEventListener('click', resetGame);

print('CONNECTION ESTABLISHED. Welcome to THE UNDERCROFT.');
print('Find the brass key, unlock the sealed door, and reach the treasure room.', 'system');
describeRoom();
updateHud();
