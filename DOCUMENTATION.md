# Terminal RPG - Documentação do Projeto

## Visão Geral

O Terminal RPG é um jogo de RPG baseado em texto desenvolvido em Node.js. O projeto utiliza uma arquitetura modular com classes bem definidas para gerenciar diferentes aspectos do jogo.

## Estrutura do Projeto

```
terminalRPG/
├── index.js                 # Arquivo principal do jogo
├── package.json             # Configurações e dependências
├── README.md               # Documentação do usuário
├── DOCUMENTATION.md        # Esta documentação técnica
├── entities/               # Classes de entidades do jogo
│   ├── entity.js          # Classe base para todas as entidades
│   ├── player.js          # Classe do jogador
│   ├── monster.js         # Classe dos monstros
│   └── npc.js             # Classe dos NPCs
├── managers/               # Gerenciadores do sistema
│   ├── gameManager.js     # Gerenciador principal do jogo
│   ├── saveManager.js     # Sistema de salvamento
│   └── saves/             # Diretório de arquivos de save
│       └── slot1.json     # Exemplo de arquivo de save
├── utils/                  # Utilitários
│   └── interfaceUtils.js  # Utilitários de interface
└── core/                   # Funcionalidades principais
    └── characterCreator.js # Sistema de criação de personagens
```

## Arquitetura

### 1. Classe Principal: `TerminalRPG`
- **Arquivo**: `index.js`
- **Responsabilidade**: Controla o fluxo principal do jogo
- **Funcionalidades**:
  - Inicialização do jogo
  - Gerenciamento de menus
  - Navegação entre telas
  - Integração com outros sistemas

### 2. Gerenciadores

#### `GameManager`
- **Arquivo**: `managers/gameManager.js`
- **Responsabilidade**: Gerencia o estado global do jogo
- **Funcionalidades**:
  - Controle de estados do jogo
  - Gerenciamento do jogador
  - Coordenação com sistema de saves
  - Flags e variáveis de estado

#### `SaveManager`
- **Arquivo**: `managers/saveManager.js`
- **Responsabilidade**: Sistema de persistência de dados
- **Funcionalidades**:
  - Salvamento em múltiplos slots
  - Carregamento de saves
  - Gerenciamento de arquivos JSON
  - Validação de dados

### 3. Entidades

#### `Entity` (Classe Base)
- **Arquivo**: `entities/entity.js`
- **Responsabilidade**: Classe base para todas as entidades
- **Funcionalidades**:
  - Atributos básicos (HP, ATK, DEF, SPD)
  - Sistema de efeitos de status
  - Geração de IDs únicos
  - Serialização JSON

#### `Player`
- **Arquivo**: `entities/player.js`
- **Responsabilidade**: Representa o jogador
- **Funcionalidades**:
  - Sistema de experiência e level up
  - Inventário
  - Traços de personalidade
  - Estatísticas específicas do jogador

#### `Monster`
- **Arquivo**: `entities/monster.js`
- **Responsabilidade**: Representa inimigos
- **Funcionalidades**:
  - Recompensas de combate
  - Tipos de monstros
  - Drops de ouro e experiência

#### `NPC`
- **Arquivo**: `entities/npc.js`
- **Responsabilidade**: Representa personagens não-jogáveis
- **Funcionalidades**:
  - Sistema de relacionamento
  - Diálogos
  - Papéis específicos (mercador, guarda, etc.)

### 4. Utilitários

#### `InterfaceUtils`
- **Arquivo**: `utils/interfaceUtils.js`
- **Responsabilidade**: Utilitários de interface do usuário
- **Funcionalidades**:
  - Desenho de caixas e bordas
  - Sistema de escolhas interativas
  - Mensagens coloridas
  - Validação de input
  - Confirmações

### 5. Funcionalidades Principais

#### `CharacterCreator`
- **Arquivo**: `core/characterCreator.js`
- **Responsabilidade**: Sistema de criação de personagens
- **Funcionalidades**:
  - Perguntas de personalidade
  - Determinação de traços
  - Cálculo de estatísticas baseadas em traços
  - Interface interativa de criação

## Fluxo de Dados

### Inicialização do Jogo
1. `TerminalRPG.start()` é chamado
2. Verifica se existem saves salvos
3. Permite escolher entre continuar ou novo jogo
4. Inicializa `GameManager` e `SaveManager`

### Criação de Personagem
1. `CharacterCreator.start()` é chamado
2. Coleta nome e respostas de personalidade
3. `determineTraits()` calcula traços baseados nas respostas
4. `createPlayer()` cria instância de `Player` com estatísticas modificadas
5. `GameManager.startNewGame()` inicia o jogo com o personagem

### Sistema de Save
1. `SaveManager` gerencia arquivos JSON em slots
2. `GameManager.save()` serializa dados do jogador
3. `SaveManager.save()` escreve no arquivo
4. `SaveManager.load()` deserializa dados ao carregar

## Convenções de Código

### Documentação
- Todos os métodos e classes usam JSDoc
- Parâmetros e retornos são documentados
- Exemplos são fornecidos quando apropriado

### Nomenclatura
- Classes: PascalCase (`TerminalRPG`, `GameManager`)
- Métodos: camelCase (`showMainMenu`, `createPlayer`)
- Constantes: UPPER_SNAKE_CASE (`STATES`)
- Arquivos: camelCase (`gameManager.js`, `interfaceUtils.js`)

### Estrutura de Classes
- Construtores documentados com parâmetros
- Métodos públicos documentados
- Métodos privados quando necessário
- Uso de `static` para métodos utilitários

## Dependências

### Principais
- **chalk**: Coloração de texto no terminal
- **inquirer**: Interface interativa de linha de comando

### Versões
- Node.js: >= 14.0.0
- chalk: ^4.1.2
- inquirer: ^8.2.6

## Scripts Disponíveis

- `npm start`: Inicia o jogo
- `npm run editor`: Executa editor de dados (se implementado)
- `npm run debug`: Modo debug
- `npm run debug:save`: Debug com foco em saves

## Extensibilidade

O projeto foi projetado para ser facilmente extensível:

### Adicionando Novas Entidades
1. Estender a classe `Entity`
2. Implementar métodos específicos
3. Adicionar serialização JSON se necessário

### Adicionando Novos Sistemas
1. Criar nova classe gerenciadora
2. Integrar com `GameManager`
3. Adicionar métodos de save/load se necessário

### Adicionando Novas Telas
1. Criar método em `TerminalRPG`
2. Adicionar opção no menu principal
3. Implementar lógica específica

## Considerações de Performance

- Saves são carregados sob demanda
- Interface é limpa e redesenhada a cada interação
- Dados são serializados apenas quando necessário
- Validações são feitas no momento da entrada

## Segurança

- Validação de input em todos os campos
- Sanitização de nomes de arquivo
- Tratamento de erros em operações de arquivo
- Verificação de integridade de dados JSON
