// game/core/gameManager.js
const chalk = require('chalk');
const inquirer = require('inquirer');
const Player = require('../entities/player');
const StoryManager = require('./storyManager');
const LocationManager = require('./locationManager');
const { saveGame, loadGame } = require('./saveManager');

class GameManager {
  constructor() {
    this.player = null;
    this.storyManager = new StoryManager();
    this.locationManager = new LocationManager();
    this.settings = {
      gameMode: 'active', // 'active' | 'idle'
      textSpeed: 'normal' // 'normal' | 'fast'
    };
    this.currentLocation = 'Vila Inicial';
    this.gameState = 'menu'; // 'menu' | 'story' | 'combat' | 'exploration'
  }

  hasCharacter() {
    try {
      const savedData = loadGame();
      return savedData && savedData.player;
    } catch (error) {
      return false;
    }
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
      saveGame(saveData);
      return true;
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
    return this.locationManager.getAvailableLocations(this.currentLocation);
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
    await this.storyManager.continueStory(this.player, this.currentLocation);
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
    
    const locationInfo = this.locationManager.getLocationInfo(locationName);
    if (locationInfo) {
      console.log(chalk.gray(locationInfo.description));
    }
    
    await this.wait(2000);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = GameManager;
