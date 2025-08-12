// game/core/world.js
const chalk = require('chalk');
const { saveWorld, loadWorld } = require('./saveManager');
const Player = require('../entities/player');
const NPCManager = require('../managers/npcManager');

class World {
  constructor() {
    if (World._instance) return World._instance;
    this.time = Date.now();
    this.tickCounter = 0;
    this.entities = []; // todos os objetos (Player, NPC, ...). Guardamos instâncias
    this.history = [];
    this.mode = 'active'; // 'active' | 'idle' (pode ser trocado)
    World._instance = this;
  }

  static getInstance() {
    return World._instance || new World();
  }

  log(event) {
    const stamp = new Date().toISOString();
    const line = `[${stamp}] ${event}`;
    this.history.push(line);
    console.log(chalk.gray(line));
    // opcional: manter history limitado
    if (this.history.length > 1000) this.history.shift();
  }

  addEntity(entity) {
    this.entities.push(entity);
    this.log(`Entidade adicionada: ${entity.name} (${entity.id})`);
  }

  removeEntityById(id) {
    this.entities = this.entities.filter(e => e.id !== id);
  }

  findEntityById(id) {
    return this.entities.find(e => e.id === id);
  }

  // Faz lógica de 1 tick - aqui só exemplo simples (regeneração)
  tick() {
    this.tickCounter++;
    this.time = Date.now();
    this.log(`Tick ${this.tickCounter} executado. Mode: ${this.mode}`);

    // exemplo: regenerar pequenas quantias se estiver idle
    for (const ent of this.entities) {
      if (ent.isAlive()) {
        // regen simples
        if (this.mode === 'idle') {
          ent.heal(Math.max(1, Math.floor(ent.maxHp * 0.01))); // 1% de HP por tick (ajusta)
        }
      }
    }

    // salva a cada tick (pode ser menos frequente)
    this.save();
  }

  startLoop(intervalMs = 1000) {
    if (this._interval) return; // já rodando
    this.log('Iniciando loop do mundo...');
    // Calcular offline ticks ao carregar será feito externamente antes de startLoop
    this._interval = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  stopLoop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
      this.log('Loop do mundo parado.');
    }
  }

  save() {
    const data = {
      meta: {
        time: this.time,
        tickCounter: this.tickCounter,
        mode: this.mode
      },
      history: this.history,
      entities: this.entities.map(e => e.toJSON ? e.toJSON() : e.getStats())
    };
    saveWorld(data);
  }

  loadAndRebuild() {
    const raw = loadWorld();
    if (!raw) return false;
    // restaurar meta
    if (raw.meta) {
      this.time = raw.meta.time || Date.now();
      this.tickCounter = raw.meta.tickCounter || 0;
      this.mode = raw.meta.mode || 'active';
    }
    this.history = raw.history || [];

    // reconstruir entidades
    this.entities = [];
    for (const entJson of (raw.entities || [])) {
      if (entJson.__type === 'Player') {
        this.entities.push(Player.fromJSON(entJson));
      } else if (entJson.__type === 'NPC') {
        this.entities.push(NPCManager.fromJSON(entJson));
      } else {
        // genérico: reconstruir como Entity simples pode ser implementado
      }
    }
    return true;
  }

  // Aplica ticks "offline" (quando o jogo ficou fechado)
  applyOfflineTicks() {
    // se não houver time salvo, nada a fazer
    const lastTime = this.time || Date.now();
    const now = Date.now();
    const diffMs = Math.max(0, now - lastTime);
    const ticksPassed = Math.floor(diffMs / 1000); // 1 tick = 1s por padrão
    if (ticksPassed <= 0) return 0;
    this.log(`Aplicando ${ticksPassed} ticks offline (passaram ${Math.floor(diffMs/1000)}s).`);
    for (let i = 0; i < ticksPassed; i++) {
      // para não sobrecarregar, pode aplicar uma versão reduzida do tick
      for (const ent of this.entities) {
        if (ent.isAlive()) {
          ent.heal(Math.max(1, Math.floor(ent.maxHp * 0.005))); // regen mais suave offline
        }
      }
      this.tickCounter++;
    }
    this.time = now;
    this.save();
    return ticksPassed;
  }
}

module.exports = World;
