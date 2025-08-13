// game/core/gameManager.js
const chalk = require('chalk');
const inquirer = require('inquirer');
const Player = require('../entities/player');
const StoryManager = require('./storyManager');
const LocationManager = require('./locationManager');
const DataManager = require('./dataManager');
const { saveGame, loadGame, hasSave } = require('./saveManager');

class GameManager {
  constructor() {
    this.player = null;
    this.storyManager = new StoryManager();
    this.locationManager = new LocationManager();
    this.dataManager = new DataManager();
    this.settings = {
      gameMode: 'active', // 'active' | 'idle'
      textSpeed: 'normal' // 'normal' | 'fast'
    };
    this.currentLocation = 'Vila Inicial';
    this.gameState = 'menu'; // 'menu' | 'story' | 'combat' | 'exploration'
  }

  hasCharacter() {
    return hasSave();
  }

  loadGame() {
    try {
      const savedData = loadGame();
      if (savedData) {
        this.player = Player.fromJSON(savedData.player);
        this.settings = savedData.settings || this.settings;
        this.currentLocation = savedData.currentLocation || 'Vila Inicial';
        this.storyManager.loadProgress(savedData.storyProgress);
        this.locationManager.loadProgress(savedData.locationProgress);
        console.log(chalk.green('✓ Jogo carregado com sucesso!'));
        return true;
      }
    } catch (error) {
      console.log(chalk.red('Erro ao carregar jogo:', error.message));
    }
    return false;
  }

  saveGame() {
    try {
      const saveData = {
        player: this.player ? this.player.toJSON() : null,
        settings: this.settings,
        currentLocation: this.currentLocation,
        storyProgress: this.storyManager.getProgress(),
        locationProgress: this.locationManager.getProgress(),
        timestamp: Date.now()
      };
      
      if (saveGame(saveData)) {
        console.log(chalk.green('✓ Jogo salvo com sucesso!'));
        return true;
      } else {
        console.log(chalk.red('✗ Erro ao salvar jogo'));
        return false;
      }
    } catch (error) {
      console.log(chalk.red('Erro ao salvar jogo:', error.message));
      return false;
    }
  }

  getPlayer() {
    return this.player;
  }

  setPlayer(player) {
    this.player = player;
  }

  getCurrentLocation() {
    return this.currentLocation;
  }

  getAvailableLocations() {
    return this.locationManager.getAvailableLocations(this.currentLocation, this.dataManager);
  }

  getSettings() {
    return this.settings;
  }

  toggleGameMode() {
    this.settings.gameMode = this.settings.gameMode === 'active' ? 'idle' : 'active';
  }

  toggleTextSpeed() {
    this.settings.textSpeed = this.settings.textSpeed === 'normal' ? 'fast' : 'normal';
  }

  async continueStory() {
    if (!this.player) {
      console.log(chalk.red('Nenhum personagem carregado!'));
      return;
    }

    this.gameState = 'story';
    await this.storyManager.continueStory(this.player, this.currentLocation, this.dataManager);
    this.gameState = 'menu';
  }

  async travelTo(locationName) {
    if (!this.player) {
      console.log(chalk.red('Nenhum personagem carregado!'));
      return;
    }

    console.log(chalk.cyan(`Viajando para ${locationName}...`));
    await this.wait(1000);
    
    this.currentLocation = locationName;
    console.log(chalk.green(`Chegou em ${locationName}!`));
    
    const locationInfo = this.dataManager.getLocation(locationName);
    if (locationInfo) {
      console.log(chalk.gray(locationInfo.description));
      
      // Mostrar NPCs disponíveis
      const npcs = this.dataManager.getNPCsByLocation(locationName);
      if (npcs.length > 0) {
        console.log(chalk.yellow('\nNPCs encontrados:'));
        npcs.forEach(npc => {
          console.log(chalk.gray(`  • ${npc.name} (${npc.role})`));
        });
      }
      
      // Mostrar quests disponíveis
      const quests = this.dataManager.getQuestsByLocation(locationName);
      if (quests.length > 0) {
        console.log(chalk.cyan('\nQuests disponíveis:'));
        quests.forEach(quest => {
          console.log(chalk.gray(`  • ${quest.title}: ${quest.description}`));
        });
      }
    }
    
    await this.wait(2000);
  }

  getDataManager() {
    return this.dataManager;
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = GameManager;
