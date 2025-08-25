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
var proximoNivel=function () {
  nivel++;
  exibicaoNivel.textContent = nivel;

  gameState.level = nivel;
  gameState.playerSequence = [];
  gameState.isPlayerTurn = false;

       // gera nova cor na sequência
  gameState.computerSequence = nextSequenceStep(gameState.computerSequence);

  // mostra a sequência
  mostrarSequencia();
}

     // Mostrar a sequência para o jogador
var mostrarSequencia = function () {
  let i = 0;
  var intervalo = setInterval(() => {
    if (i < gameState.computerSequence.length) {
      piscarCor(gameState.computerSequence[i]);
      i++;
    } else {
      clearInterval(intervalo);
      gameState.isPlayerTurn = true;
    }
  }, 1000);
}
    // Piscar cor (efeito visual)
var piscarCor= function (color) {
  var botao = document.getElementById(color);
  botao.classList.add("lit");
  setTimeout(() => {
    botao.classList.remove("lit");
  }, 500);
}
// Jogador clica em uma cor
var cliqueJogador = function (event) {
  if (!gameState.isPlayerTurn) return;

  var corEscolhida = event.target.id;
  piscarCor(corEscolhida);

  // adiciona no estado funcional
  gameState.playerSequence = [...gameState.playerSequence, corEscolhida];

  const resultado = checkPlayerMove(gameState);

  if (resultado === "incorrect") {
    gameOver();
    return;
  }

  if (resultado === "complete") {
    gameState.isPlayerTurn = false;
    setTimeout(proximoNivel, 1000);
  }
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
     
