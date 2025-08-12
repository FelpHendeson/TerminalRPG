// game/managers/npcManager.js
const NPC = require('../entities/npc');

function createNPC(overrides = {}) {
  const baseNames = ['Aldo', 'Mira', 'Corvo', 'Juno', 'Haku', 'Sel'];
  const roles = ['villager', 'merchant', 'quest_giver', 'guard', 'trainer'];
  const name = overrides.name || baseNames[Math.floor(Math.random() * baseNames.length)];
  const role = overrides.role || roles[Math.floor(Math.random() * roles.length)];
  const level = overrides.level || Math.max(1, Math.floor(Math.random() * 5));
  return new NPC({
    name,
    role,
    level,
    maxHp: overrides.maxHp || 30 + level * 10,
    atk: overrides.atk || 3 + level * 2,
    def: overrides.def || 1 + Math.floor(level / 2),
    spd: overrides.spd || 2 + Math.floor(level / 2),
    dialogue: overrides.dialogue || [`Olá, eu sou ${name}.`]
  });
}

function fromJSON(json) {
  return NPC.fromJSON(json);
}

module.exports = {
  createNPC,
  fromJSON
};
