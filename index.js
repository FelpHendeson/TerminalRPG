// index.js
const chalk = require("chalk");
const Player = require("./game/entities/player");
const Monster = require("./game/entities/monster");

// Criar Player
const player = new Player({
  name: "Herói",
  level: 1,
  maxHp: 100,
  atk: 12,
  def: 6,
  spd: 5,
  gold: 0
});

// Criar Monstro
const goblin = new Monster({
  name: "Goblin",
  level: 1,
  maxHp: 50,
  atk: 8,
  def: 3,
  spd: 4,
  goldDrop: 15,
  xpDrop: 25,
  type: "Humanoid"
});

console.log(chalk.green(`\n${player.name} entra na batalha contra um ${goblin.type}: ${goblin.name}!\n`));

// Função de combate simples
function battle(p, m) {
  let turn = 1;
  while (p.isAlive() && m.isAlive()) {
    console.log(chalk.blue(`--- Turno ${turn} ---`));

    // Player ataca primeiro se for mais rápido
    if (p.spd >= m.spd) {
      const dmg = m.receiveDamage(p.atk);
      console.log(chalk.green(`${p.name} causa ${dmg} de dano ao ${m.name}. HP inimigo: ${m.hp}/${m.maxHp}`));
      if (!m.isAlive()) break;

      const dmg2 = p.receiveDamage(m.atk);
      console.log(chalk.red(`${m.name} causa ${dmg2} de dano ao ${p.name}. HP: ${p.hp}/${p.maxHp}`));
    } else {
      const dmg = p.receiveDamage(m.atk);
      console.log(chalk.red(`${m.name} causa ${dmg} de dano ao ${p.name}. HP: ${p.hp}/${p.maxHp}`));
      if (!p.isAlive()) break;

      const dmg2 = m.receiveDamage(p.atk);
      console.log(chalk.green(`${p.name} causa ${dmg2} de dano ao ${m.name}. HP inimigo: ${m.hp}/${m.maxHp}`));
    }

    turn++;
  }

  if (p.isAlive()) {
    console.log(chalk.yellow(`\n${p.name} venceu a batalha!`));
    const rewards = m.getRewards();
    p.gold += rewards.gold;
    p.gainXP(rewards.xp);
    console.log(chalk.yellow(`Ganhou ${rewards.gold} ouro e ${rewards.xp} XP!`));
  } else {
    console.log(chalk.red(`\n${p.name} foi derrotado...`));
  }
}

battle(player, goblin);
