// index.js
const chalk = require('chalk');
const World = require('./game/core/world');
const Player = require('./game/entities/player');
const NPCManager = require('./game/managers/npcManager');

const world = World.getInstance();

// tenta carregar save e reconstruir
const loaded = world.loadAndRebuild ? world.loadAndRebuild() : false;
if (loaded) {
  console.log(chalk.green('Save do mundo carregado.'));
  const ticks = world.applyOfflineTicks ? world.applyOfflineTicks() : 0;
  if (ticks) console.log(chalk.yellow(`Foram aplicados ${ticks} ticks offline.`));
} else {
  console.log(chalk.blue('Nenhum save encontrado — criando novo mundo.'));

  // criar um player e alguns NPCs de exemplo
  const player = new Player({ name: 'Herói', level: 1 });
  world.addEntity(player);

  // generate some npcs
  for (let i = 0; i < 3; i++) {
    const npc = NPCManager.createNPC();
    world.addEntity(npc);
  }

  world.save();
}

console.log(chalk.magenta(`Entidades atuais: ${world.entities.length}`));
for (const e of world.entities) {
  console.log(chalk.gray(`${e.name} (${e.constructor.name}) - HP: ${e.hp}/${e.maxHp}`));
}

// Modo: idle por padrão
world.mode = 'idle';

// iniciar loop do mundo (1 tick por segundo)
world.startLoop(1000);

// exemplo: parar depois de 10s (só pra demo) — retira se quiser mundo persistente infinito
setTimeout(() => {
  console.log(chalk.red('Demo finalizada — parando mundo.'));
  world.stopLoop();
  process.exit(0);
}, 10000);
