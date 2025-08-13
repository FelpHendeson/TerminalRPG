// game/core/storyManager.js
const chalk = require('chalk');
const inquirer = require('inquirer');

class StoryManager {
  constructor() {
    this.currentChapter = 0;
    this.currentScene = 0;
    this.completedQuests = [];
    this.activeQuests = [];
    
    this.story = [
      {
        id: 'chapter_1',
        title: 'O Despertar',
        scenes: [
          {
            id: 'awakening',
            text: 'Você acorda em uma clareira desconhecida. O sol brilha através das árvores, e você não tem memória de como chegou aqui. Ao seu redor, apenas a natureza e uma pequena trilha que leva a uma vila distante.',
            choices: [
              { text: 'Seguir para a vila', nextScene: 'village_approach' },
              { text: 'Explorar a clareira primeiro', nextScene: 'clearing_exploration' }
            ]
          },
          {
            id: 'village_approach',
            text: 'Você segue a trilha e chega à Vila Inicial. É um lugar pequeno e acolhedor, com algumas casas de madeira e uma praça central. Os moradores olham para você com curiosidade.',
            choices: [
              { text: 'Perguntar sobre onde você está', nextScene: 'village_info' },
              { text: 'Procurar por alguém que possa ajudar', nextScene: 'village_help' }
            ]
          },
          {
            id: 'clearing_exploration',
            text: 'Você decide explorar a clareira primeiro. Entre as árvores, você encontra uma pequena caverna e alguns cogumelos brilhantes. Há também pegadas frescas na terra úmida.',
            choices: [
              { text: 'Investigar a caverna', nextScene: 'cave_investigation' },
              { text: 'Coletar os cogumelos', nextScene: 'mushroom_collection' },
              { text: 'Seguir as pegadas', nextScene: 'footprints_follow' }
            ]
          },
          {
            id: 'village_info',
            text: 'Você se aproxima de um morador local. "Bem-vindo à Vila Inicial!", ele diz com um sorriso. "Somos uma comunidade pacífica. Você parece perdido... posso ajudar?"',
            choices: [
              { text: 'Explicar sua situação', nextScene: 'explain_situation' },
              { text: 'Perguntar sobre trabalho', nextScene: 'ask_work' }
            ]
          },
          {
            id: 'explain_situation',
            text: 'Você explica que não se lembra de nada. O morador fica preocupado. "Isso é estranho... mas não se preocupe, você pode ficar aqui. Talvez o Sábio da Vila possa ajudar você a recuperar suas memórias."',
            choices: [
              { text: 'Procurar o Sábio da Vila', nextScene: 'find_sage' },
              { text: 'Agradecer e explorar a vila', nextScene: 'explore_village' }
            ]
          }
        ]
      }
    ];
  }

  async continueStory(player, currentLocation) {
    console.clear();
    console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                          HISTÓRIA                            ║'));
    console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════╝'));
    console.log();

    const currentChapter = this.story[this.currentChapter];
    const currentScene = currentChapter.scenes[this.currentScene];

    if (!currentScene) {
      console.log(chalk.yellow('História em desenvolvimento...'));
      console.log(chalk.gray('Mais capítulos serão adicionados em breve!'));
      await this.wait(3000);
      return;
    }

    // Mostrar texto da cena
    await this.displayText(currentScene.text);
    console.log();

    // Mostrar escolhas
    if (currentScene.choices && currentScene.choices.length > 0) {
      const choices = currentScene.choices.map((choice, index) => ({
        name: choice.text,
        value: index
      }));

      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'O que você faz?',
          choices: choices
        }
      ]);

      const selectedChoice = currentScene.choices[choice];
      
      if (selectedChoice.nextScene) {
        this.currentScene = this.findSceneIndex(selectedChoice.nextScene);
      }
    }

    // Verificar se há quests disponíveis
    await this.checkForQuests(player, currentLocation);
  }

  async displayText(text) {
    const words = text.split(' ');
    let displayText = '';
    
    for (let i = 0; i < words.length; i++) {
      displayText += words[i] + ' ';
      if (i % 8 === 0 || i === words.length - 1) {
        console.log(chalk.white(displayText.trim()));
        displayText = '';
        await this.wait(100);
      }
    }
  }

  findSceneIndex(sceneId) {
    const currentChapter = this.story[this.currentChapter];
    return currentChapter.scenes.findIndex(scene => scene.id === sceneId);
  }

  async checkForQuests(player, location) {
    // Verificar se há quests disponíveis na localização atual
    const availableQuests = this.getAvailableQuests(location, player);
    
    if (availableQuests.length > 0) {
      console.log(chalk.green('💬 Novas missões disponíveis!'));
      availableQuests.forEach(quest => {
        console.log(chalk.gray(`  • ${quest.title}: ${quest.description}`));
      });
      console.log();
    }
  }

  getAvailableQuests(location, player) {
    // Quests baseadas na localização e progresso do jogador
    const quests = [];
    
    if (location === 'Vila Inicial' && this.currentScene === 0) {
      quests.push({
        id: 'first_quest',
        title: 'Primeiros Passos',
        description: 'Conheça a vila e seus moradores',
        type: 'story',
        reward: { xp: 50, gold: 20 }
      });
    }
    
    return quests;
  }

  getProgress() {
    return {
      currentChapter: this.currentChapter,
      currentScene: this.currentScene,
      completedQuests: this.completedQuests,
      activeQuests: this.activeQuests
    };
  }

  loadProgress(progress) {
    if (progress) {
      this.currentChapter = progress.currentChapter || 0;
      this.currentScene = progress.currentScene || 0;
      this.completedQuests = progress.completedQuests || [];
      this.activeQuests = progress.activeQuests || [];
    }
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = StoryManager;