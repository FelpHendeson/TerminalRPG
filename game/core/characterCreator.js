// game/core/characterCreator.js
const chalk = require('chalk');
const inquirer = require('inquirer');
const Player = require('../entities/player');
const InterfaceUtils = require('../../utils/interfaceUtils');

class CharacterCreator {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  async start() {
    InterfaceUtils.drawBox(['CRIAÇÃO DE PERSONAGEM'], 60);
    console.log();

    console.log(chalk.yellow('Bem-vindo ao Terminal RPG!'));
    console.log(chalk.gray('Você acaba de aparecer neste mundo sem memória de quem é...'));
    console.log(chalk.gray('Vamos descobrir juntos quem você realmente é!'));
    console.log();

    try {
      // Pergunta 1: Nome
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Qual é o seu nome?',
          validate: (input) => {
            if (input.trim().length < 2) {
              return 'O nome deve ter pelo menos 2 caracteres';
            }
            return true;
          }
        }
      ]);
      
      console.log();
      console.log(chalk.yellow('Agora vamos descobrir sua personalidade através de algumas perguntas...'));
      console.log();

      // Pergunta 2: Personalidade
      const { personality } = await inquirer.prompt([
        {
          type: 'list',
          name: 'personality',
          message: 'Você se considera uma pessoa...',
          choices: [
            { name: '🤗 Bondosa e compassiva', value: 'kind' },
            { name: '⚖️  Neutra e equilibrada', value: 'neutral' },
            { name: '🔥 Impulsiva e apaixonada', value: 'passionate' },
            { name: '🧠 Fria e calculista', value: 'calculating' }
          ]
        }
      ]);

      // Pergunta 3: Reação ao perigo
      const { dangerReaction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'dangerReaction',
          message: 'Em uma situação de perigo, você...',
          choices: [
            { name: '🛡️  Protege os outros primeiro', value: 'protect' },
            { name: '🧐 Avalia a situação com calma', value: 'analyze' },
            { name: '⚡ Age instintivamente', value: 'instinct' },
            { name: '📋 Recua para planejar', value: 'plan' }
          ]
        }
      ]);

      // Pergunta 4: Motivação
      const { motivation } = await inquirer.prompt([
        {
          type: 'list',
          name: 'motivation',
          message: 'Qual é sua maior motivação?',
          choices: [
            { name: '🦸 Ajudar e proteger os outros', value: 'hero' },
            { name: '🔍 Descobrir a verdade sobre si mesmo', value: 'truth' },
            { name: '⚔️  Provar sua força e coragem', value: 'strength' },
            { name: '📚 Adquirir conhecimento e poder', value: 'knowledge' }
          ]
        }
      ]);

      // Determinar traços baseados nas respostas
      const traits = this.determineTraits(personality, dangerReaction, motivation);
      
      console.log();
      console.log(chalk.green('✓ Personagem criado com sucesso!'));
      console.log();

      // Mostrar resumo dos traços
      console.log(chalk.cyan('Seus traços de personalidade:'));
      traits.forEach(trait => {
        console.log(chalk.gray(`  • ${trait.name}: ${trait.description}`));
      });
      console.log();

      // Criar o personagem
      const player = this.createPlayer(name, traits);
      
      // Salvar o personagem usando a instância do GameManager
      console.log('gameManager => ', this.gameManager);
      console.log('player => ', player);
      this.gameManager.setPlayer(player);
      console.log('gameManager => ', this.gameManager.getPlayer());
      const saveResult = this.gameManager.saveGame();
      
      if (saveResult) {
        console.log(chalk.green('✓ Personagem salvo com sucesso!'));
      } else {
        console.log(chalk.red('✗ Erro ao salvar personagem!'));
      }

      console.log(chalk.cyan('Pressione ENTER para começar sua aventura...'));
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: ''
        }
      ]);

    } catch (error) {
      console.log(chalk.red('Erro durante a criação do personagem:'));
      console.log(chalk.red(error.message));
      console.log(chalk.gray(error.stack));
    }
  }

  determineTraits(personality, dangerReaction, motivation) {
    const traits = [];

    // Traços baseados na personalidade
    const personalityTraits = {
      kind: { name: "Coração de Ouro", description: "Você é naturalmente bondoso e ajuda os outros", effects: { karma: 10, magicAffinity: "light" }},
      neutral: { name: "Equilíbrio Interior", description: "Você busca o equilíbrio em todas as situações", effects: { karma: 0, magicAffinity: "neutral" }},
      passionate: { name: "Explosão de Paixão", description: "Suas emoções são intensas e imprevisíveis", effects: { karma: -5, magicAffinity: "fire" }},
      calculating: { name: "Mente Calculista", description: "Você pensa antes de agir, sempre", effects: { karma: -10, magicAffinity: "dark" }}
    };

    // Traços baseados na reação ao perigo
    const reactionTraits = {
      protect: { name: "Protetor", description: "Você sempre coloca os outros em primeiro lugar", effects: { def: 5, relationship: 10 }},
      analyze: { name: "Estrategista", description: "Você analisa antes de agir", effects: { spd: 3, atk: 2 }},
      instinct: { name: "Instinto Selvagem", description: "Seus instintos são afiados", effects: { spd: 5, atk: 3 }},
      plan: { name: "Planejador", description: "Você sempre tem um plano", effects: { def: 3, maxHp: 20 }}
    };

    // Traços baseados na motivação
    const motivationTraits = {
      hero: { name: "Herói Nato", description: "Você nasceu para ser um herói", effects: { karma: 15, questRewards: 1.2 }},
      truth: { name: "Buscador da Verdade", description: "Você precisa descobrir quem realmente é", effects: { xpGain: 1.1, magicAffinity: "mystic" }},
      strength: { name: "Guerreiro Destemido", description: "Você busca desafios e glória", effects: { atk: 5, combatXP: 1.3 }},
      knowledge: { name: "Sábio em Busca", description: "O conhecimento é seu objetivo", effects: { magicPower: 1.2, skillLearning: 1.1 }}
    };

    traits.push(personalityTraits[personality]);
    traits.push(reactionTraits[dangerReaction]);
    traits.push(motivationTraits[motivation]);

    return traits;
  }

  createPlayer(name, traits) {
    // Calcular stats baseados nos traços
    let baseStats = {
      name: name,
      level: 1,
      maxHp: 100,
      atk: 10,
      def: 5,
      spd: 5,
      gold: 50,
      xp: 0,
      xpToLevelUp: 100,
      inventory: [],
      traits: traits
    };

    // Aplicar efeitos dos traços
    traits.forEach(trait => {
      if (trait.effects) {
        if (trait.effects.maxHp) baseStats.maxHp += trait.effects.maxHp;
        if (trait.effects.atk) baseStats.atk += trait.effects.atk;
        if (trait.effects.def) baseStats.def += trait.effects.def;
        if (trait.effects.spd) baseStats.spd += trait.effects.spd;
        if (trait.effects.gold) baseStats.gold += trait.effects.gold;
      }
    });

    const player = new Player(baseStats);
    player.hp = player.maxHp; // Garantir que HP está cheio

    return player;
  }
}

module.exports = CharacterCreator;