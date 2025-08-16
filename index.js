const InterfaceUtils = require("./utils/interfaceUtils");
const GameManager = require("./managers/gameManager");

/**
 * Classe principal do jogo Terminal RPG.
 * Gerencia o fluxo principal do jogo, incluindo menus, navegação e interação com o usuário.
 */
class TerminalRPG {
  /**
   * Construtor da classe TerminalRPG.
   * Inicializa o gerenciador do jogo e define o estado de execução.
   */
  constructor() {
    this.game = new GameManager();
    this.isRunning = true;
  }

  /**
   * Inicia o jogo, exibindo o título e gerenciando o fluxo inicial.
   * Verifica se existem saves e permite ao usuário escolher entre continuar ou novo jogo.
   * 
   * @returns {Promise<void>} Promise que resolve quando o jogo termina.
   */
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
      const loaded = await this.manageSaves(); // <<<<< aqui
      if (!loaded) {
        // usuário voltou ou só excluiu; volta pro menu principal de início
        return this.start();
      }
    } else {
      await this.createNewCharacterFlow();
    }

    await this.showMainMenu();
  }

  /**
   * Exibe o menu principal do jogo com todas as opções disponíveis.
   * Loop principal que mantém o jogo rodando até que o usuário escolha sair.
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
      this.drawPlayerHUD();
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
   * Funcionalidade placeholder que será implementada futuramente.
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
   * Funcionalidade placeholder que será implementada futuramente.
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
   * Exibe o perfil detalhado do jogador.
   * Mostra todas as estatísticas do personagem em uma interface compacta.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
   */
  async showProfile() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("[P] PERFIL DO JOGADOR", 60);
    console.log();

    const p = this.game.player;
    if (!p) {
      InterfaceUtils.showError("Nenhum personagem carregado.");
      await InterfaceUtils.waitForInput();
      return;
    }

    const profileLines = [
      `[NOME: ${p.name}].`,
      `[NÍVEL: ${p.level} (${p.xp}/${p.xpToLevelUp})].`,
      `[HP: ${p.hp}/${p.maxHp}].`,
      `[FORÇA/ATK: ${p.atk}].`,
      `[AGILIDADE/SPD: ${p.spd}].`,
      `[FÍSICO/DEF: ${p.def}].`,
      `[OURO: ${p.gold}].`,
    ];

    // janela compacta no mesmo estilo do HUD
    InterfaceUtils.drawBox(profileLines, 40);
    await InterfaceUtils.waitForInput();
  }

  /**
   * Exibe as configurações do jogo.
   * Funcionalidade placeholder que será implementada futuramente.
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

  /**
   * Permite ao usuário selecionar e carregar um slot de save específico.
   * 
   * @returns {Promise<boolean>} Promise que resolve com true se um save foi carregado com sucesso.
   */
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

  /**
   * Gerencia a interface de saves, permitindo carregar ou excluir saves.
   * Loop que permite ao usuário navegar entre diferentes ações de save.
   * 
   * @returns {Promise<boolean>} Promise que resolve com true se um save foi carregado, false se o usuário voltou.
   */
  async manageSaves() {
    const InterfaceUtils = require("./utils/interfaceUtils");

    while (true) {
      const saves = this.game.listSaves(); // [{slot, exists, name, level, lastSaved}]
      if (!saves.length) {
        InterfaceUtils.showError("Nenhum slot disponível.");
        await InterfaceUtils.waitForInput();
        return false;
      }

      // opções de carregar
      const opts = saves
        .filter((s) => s.exists)
        .map((s) => ({
          name: `Carregar Slot ${s.slot} — ${s.name} (Nv ${s.level})`,
          value: `load-${s.slot}`,
          symbol: `[${s.slot}]`,
        }));

      // opções de excluir (apenas slots existentes)
      saves
        .filter((s) => s.exists)
        .forEach((s) => {
          opts.push({
            name: `Excluir Slot ${s.slot} — ${s.name}`,
            value: `delete-${s.slot}`,
            symbol: `[-${s.slot}]`,
          });
        });

      // caso não exista nenhum save, dá opção de voltar
      if (!opts.length) {
        await InterfaceUtils.showInfo(
          "Não há saves para continuar. Crie um novo jogo."
        );
        await InterfaceUtils.waitForInput();
        return false;
      }

      // opção Voltar
      opts.push({ name: "Voltar", value: "back", symbol: "[B]" });

      InterfaceUtils.clearScreen();
      InterfaceUtils.drawBox("[GERENCIAR SAVES]", 60);
      console.log();

      const choice = await InterfaceUtils.showChoices(
        "Escolha um slot para CARREGAR ou EXCLUIR:",
        opts,
        false
      );

      if (choice === "back") return false;

      const [action, slotStr] = choice.split("-");
      const slot = Number(slotStr);

      if (action === "load") {
        const ok = this.game.loadFromSlot(slot);
        if (ok) return true;
        InterfaceUtils.showError(`Não foi possível carregar o Slot ${slot}.`);
        await InterfaceUtils.waitForInput();
        // volta ao loop para tentar outra ação
      }

      if (action === "delete") {
        const confirm = await InterfaceUtils.confirm(
          `Tem certeza que deseja EXCLUIR o Slot ${slot}?`
        );
        if (confirm) {
          this.game.saves.delete(slot);
          InterfaceUtils.showSuccess(`Slot ${slot} excluído!`);
          await InterfaceUtils.waitForInput();
        }
        // volta ao loop (lista atualiza)
      }
    }
  }

  /**
   * Salva o progresso atual do jogo.
   * Exibe mensagem de sucesso ou erro dependendo do resultado da operação.
   * 
   * @returns {Promise<void>} Promise que resolve quando o usuário confirma a mensagem.
   */
  async saveProgress() {
    const ok = this.game.save();
    if (ok) {
      InterfaceUtils.showSuccess("Progresso salvo com sucesso!");
    } else {
      InterfaceUtils.showError(
        "Não foi possível salvar. Abra um slot primeiro (Novo Jogo/Continuar)."
      );
    }
    await InterfaceUtils.waitForInput();
  }

  /**
   * Confirma a saída do jogo e salva o progresso antes de encerrar.
   * 
   * @returns {Promise<void>} Promise que resolve quando o jogo é encerrado.
   */
  async exitAndSave() {
    const confirmed = await InterfaceUtils.confirm(
      "Tem certeza que deseja sair?"
    );
    if (!confirmed) return;

    const ok = this.game.save();
    if (ok) {
      InterfaceUtils.showSuccess("Progresso salvo! Até logo!");
    } else {
      InterfaceUtils.showError(
        "Não foi possível salvar antes de sair (slot indefinido)."
      );
    }
    this.isRunning = false;
  }

  /**
   * Fluxo completo de criação de um novo personagem.
   * Permite ao usuário escolher um slot e criar um personagem através do CharacterCreator.
   * 
   * @returns {Promise<void>} Promise que resolve quando o personagem é criado e o jogo inicia.
   */
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

    this.game.startNewGame(player, slot);
    InterfaceUtils.showSuccess(`A aventura começa no Slot ${slot}!`);
    await InterfaceUtils.waitForInput();
  }

  /**
   * Desenha o HUD (Heads-Up Display) do jogador no menu principal.
   * Exibe informações básicas do personagem em uma caixa compacta.
   */
  drawPlayerHUD() {
    const p = this.game.player;
    if (!p) return;

    const lines = [
      `[NOME: ${p.name}].`,
      `[NÍVEL: ${p.level}].`,
      `[HP: ${p.hp}/${p.maxHp}].`,
      `[OURO: ${p.gold}].`,
    ];
    // largura ~40 deixa parecido com a imagem; ajuste se quiser
    InterfaceUtils.drawBox(lines, 40);
    console.log();
  }
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);
