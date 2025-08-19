// managers/combatManager.js
const InterfaceUtils = require('../utils/interfaceUtils');

/** Simples sistema de combate por turnos. */
class CombatManager {
  async fight(player, monster) {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox(`Um ${monster.name} aparece!`, 60);
    console.log();
    await InterfaceUtils.waitForInput('Pressione Enter para lutar...');

    while (player.hp > 0 && monster.hp > 0) {
      monster.hp -= Math.max(1, player.atk - monster.def);
      if (monster.hp <= 0) break;
      player.hp -= Math.max(1, monster.atk - player.def);
    }

    if (player.hp <= 0) {
      InterfaceUtils.showError('Você foi derrotado...');
      await InterfaceUtils.waitForInput();
      return false;
    }

    player.gold += monster.gold || 0;
    player.gainXP(monster.xp || 0);
    InterfaceUtils.showSuccess(`Você derrotou ${monster.name}!`);
    await InterfaceUtils.waitForInput();
    return true;
  }
}

module.exports = CombatManager;
