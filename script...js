// =============================================
// CÉREBRO FUNCIONAL (LÓGICA PURA)
// =============================================
//funçao que cria e retorna o estado inicial do jogo
// retorno objeto com propriedades: nivel, array vazio para sequencia, array vazio para as jogadas
//flag booleana 1, indica a vez do jogador, flag boolreana 2 zera e prepara o jogo
// Cria e retorna o estado inicial do jogo.
const criarEstadoInicial = () => ({
    nivel: 0,
    sequenciaComputador: [],
    sequenciaJogador: [],
    turnoDoJogador: false,
    fimDeJogo: true,
});


// Calcula o próximo passo da sequência do computador.
const proximoPassoDaSequencia = (sequencia) => {
    const cores = ['green', 'red', 'yellow', 'blue'];
    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];
    return [...sequencia, corAleatoria];
};

//recebe o estado atual do jogo como párametro
// Verifica se a última jogada do jogador foi correta.
const verificarJogada = (estado) => {
    const { sequenciaComputador, sequenciaJogador } = estado;
    const indiceUltimaJogada = sequenciaJogador.length - 1;

    if (sequenciaJogador[indiceUltimaJogada] !== sequenciaComputador[indiceUltimaJogada]) {
        return 'incorreta';
    }
    if (sequenciaJogador.length === sequenciaComputador.length) {
        return 'completa';
    }
    return 'correta';
};

// =============================================
// RESTO DO JOGO com algumas mudanças
// =============================================



// Agora o estado é criado pelo cérebro funcional
var gameState = createInitialState();

// Elementos da interface
// Pega os elementos da tela uma única vez.
const elementos = {
    botaoIniciar: document.getElementById('start-btn'),
    exibicaoNivel: document.getElementById('level'),
    painelBotoes: document.querySelector('.genius-board'),
    botoesCores: document.querySelectorAll('.color-pad'),
};

  

// Próximo nível


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



