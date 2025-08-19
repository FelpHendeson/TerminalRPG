const fs = require('fs');
const path = require('path');
const InterfaceUtils = require('../utils/interfaceUtils');

/**
 * @typedef {Object} StoryEvent
 * @property {string} id
 * @property {string} text
 * @property {Array<{text:string,next:string}>} [choices]
 * @property {string} [next]
 * @property {{ quests?: Object<string,string>, relations?: Object<string,number> }} [conditions]
 */

/**
 * Gerencia eventos de história baseados em um arquivo JSON.
 */
class StoryManager {
  /**
   * @param {{dataFile?: string}=} opts
   */
  constructor({ dataFile } = {}) {
    this.dataFile = dataFile || path.resolve(__dirname, '../data/story.json');
    this.events = [];
    this.load();
  }

  /** Carrega o arquivo de história. */
  load() {
    if (!fs.existsSync(this.dataFile)) return;
    const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
    this.events = Array.isArray(raw?.events) ? raw.events : [];
  }

  /**
   * Obtém um evento pelo ID.
   * @param {string} id
   * @returns {StoryEvent|null}
   */
  getEvent(id) {
    return this.events.find(e => e.id === id) || null;
  }

  /**
   * Retorna o evento atual do jogo.
   * @param {import('./gameManager')} game
   * @returns {StoryEvent|null}
   */
  getCurrentEvent(game) {
    const id = game.flags.storyId || 'start';
    return this.getEvent(id);
  }

  /** Avança a história com base na escolha feita. */
  advance(game, choiceIndex = 0) {
    const evt = this.getCurrentEvent(game);
    if (!evt) return;
    let next = evt.next;
    if (evt.choices?.length) {
      const choice = evt.choices[choiceIndex];
      next = choice?.next;
    }
    game.flags.storyId = next || '__end__';
  }

  /**
   * Executa a história interativamente até não haver mais eventos.
   * @param {import('./gameManager')} game
   */
  async play(game) {
    while (true) {
      const evt = this.getCurrentEvent(game);
      if (!evt || evt.id === '__end__') break;
      InterfaceUtils.clearScreen();
      const text = evt.text.replace('{name}', game.player?.name || 'Herói');
      InterfaceUtils.drawBox(text.split('\n'), 60);
      console.log();
      if (evt.choices?.length) {
        const opts = evt.choices.map((c, i) => ({ name: c.text, value: i, symbol: '>' }));
        const choice = await InterfaceUtils.showChoices('Escolha:', opts, false);
        this.advance(game, Number(choice));
      } else {
        await InterfaceUtils.waitForInput();
        this.advance(game);
      }
    }
  }
}

module.exports = StoryManager;
