// =============================================
// CÉREBRO FUNCIONAL (LÓGICA PURA)
// =============================================
//funçao que cria e retorna o estado inicial do jogo
// retorno objeto com propriedades: nivel, array vazio para sequencia, array vazio para as jogadas
//flag booleana 1, indica a vez do jogador, flag boolreana 2 zera e prepara o jogo
const createInitialState = () => ({
  level: 0,
  computerSequence: [],
  playerSequence: [],
  isPlayerTurn: false,
  isGameOver: true,
});
//recebe como parametro a sequencia atual do computador
//array cores do jogo

const nextSequenceStep = (sequence) => {
  const colors = ['green', 'red', 'yellow', 'blue'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return [...sequence, randomColor];
};
//recebe o estado atual do jogo como párametro
const checkPlayerMove = (state) => {
  const { computerSequence, playerSequence } = state;
  const lastPlayerMoveIndex = playerSequence.length - 1;

  if (playerSequence[lastPlayerMoveIndex] !== computerSequence[lastPlayerMoveIndex]) {
    return 'incorrect';
  }

  if (playerSequence.length === computerSequence.length) {
    return 'complete';
  }

  return 'correct';
};
// =============================================
// RESTO DO JOGO com algumas mudanças
// =============================================

    // Variáveis de estado do jogo
    var level = 0;
    var isPlayerTurn = false;

// Agora o estado é criado pelo cérebro funcional
var gameState = createInitialState();

// Elementos da interface
var botaoIniciar = document.getElementById("start-btn");
var exibicaoNivel = document.getElementById("level");
var botoesCores = document.querySelectorAll("color-pad");

  
    // Iniciar jogo
var iniciarJogo =function () {
  gameState = createInitialState(); // reinicia estado
  gameState.isGameOver = false;
  nivel = 0;
  exibicaoNivel.textContent = nivel;
  proximoNivel();
}
// Próximo nível
case 'START_COMPUTER_TURN':
    return {
        ...state,
        level: state.level + 1,
        playerSequence: [],
        computerSequence: nextSequenceStep(state.computerSequence),
        isPlayerTurn: false,
    };

     // Mostrar a sequência para o jogador
const playSequence = async (sequence) => {
    for (const color of sequence) {
        await flashColorPad(color);
    }
};
    // Piscar cor (efeito visual)
var piscarCor= function (color) {
  var botao = document.getElementById(color);
  botao.classList.add("lit");
  setTimeout(() => {
    botao.classList.remove("lit");
  }, 500);
}
// Jogador clica em uma cor
case 'PLAYER_CLICK': {
    const newPlayerSequence = [...state.playerSequence, action.payload.color];
    const moveResult = checkPlayerMove(state.computerSequence, newPlayerSequence);
    
    if (moveResult === 'incorrect') return { ...state, isGameOver: true, ... };
    if (moveResult === 'complete') return { ...state, isPlayerTurn: false, ... };
    return { ...state, playerSequence: newPlayerSequence };
}

// Game Over
 var gameOver = function() {
  alert(`Fim de jogo! Você alcançou o nível ${nivel}`);
  gameState.isGameOver = true;
  isPlayerTurn = false;
  botaoIniciar.disabled = false;
  exibicaoNivel.textContent = "0";
}

// Eventos
botaoIniciar.addEventListener("click", iniciarJogo);
botoesCores.forEach(botao => {
  botao.addEventListener("click", cliqueJogador);
});
     
