const chalk = require('chalk');
const inquirer = require('inquirer');
const DataManager = require('./dataManager');

class GameManager {
    constructor() {
        this.player = null;
        this.dataManager = new DataManager();
        this.settings = {
        gameMode: 'active', // 'active' | 'idle'
        textSpeed: 'normal' // 'normal' | 'fast'
        };
        this.currentLocation = 'Vila Inicial';
        this.gameState = 'menu'; // 'menu' | 'story' | 'combat' | 'exploration'
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    getAvailableLocations() {
        return this.locationManager.getAvailableLocations(this.currentLocation, this.dataManager);
    }

    getDataManager() {
        return this.dataManager;
    }
}

module.exports = GameManager;