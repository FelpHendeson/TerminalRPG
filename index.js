// index.js - VERSÃO LINEAR COM INQUIRER
const chalk = require('chalk');
const inquirer = require('inquirer');
const GameManager = require('./game/core/gameManager');
const CharacterCreator = require('./game/core/characterCreator');
const InterfaceUtils = require('./utils/interfaceUtils');

class TerminalRPG {
  constructor() {
    this.gameManager = new GameManager();
    this.characterCreator = new CharacterCreator(this.gameManager); // Passar a instância
    this.isRunning = true;
  }

  async start() {
    console.clear();
    InterfaceUtils.drawGameTitle();
    console.log();

    // Verificar se já existe um personagem salvo
    const hasCharacter = this.gameManager.hasCharacter();

    if (hasCharacter) {
      console.log(chalk.green('✓ Personagem encontrado! Carregando...'));
      const loadResult = this.gameManager.loadGame();
      if (loadResult) {
        await this.showMainMenu();
      } else {
        console.log(chalk.red('Erro ao carregar personagem. Criando novo...'));
        await this.characterCreator.start();
        await this.showMainMenu();
      }
    } else {
      console.log(chalk.yellow('Nenhum personagem encontrado. Vamos criar um novo!'));
      await this.characterCreator.start();
      await this.showMainMenu();
    }
  }

  async showMainMenu() {
    while (this.isRunning) {
      console.clear();
      InterfaceUtils.drawBox(['MENU PRINCIPAL'], 60);
      console.log();

      // Mostrar status do personagem
      const player = this.gameManager.getPlayer();
      if (player) {
        console.log(chalk.yellow(`�� ${player.name} - Nível ${player.level}`));
        console.log(chalk.gray(`   HP: ${player.hp}/${player.maxHp} | XP: ${player.xp}/${player.xpToLevelUp}`));
        console.log(chalk.gray(`   Localização: ${this.gameManager.getCurrentLocation()}`));
        console.log();
      } else {
        console.log(chalk.red('⚠️  Nenhum personagem carregado!'));
        console.log();
      }

      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Escolha uma opção:',
          choices: [
            { name: '�� Continuar História', value: 'story' },
            { name: '🗺️  Mapa e Viagem', value: 'map' },
            { name: '👤 Perfil do Personagem', value: 'profile' },
            { name: '⚙️  Configurações', value: 'settings' },
            { name: '🐛 Debug', value: 'debug' },
            { name: '💾 Salvar e Sair', value: 'exit' }
          ]
        }
      ]);

      switch (choice) {
        case 'story':
          await this.gameManager.continueStory();
          break;
        case 'map':
          await this.showMapMenu();
          break;
        case 'profile':
          await this.showProfileMenu();
          break;
        case 'settings':
          await this.showSettingsMenu();
          break;
        case 'debug':
          await this.showDebugMenu();
          break;
        case 'exit':
          this.gameManager.saveGame();
          console.log(chalk.green('Jogo salvo! Até logo!'));
          this.isRunning = false;
          break;
      }
    }
  }

  async showDebugMenu() {
    console.clear();
    InterfaceUtils.drawBox(['DEBUG'], 60);
    console.log();

    const player = this.gameManager.getPlayer();
    console.log(chalk.yellow('Status do Jogo:'));
    console.log(chalk.gray(`  • Player: ${player ? player.name : 'Nenhum'}`));
    console.log(chalk.gray(`  • Localização: ${this.gameManager.getCurrentLocation()}`));
    console.log(chalk.gray(`  • Modo: ${this.gameManager.getSettings().gameMode}`));
    console.log(chalk.gray(`  • Save existe: ${this.gameManager.hasCharacter()}`));

    if (player) {
      console.log(chalk.gray(`  • HP: ${player.hp}/${player.maxHp}`));
      console.log(chalk.gray(`  • Nível: ${player.level}`));
      console.log(chalk.gray(`  • Traços: ${player.traits ? player.traits.length : 0}`));
    }

    console.log();
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Pressione ENTER para voltar...'
      }
    ]);
  }

  async showMapMenu() {
    console.clear();
    InterfaceUtils.drawBox(['MAPA'], 60);
    console.log();

    const locations = this.gameManager.getAvailableLocations();
    const currentLocation = this.gameManager.getCurrentLocation();

    console.log(chalk.yellow('Locais disponíveis:'));
    locations.forEach((location, index) => {
      const marker = location.name === currentLocation ? chalk.green('📍') : chalk.gray('○');
      console.log(`${marker} ${location.name} - ${location.description}`);
    });
    console.log();

    const choices = [
      ...locations.map(location => ({
        name: `${location.name === currentLocation ? '' : '○'} ${location.name} - ${location.description}`,
        value: location.name
      })),
      { name: '⬅️  Voltar ao menu principal', value: 'back' }
    ];

    const { selectedLocation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLocation',
        message: 'Para onde deseja ir?',
        choices: choices
      }
    ]);

    if (selectedLocation !== 'back') {
      await this.gameManager.travelTo(selectedLocation);
    }
  }

  async showProfileMenu() {
    console.clear();
    InterfaceUtils.drawBox(['PERFIL DO PERSONAGEM'], 60);
    console.log();

    const player = this.gameManager.getPlayer();
    if (!player) return;

    console.log(chalk.yellow.bold(`👤 ${player.name}`));
    console.log(chalk.gray(`Nível: ${player.level} | XP: ${player.xp}/${player.xpToLevelUp}`));
    console.log(chalk.gray(`HP: ${player.hp}/${player.maxHp}`));
    console.log(chalk.gray(`Ataque: ${player.atk} | Defesa: ${player.def} | Velocidade: ${player.spd}`));
    console.log(chalk.gray(`Ouro: ${player.gold}`));
    console.log();

    if (player.traits && player.traits.length > 0) {
      console.log(chalk.cyan('Traços de Personalidade:'));
      player.traits.forEach(trait => {
        console.log(chalk.gray(`  • ${trait.name}: ${trait.description}`));
      });
      console.log();
    }

    if (player.inventory && player.inventory.length > 0) {
      console.log(chalk.cyan('Inventário:'));
      player.inventory.forEach(item => {
        console.log(chalk.gray(`  • ${item.name}`));
      });
    } else {
      console.log(chalk.gray('Inventário vazio'));
    }

    console.log();
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Pressione ENTER para voltar...'
      }
    ]);
  }

  async showSettingsMenu() {
    console.clear();
    InterfaceUtils.drawBox(['CONFIGURAÇÕES'], 60);
    console.log();

    const settings = this.gameManager.getSettings();

    console.log(chalk.yellow('Configurações atuais:'));
    console.log(chalk.gray(`Modo de Jogo: ${settings.gameMode === 'active' ? 'Ativo' : 'Idle'}`));
    console.log(chalk.gray(`Velocidade do Texto: ${settings.textSpeed === 'fast' ? 'Rápida' : 'Normal'}`));
    console.log();

    const { settingChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'settingChoice',
        message: 'O que deseja alterar?',
        choices: [
          { name: ' Alternar Modo de Jogo', value: 'gameMode' },
          { name: '⚡ Alterar Velocidade do Texto', value: 'textSpeed' },
          { name: '⬅️  Voltar', value: 'back' }
        ]
      }
    ]);

    if (settingChoice === 'gameMode') {
      this.gameManager.toggleGameMode();
      console.log(chalk.green('Modo alterado!'));
      await this.wait(1000);
    } else if (settingChoice === 'textSpeed') {
      this.gameManager.toggleTextSpeed();
      console.log(chalk.green('Velocidade alterada!'));
      await this.wait(1000);
    }
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);