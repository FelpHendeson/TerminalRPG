const InterfaceUtils = require("./utils/interfaceUtils");
const GameManager = require("./managers/gameManager");

class TerminalRPG {
  constructor() {
    this.game = new GameManager();
    this.isRunning = true;
  }

  async start() {
    const InterfaceUtils = require("./utils/interfaceUtils");
    InterfaceUtils.drawGameTitle();

    let choice = "new";
    if (this.game.hasAnySave()) {
      choice = await InterfaceUtils.showChoices(
        "Encontramos saves. O que você quer fazer?",
        [
          { name: "Continuar", value: "continue", symbol: "[C]" },
          { name: "Novo jogo", value: "new", symbol: "[N]" },
        ],
        false
      );
    }

    if (choice === "continue") {
      const loaded = await this.selectAndLoadSlot();
      if (!loaded) {
        InterfaceUtils.showError(
          "Não foi possível carregar o slot escolhido. Iniciando novo jogo."
        );
        await InterfaceUtils.waitForInput();
        await this.createNewCharacterFlow(); // cai no novo jogo
      }
    } else {
      await this.createNewCharacterFlow();
    }

    await this.showMainMenu();
  }

  /**
   * Exibe o menu principal do jogo com todas as opções disponíveis.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário sai do jogo.
   */
  async showMainMenu() {
    while (this.isRunning) {
      const choices = [
        { name: "Mapa", value: "map", symbol: "[M]" },
        { name: "Menu de Missões", value: "quests", symbol: "[Q]" },
        { name: "Perfil do Jogador", value: "profile", symbol: "[P]" },
        { name: "Configurações", value: "configs", symbol: "[C]" },
        { name: "Salvar Progresso", value: "save", symbol: "[S]" },
        { name: "Sair e Salvar", value: "exit", symbol: "[X]" },
      ];

      InterfaceUtils.clearScreen();
      InterfaceUtils.drawBox("MENU PRINCIPAL", 60);
      console.log();

      const selectedChoice = await InterfaceUtils.showChoices(
        "Faça uma escolha:",
        choices,
        false
      );

      switch (selectedChoice) {
        case "map":
          await this.showMap();
          break;
        case "quests":
          await this.showQuests();
          break;
        case "profile":
          await this.showProfile();
          break;
        case "configs":
          await this.showConfigs();
          break;
        case "save":
          await this.saveProgress();
          break;
        case "exit":
          await this.exitAndSave();
          break;
        default:
          InterfaceUtils.showError("Opção inválida!");
          await InterfaceUtils.waitForInput();
          break;
      }
    }
  }

  /**
   * Exibe a tela do mapa do mundo.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
   */
  async showMap() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("[M] MAPA DO MUNDO", 60);
    console.log();
    InterfaceUtils.showInfo(
      "Funcionalidade do mapa será implementada em breve!"
    );
    await InterfaceUtils.waitForInput();
  }

  /**
   * Exibe o menu de missões.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
   */
  async showQuests() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("[Q] MENU DE MISSÕES", 60);
    console.log();
    InterfaceUtils.showInfo("Sistema de missões será implementado em breve!");
    await InterfaceUtils.waitForInput();
  }

  /**
   * Exibe o perfil do jogador.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
   */
  async showProfile() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("[P] PERFIL DO JOGADOR", 60);
    console.log();
    const lines = this.game.getStatusLines();
    InterfaceUtils.drawBox(lines, 60);
    await InterfaceUtils.waitForInput();
  }

  /**
   * Exibe as configurações do jogo.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
   */
  async showConfigs() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("[C] CONFIGURAÇÕES", 60);
    console.log();
    InterfaceUtils.showInfo("Configurações serão implementadas em breve!");
    await InterfaceUtils.waitForInput();
  }

  async selectAndLoadSlot() {
    const InterfaceUtils = require("./utils/interfaceUtils");
    const slots = this.game.listSaves().filter((s) => s.exists);
    if (!slots.length) return false;

    const opts = slots.map((s) => ({
      name: `Slot ${s.slot} — ${s.name} (Nv ${s.level})`,
      value: s.slot,
      symbol: `[${s.slot}]`,
    }));

    const chosen = await InterfaceUtils.showChoices(
      "Escolha um save para continuar:",
      opts,
      false
    );
    return this.game.loadFromSlot(chosen);
  }

  async createNewCharacterFlow() {
    const InterfaceUtils = require("./utils/interfaceUtils");
    const CharacterCreator = require("./core/characterCreator");
    const Player = require("./entities/player");

    // escolher slot (livre, ou qual substituir)
    const all = this.game.listSaves();
    const free = all.filter((s) => !s.exists);
    let slot = null;

    if (free.length) {
      const opts = free.map((s) => ({
        name: `Slot ${s.slot} (vazio)`,
        value: s.slot,
        symbol: `[${s.slot}]`,
      }));
      slot = await InterfaceUtils.showChoices(
        "Escolha um slot vazio para salvar:",
        opts,
        false
      );
    } else {
      const opts = all.map((s) => ({
        name: `Substituir Slot ${s.slot} — ${s.name} (Nv ${s.level})`,
        value: s.slot,
        symbol: `[${s.slot}]`,
      }));
      slot = await InterfaceUtils.showChoices(
        "Todos os 3 slots estão cheios. Qual deseja substituir?",
        opts,
        false
      );
    }

    // criar personagem
    const creator = new CharacterCreator(this.game); // ok passar GM, mas vamos usar o retorno
    const result = await creator.start(); // { player, name, traits } (após ajuste no CharacterCreator)
    let player = result?.player;

    // fallback: se seu CharacterCreator ainda não retornar "player", cria aqui:
    if (!player) {
      const name =
        result?.name ||
        (await InterfaceUtils.showInput(
          "Qual será o nome do seu herói?",
          "Herói",
          {
            minLength: 2,
            maxLength: 20,
            fieldName: "nome",
          }
        ));
      const traits = result?.traits || [];
      player = new Player({ name });
      // aplicar efeitos simples dos traços
      for (const t of traits) {
        const ef = t?.effects || {};
        if (ef.maxHp) {
          player.maxHp += ef.maxHp;
          player.hp = player.maxHp;
        }
        if (ef.atk) player.atk += ef.atk;
        if (ef.def) player.def += ef.def;
        if (ef.spd) player.spd += ef.spd;
      }
    }

    this.game.startNewGame(player, slot);
    InterfaceUtils.showSuccess(`A aventura começa no Slot ${slot}!`);
    await InterfaceUtils.waitForInput();
  }
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);
