const chalk = require('chalk');
const InterfaceUtils = require('../utils/interfaceUtils');

class CharacterCreator {
    constructor() { }

    async start() {
        InterfaceUtils.drawBox('CRIAÇÂO DE PERSONAGEM', 60);

        console.log(chalk.yellow('Bem-vindo ao Terminal RPG!'));
        console.log(chalk.gray('Você acaba de aparecer neste mundo sem memória de quem é...'));
        console.log(chalk.gray('Vamos descobrir juntos quem você realmente é!'));
        console.log();

        try {
            const name = await InterfaceUtils.showInput('Qual é o seu nome?', '', {
                minLength: 2,
                maxLength: 20,
                fieldName: 'nome',
                validate: (input) => {
                    // Verifica se contém apenas letras, espaços e acentos
                    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(input)) {
                        return 'O nome deve conter apenas letras e espaços.';
                    }
                    // Verifica se não tem espaços duplos
                    if (/\s{2,}/.test(input)) {
                        return 'O nome não pode conter espaços duplos.';
                    }
                    return true;
                }
            });

            console.log();
            console.log(chalk.yellow('Agora vamos descobrir sua personalidade através de algumas perguntas...'));
            console.log();

            let traitChoices = [
                { name: 'Bondosa e compassiva', value: 'kind' },
                { name: 'Neutra e equilibrada', value: 'neutral' },
                { name: 'Impulsiva e apaixonada', value: 'passionate' },
                { name: 'Fria e calculista', value: 'calculating' }
            ];
            const firstTrait = InterfaceUtils.showChoices('Você se considera uma pessoa...', traitChoices);

            traitChoices = [
                { name: 'Protege os outros primeiro', value: 'protect' },
                { name: 'Avalia a situação com calma', value: 'analyze' },
                { name: 'Age instintivamente', value: 'instinct' },
                { name: 'Recua para planejar', value: 'plan' }
            ];
            const secondTrait = InterfaceUtils.showChoices('Em uma situação de perigo, você...', traitChoices);

            traitChoices = [
                { name: 'Ajudar e proteger os outros', value: 'hero' },
                { name: 'Descobrir a verdade sobre si mesmo', value: 'truth' },
                { name: 'Provar sua força e coragem', value: 'strength' },
                { name: 'Adquirir conhecimento e poder', value: 'knowledge' }
            ];
            const thirdTrait = InterfaceUtils.showChoices('Qual é sua maior motivação?', traitChoices);

            // Determinar traços baseados nas respostas
            const traits = this.determineTraits(firstTrait, secondTrait, thirdTrait);

            // Mostrar resumo dos traços
            console.log(chalk.cyan('Seus traços de personalidade:'));
            traits.forEach(trait => {
                console.log(chalk.gray(`${trait.name}: ${trait.description}`));
            });
            console.log();


        } catch (err) {

        }
    }

    determineTraits(personality, dangerReaction, motivation) {
        const traits = [];

        // Traços baseados na personalidade
        const personalityTraits = {
            kind: { name: "Coração de Ouro", description: "Você é naturalmente bondoso e ajuda os outros", effects: { karma: 10, magicAffinity: "light" } },
            neutral: { name: "Equilíbrio Interior", description: "Você busca o equilíbrio em todas as situações", effects: { karma: 0, magicAffinity: "neutral" } },
            passionate: { name: "Explosão de Paixão", description: "Suas emoções são intensas e imprevisíveis", effects: { karma: -5, magicAffinity: "fire" } },
            calculating: { name: "Mente Calculista", description: "Você pensa antes de agir, sempre", effects: { karma: -10, magicAffinity: "dark" } }
        };

        // Traços baseados na reação ao perigo
        const reactionTraits = {
            protect: { name: "Protetor", description: "Você sempre coloca os outros em primeiro lugar", effects: { def: 5, relationship: 10 } },
            analyze: { name: "Estrategista", description: "Você analisa antes de agir", effects: { spd: 3, atk: 2 } },
            instinct: { name: "Instinto Selvagem", description: "Seus instintos são afiados", effects: { spd: 5, atk: 3 } },
            plan: { name: "Planejador", description: "Você sempre tem um plano", effects: { def: 3, maxHp: 20 } }
        };

        // Traços baseados na motivação
        const motivationTraits = {
            hero: { name: "Herói Nato", description: "Você nasceu para ser um herói", effects: { karma: 15, questRewards: 1.2 } },
            truth: { name: "Buscador da Verdade", description: "Você precisa descobrir quem realmente é", effects: { xpGain: 1.1, magicAffinity: "mystic" } },
            strength: { name: "Guerreiro Destemido", description: "Você busca desafios e glória", effects: { atk: 5, combatXP: 1.3 } },
            knowledge: { name: "Sábio em Busca", description: "O conhecimento é seu objetivo", effects: { magicPower: 1.2, skillLearning: 1.1 } }
        };

        traits.push(personalityTraits[personality]);
        traits.push(reactionTraits[dangerReaction]);
        traits.push(motivationTraits[motivation]);

        return traits;
    }
}

module.exports = CharacterCreator;