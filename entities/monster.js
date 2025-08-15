// game/monster.js
const Entity = require("./entity");

/**
 * Classe que representa monstros inimigos no jogo.
 * Estende Entity com funcionalidades específicas de monstros como recompensas.
 */
class Monster extends Entity {
  /**
   * Construtor da classe Monster.
   * 
   * @param {Object} options - Opções de configuração do monstro.
   * @param {string} options.name - Nome do monstro.
   * @param {number} [options.level=1] - Nível do monstro.
   * @param {number} [options.maxHp=50] - Pontos de vida máximos.
   * @param {number} [options.atk=8] - Pontos de ataque.
   * @param {number} [options.def=3] - Pontos de defesa.
   * @param {number} [options.spd=4] - Pontos de velocidade.
   * @param {number} [options.goldDrop=10] - Ouro que o monstro dropa ao ser derrotado.
   * @param {number} [options.xpDrop=20] - Experiência que o monstro fornece ao ser derrotado.
   * @param {string} [options.type="Beast"] - Tipo do monstro (Beast, Undead, Demon, etc.).
   * @param {Array} [options.skills=[]] - Lista de habilidades do monstro.
   */
  constructor({
    name,
    level = 1,
    maxHp = 50,
    atk = 8,
    def = 3,
    spd = 4,
    goldDrop = 10,
    xpDrop = 20,
    type = "Beast",
    skills = [],
  }) {
    super({ name, level, maxHp, atk, def, spd, skills });
    this.goldDrop = goldDrop;
    this.xpDrop = xpDrop;
    this.type = type;
  }

  /**
   * Obtém as recompensas que o monstro fornece ao ser derrotado.
   * 
   * @returns {Object} Objeto contendo ouro e experiência que o monstro dropa.
   */
  getRewards() {
    return {
      gold: this.goldDrop,
      xp: this.xpDrop
    };
  }
}

module.exports = Monster;
