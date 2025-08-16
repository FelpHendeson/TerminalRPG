// managers/gameManager.js
const Player = require('../entities/player');
const SaveManager = require('../saveManager');

const STATES = { TITLE:'TITLE', EXPLORATION:'EXPLORATION', MENU:'MENU', EXIT:'EXIT' };

class GameManager {
  constructor() {
    this.version = 1;
    this.gameState = STATES.TITLE;
    this.player = null;
    this.flags = {};
    this.currentSlot = null;
    this.saves = new SaveManager({ saveDir: undefined }); // "./saves"
  }

  // ===== Persistência (slots) =====
  listSaves() { return this.saves.listSlots(); }
  hasAnySave() { return this.saves.hasAnySave(); }

  loadFromSlot(slot) {
    const raw = this.saves.load(slot);
    if (!raw || !raw.player) return false;
    this.currentSlot = slot;
    this.player = Player.fromJSON(raw.player);
    this.flags = raw.flags || {};
    this.gameState = STATES.EXPLORATION;
    return true;
  }

  save() {
    if (!this.currentSlot) return false;
    return this.saves.save(this.currentSlot, {
      version: this.version,
      player: this.player ? this.player.toJSON() : null,
      flags: this.flags,
    });
  }

  // ===== Ciclo de vida =====
  startNewGame(player, slot) {
    this.player = player;
    this.currentSlot = slot;
    this.gameState = STATES.EXPLORATION;
    this.save(); // salva imediatamente no slot
  }

  exit() {
    this.save();
    this.gameState = STATES.EXIT;
  }

  // ===== Utilidades UI =====
  getStatusLines() {
    if (!this.player) return ['Nenhum personagem carregado.'];
    const p = this.player;
    return [
      `Nome: ${p.name}  |  Nível: ${p.level}`,
      `HP: ${p.hp}/${p.maxHp}  |  ATK: ${p.atk}  DEF: ${p.def}  SPD: ${p.spd}`,
      `Ouro: ${p.gold}  |  XP: ${p.xp}/${p.xpToLevelUp}`,
      `Slot atual: ${this.currentSlot ?? '—'}`,
    ];
  }

  // (opcional) compat com CharacterCreator antigo
  setPlayer(player) { this.player = player; }
  saveGame() { return this.save(); }

  static get STATES() { return STATES; }
}

module.exports = GameManager;
