const InterfaceUtils = require("./utils/interfaceUtils");
const GameManager = require("./managers/gameManager");
const CharacterCreator = require("./core/characterCreator");
const MapManager = require("./managers/mapManager");
const QuestManager = require("./managers/questManager");
const NPCManager = require("./managers/npcManager");
const TimeManager = require("./managers/timeManager");
const StoryManager = require("./managers/storyManager");
const SkillManager = require("./managers/skillManager");
const MonsterManager = require("./managers/monsterManager");
const CombatManager = require("./managers/combatManager");
const Player = require("./entities/player");

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
    this.map = new MapManager(); // carrega e indexa worldMap.json
    this.quest = new QuestManager(); // gerencia sistema de missões
    this.npc = new NPCManager(); // gerencia NPCs
    this.time = new TimeManager(); // ciclo de tempo
    this.story = new StoryManager(); // eventos da história
    this.skills = new SkillManager(); // habilidades
    this.monster = new MonsterManager(); // monstros
    this.combat = new CombatManager(); // combates
    this.isRunning = true;
  }

  /**
   * Inicia o jogo, exibindo o título e gerenciando o fluxo inicial.
   * Verifica se existem saves e permite ao usuário escolher entre continuar ou novo jogo.
   *
   * @returns {Promise<void>} Promise que resolve quando o jogo termina.
   */
  async start() {
    while (true) {
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
        const loaded = await this.manageSaves();
        if (!loaded) {
          // usuário só voltou/excluiu -> repete o loop
          InterfaceUtils.clearScreen();
          continue;
        }
      } else {
        await this.createNewCharacterFlow();
      }
      break; // saiu do loop e segue para o menu principal
    }

    this.time.start(this.game);
    await this.story.play(this.game);
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
        { name: "Explorar", value: "explore", symbol: "[E]" },
        { name: "NPCs no local", value: "npcs", symbol: "[N]" },
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
        case "explore":
          await this.explore();
          break;
        case "npcs":
          await this.showNPCs();
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
    
    // localização atual
    let here = this.map.getCurrentLocation(this.game);
    if (!here) {
      this.map.ensureDefaultLocation(this.game);
      here = this.map.getCurrentLocation(this.game);
    }

    if (here) {
      InterfaceUtils.drawBox(
        [
          `[VOCÊ ESTÁ EM: ${here.name}].`,
          `[TIPO: ${here.type.toUpperCase()}].`,
          here.description ? `[${here.description}]` : "",
        ].filter(Boolean),
        60
      );
      console.log();
    }

    // opções: Explorar Locais (filhos), Subir Nível, Voltar
    const choices = [
      { name: "Explorar locais aqui", value: "children", symbol: "[E]" },
      { name: "Subir um nível (voltar)", value: "up", symbol: "[U]" },
      { name: "Voltar", value: "back", symbol: "[B]" },
    ];

    const pick = await InterfaceUtils.showChoices("O que deseja fazer?", choices, false);
    if (pick === "back") return;

    if (pick === "up") {
      // subir 1 nível na hierarquia (se possível)
      const node = here;
      const parentKey = node.parentPath.join(">");
      const parent = this.map.getLocation(parentKey);
      if (parent) {
        this.map.setCurrentLocation(this.game, parent);
        this.game.save(); // opcional
      }
      return;
    }

    if (pick === "children") {
      // listar filhos diretos (ex.: da 'cidade' saem 'villas'; da 'vila' saem 'locals')
      const kids = this.map.listChildren(here);
      if (!kids.length) {
        InterfaceUtils.showInfo("Nada para explorar aqui (nível mais baixo).");
        await InterfaceUtils.waitForInput();
        return;
      }

      const opts = kids.map((k) => ({
        name: `${k.name} — ${k.type}`,
        value: k.id,
        symbol: ">",
      }));
      const destId = await InterfaceUtils.showChoices("Para onde deseja ir?", opts, true);
      if (destId === "back") return;

      const dest = this.map.getLocation(destId);
      if (!dest) {
        InterfaceUtils.showError("Destino inválido.");
        await InterfaceUtils.waitForInput();
        return;
      }

      this.map.setCurrentLocation(this.game, dest);
      this.game.save(); // opcional: salva viagem
      InterfaceUtils.showSuccess(`Você viajou para ${dest.name}.`);
      await InterfaceUtils.waitForInput();

      // Se o novo destino for 'local' (ex.: loja_armas), aqui você abre o sistema correspondente
      // ex.: if (dest.type === 'local' && dest.id === 'loja_armas') openWeaponShop();
      if (dest.type === 'inn') {
        await this.openInn();
      }
    }
  }

  /**
   * Exibe o menu de missões e permite aceitar ou visualizar missões.
   *
   * @returns {Promise<void>} Promise que resolve quando o usuário volta ao menu.
   */
  async showQuests() {
    while (true) {
      InterfaceUtils.clearScreen();
      InterfaceUtils.drawBox("[Q] MENU DE MISSÕES", 60);
      console.log();

      const choice = await InterfaceUtils.showChoices(
        "Selecione:",
        [
          { name: "Quests disponíveis", value: "available", symbol: "[D]" },
          { name: "Missões ativas", value: "active", symbol: "[A]" },
          { name: "Voltar", value: "back", symbol: "[B]" },
        ],
        false
      );

      if (choice === "back") return;

      if (choice === "available") {
        const quests = this.quest.getAvailableQuests(this.game);
        if (!quests.length) {
          InterfaceUtils.showInfo("Nenhuma missão disponível aqui.");
          await InterfaceUtils.waitForInput();
          continue;
        }

        const opts = quests.map((q) => ({
          name: `${q.name} (${q.type})`,
          value: q.id,
          symbol: ">",
        }));
        const picked = await InterfaceUtils.showChoices(
          "Missões disponíveis:",
          opts,
          true
        );
        if (picked === "back") continue;

        const q = this.quest.getQuestById(picked);
        InterfaceUtils.clearScreen();
        const detailLines = [
          `[${q.name}]`,
          `[${q.type.toUpperCase()}]`,
          q.description,
        ];
        if (q.hint) detailLines.push(`Dica: ${q.hint}`);
        if (q.time) detailLines.push(`Disponível das ${q.time.start}h às ${q.time.end}h`);
        if (q.conditions) {
          const cond = [];
          if (q.conditions.minLevel) cond.push(`Nível ${q.conditions.minLevel}`);
          if (q.conditions.fame) cond.push(`Fama ${q.conditions.fame}`);
          if (q.conditions.relations) {
            for (const [n, v] of Object.entries(q.conditions.relations)) cond.push(`${n}: ${v}`);
          }
          if (cond.length) detailLines.push(`Condições: ${cond.join(', ')}`);
        }
        if (q.objectives?.length) {
          detailLines.push('Objetivos:');
          q.objectives.forEach((o) => detailLines.push(`- ${o.description || o}`));
        }
        if (q.rewards) {
          const rewards = Object.entries(q.rewards)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(', ');
          detailLines.push(`Recompensas: ${rewards}`);
        }
        InterfaceUtils.drawBox(detailLines, 60);
        console.log();

        const accept = await InterfaceUtils.confirm("Aceitar esta missão?");
        if (accept) {
          this.quest.acceptQuest(this.game, q.id);
          this.game.save();
          InterfaceUtils.showSuccess("Missão aceita!");
        } else {
          InterfaceUtils.showInfo("Missão rejeitada.");
        }
        await InterfaceUtils.waitForInput();
      }

      if (choice === "active") {
        const active = this.quest.getActiveQuests(this.game);
        if (!active.length) {
          InterfaceUtils.showInfo("Nenhuma missão ativa.");
          await InterfaceUtils.waitForInput();
          continue;
        }
        const opts = active.map((q) => ({
          name: `[${q.type.toUpperCase()}] ${q.name}`,
          value: q.id,
          symbol: ">",
        }));
        const picked = await InterfaceUtils.showChoices("Missões ativas:", opts, true);
        if (picked === "back") continue;
        const q = this.quest.getQuestById(picked);
        InterfaceUtils.clearScreen();
        const progress = `${this.quest.getProgress(this.game, q.id)}/${q.objectives?.[0]?.required || 0}`;
        const lines = [
          `[${q.name}]`,
          q.description,
          `Progresso: ${progress}`,
        ];
        if (q.hint) lines.push(`Dica: ${q.hint}`);
        if (q.conditions) {
          const cond = [];
          if (q.conditions.minLevel) cond.push(`Nível ${q.conditions.minLevel}`);
          if (q.conditions.fame) cond.push(`Fama ${q.conditions.fame}`);
          if (q.conditions.relations) {
            for (const [n, v] of Object.entries(q.conditions.relations)) cond.push(`${n}: ${v}`);
          }
          if (cond.length) lines.push(`Condições: ${cond.join(', ')}`);
        }
        InterfaceUtils.drawBox(lines, 60);
        console.log();
        await InterfaceUtils.waitForInput();
      }
    }
  }

  /**
   * Lista NPCs presentes na localização atual e permite interagir.
   */
  async showNPCs() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("[N] NPCS", 60);
    console.log();

    const here = this.map.getCurrentLocation(this.game);
    const hour = this.time.getHour(this.game);
    const npcs = here ? this.npc.getNPCsAt(here.id, hour) : [];
    if (!npcs.length) {
      InterfaceUtils.showInfo("Ninguém por perto.");
      await InterfaceUtils.waitForInput();
      return;
    }
    const opts = npcs.map((n) => ({ name: n.name, value: n.id, symbol: ">" }));
    const pick = await InterfaceUtils.showChoices("Com quem deseja falar?", opts, true);
    if (pick === "back") return;
    const npc = this.npc.getNPCById(pick);
    if (!npc) return;

    await this.interactWithNPC(npc);
  }

  async interactWithNPC(npc) {
    while (true) {
      InterfaceUtils.clearScreen();
      const fameDialogue =
        this.game.player.fame >= 50 && npc.dialogueFamous.length
          ? npc.dialogueFamous[0]
          : npc.dialogue[0] || "...";
      InterfaceUtils.drawBox([
        `[${npc.name}]`,
        fameDialogue,
        `Relacionamento: ${this.getRelationship(npc.id)}`,
      ], 60);
      console.log();

      const choice = await InterfaceUtils.showChoices(
        "O que deseja fazer?",
        [
          { name: "Conversar", value: "talk", symbol: "[C]" },
          { name: "Passar tempo", value: "spend", symbol: "[T]" },
          { name: "Voltar", value: "back", symbol: "[B]" },
        ],
        false
      );

      if (choice === "back") return;
      if (choice === "talk") {
        if (npc.dialogueTree?.length) {
          const completed = await this.runDialogue(npc);
          completed.forEach(({ quest, rewards }) => {
            InterfaceUtils.showSuccess("Missão concluída!");
            if (rewards) {
              const r = Object.entries(rewards)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(', ');
              InterfaceUtils.showInfo(`Recompensas: ${r}`);
            }
          });
        } else {
          this.changeRelationship(npc.id, 1);
          InterfaceUtils.showInfo("Vocês conversam um pouco.");
          await InterfaceUtils.waitForInput();
        }
      }
      if (choice === "spend") {
        this.changeRelationship(npc.id, 2);
        this.time.advanceHour(this.game, 1);
        InterfaceUtils.showInfo("O tempo passa enquanto vocês interagem.");
        await InterfaceUtils.waitForInput();
      }
    }
  }

  /** Executa árvore de diálogo com opções. */
  async runDialogue(npc) {
    let node = npc.dialogueTree.find(n => n.id === 'start');
    while (node) {
      InterfaceUtils.clearScreen();
      InterfaceUtils.drawBox([`[${npc.name}]`, node.text], 60);
      console.log();
      if (!node.options || !node.options.length) break;
      const opts = node.options.map((o, i) => ({ name: o.text, value: i, symbol: '>' }));
      const pick = await InterfaceUtils.showChoices('Escolha uma resposta:', opts, false);
      const opt = node.options[pick];
      if (opt.rel) this.changeRelationship(npc.id, opt.rel);
      if (!opt.next) {
        await InterfaceUtils.waitForInput();
        return this.quest.recordTalk(this.game, npc.id);
      }
      node = npc.dialogueTree.find(n => n.id === opt.next);
    }
    return [];
  }

  changeRelationship(npcId, delta) {
    this.game.flags.npcRelations = this.game.flags.npcRelations || {};
    const cur = this.game.flags.npcRelations[npcId] || 0;
    this.game.flags.npcRelations[npcId] = cur + delta;
  }

  getRelationship(npcId) {
    return this.game.flags.npcRelations?.[npcId] || 0;
  }

  /**
   * Abre o menu da estalagem, permitindo dormir para recuperar HP/MP e avançar o tempo.
   */
  async openInn() {
    InterfaceUtils.clearScreen();
    InterfaceUtils.drawBox("ESTALAGEM", 40);
    console.log();
    const confirm = await InterfaceUtils.confirm("Deseja dormir? (8 horas)");
    if (confirm) {
      const p = this.game.player;
      p.heal(Math.floor(p.maxHp * 0.5));
      p.restoreMana(Math.floor(p.maxMp * 0.5));
      this.time.advanceHour(this.game, 8);
      InterfaceUtils.showSuccess("Você descansou e se sente revigorado.");
      await InterfaceUtils.waitForInput();
    }
  }

  /** Explora a região procurando monstros. */
  async explore() {
    const here = this.map.getCurrentLocation(this.game);
    const hour = this.time.getHour(this.game);
    const monsters = here ? this.monster.getMonstersAt(here.id, hour) : [];
    if (!monsters.length) {
      InterfaceUtils.showInfo('Nenhum monstro aparece.');
      await InterfaceUtils.waitForInput();
      return;
    }
    const opts = monsters.map(m => ({ name: m.name, value: m.id, symbol: '>' }));
    const pick = await InterfaceUtils.showChoices('Monstros encontrados:', opts, true);
    if (pick === 'back') return;
    const monster = monsters.find(m => m.id === pick);
    const win = await this.combat.fight(this.game.player, monster);
    if (win) {
      const completed = this.quest.recordKill(this.game, monster.id);
      completed.forEach(({ quest, rewards }) => {
        InterfaceUtils.showSuccess('Missão concluída!');
        if (rewards) {
          const r = Object.entries(rewards)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(', ');
          InterfaceUtils.showInfo(`Recompensas: ${r}`);
        }
      });
      this.game.save();
    }
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
      `[HP: ${p.hp}/${p.maxHp}] [MP: ${p.mp}/${p.maxMp}].`,
      `[FORÇA/ATK: ${p.atk}].`,
      `[AGILIDADE/SPD: ${p.spd}].`,
      `[FÍSICO/DEF: ${p.def}].`,
      `[OURO: ${p.gold}] [FAMA: ${p.fame}].`,
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
    const slots = this.game.listSaves().filter((s) => s.exists);
    if (!slots.length) return false;

    const opts = slots.map((s) => ({
      name: `Carregar Slot ${s.slot} — ${s.name} (Nv ${s.level}) - ${new Date(
        s.lastSaved
      ).toLocaleString()}`,
      value: `load-${s.slot}`,
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
    this.time.stop();
    this.isRunning = false;
  }

  /**
   * Fluxo completo de criação de um novo personagem.
   * Permite ao usuário escolher um slot e criar um personagem através do CharacterCreator.
   *
   * @returns {Promise<void>} Promise que resolve quando o personagem é criado e o jogo inicia.
   */
  async createNewCharacterFlow() {
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

    const here = this.map.getCurrentLocation(this.game);
    const lines = [
      `[NOME: ${p.name}].`,
      `[NÍVEL: ${p.level}].`,
      `[HP: ${p.hp}/${p.maxHp}] [MP: ${p.mp}/${p.maxMp}].`,
      `[OURO: ${p.gold}] [FAMA: ${p.fame}].`,
      here ? `[LOCAL: ${here.name}]` : '',
      `[HORA: ${this.time.getFormattedTime(this.game)}]`,
    ].filter(Boolean);

    InterfaceUtils.drawBox(lines, 40);
    console.log();
  }
}

// Iniciar o jogo
const game = new TerminalRPG();
game.start().catch(console.error);
