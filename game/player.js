const Entity = require("./Entity");

class Player extends Entity {
  constructor({
    name,
    level = 1,
    maxHp = 100,
    atk = 10,
    def = 5,
    spd = 5,
    gold = 0,
    skills = [],
    xp = 0,
    xpToLevelUp = 100,
    inventory = [],
  }) {
    super({ name, level, maxHp, atk, def, spd, gold, skills });
    this.xp = xp;
    this.xpToLevelUp = xpToLevelUp;
    this.inventory = inventory;
  }

  // Ganhar XP e verificar se sobe de nível
  gainXP(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToLevelUp) {
      this.levelUp();
    }
  }

  // Subir de nível
  levelUp() {
    this.level++;
    this.xp -= this.xpToLevelUp;
    this.xpToLevelUp = Math.floor(this.xpToLevelUp * 1.2); // aumenta a dificuldade
    this.maxHp += 20;
    this.atk += 5;
    this.def += 3;
    this.spd += 1;
    this.hp = this.maxHp; // cura total ao subir de nível
    console.log(`${this.name} subiu para o nível ${this.level}!`);
  }

  // Adicionar item ao inventário
  addItem(item) {
    this.inventory.push(item);
  }

  // Remover item do inventário
  removeItem(item) {
    this.inventory = this.inventory.filter(i => i !== item);
  }
}

module.exports = Player;
