// index.js - VERSÃO LINEAR COM INQUIRER
const chalk = require('chalk');
const inquirer = require('inquirer');
const GameManager = require('./game/core/gameManager');
const CharacterCreator = require('./game/core/characterCreator');

class TerminalRPG {
  constructor() {
    this.gameManager = new GameManager();
    this.characterCreator = new CharacterCreator(this.gameManager); // Passar a instância
    this.isRunning = true;
  }

  async start() {
    console.clear();
    console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                    TERMINAL RPG v2.0                        ║'));
    console.log(chalk.cyan.bold('║                  Uma Aventura Linear                        ║'));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════╝'));
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
      console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════════════╗'));
      console.log(chalk.cyan.bold('║                          MENU PRINCIPAL                      ║'));
      console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════╝'));
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
    console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                           DEBUG                              ║'));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════╝'));
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

  // ... resto dos métodos existentes ...
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);