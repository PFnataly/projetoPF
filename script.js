
const criarEstadoInicial = () => [
    0,      // nivel  =  começa no nível 0, pois ainda não houve rodadas
    [],     // sequenciaComputador = aqui é onde fica guardada a sequência que será gerada pelo computador
    [],     // sequenciaJogador  =  esse array guardará as cores jogadas pelo usuário
    false,  // turnoDoJogador  = booleano, diz se é turno do jogador ou do computador
    true    // fimDeJogo = booleano que irá dizer se o jogo está parado ou em andamento
];


// Função auxiliar para dar nomes às posições da tupla (para não se perder em índices)
const NIVEL = 0, SEQ_COMP = 1, SEQ_JOG = 2, TURNO_JOG = 3, FIM_JOGO = 4;


const proximoPassoDaSequencia = sequencia => { 
  // Essa daqui é uma função arrow e seu objetivo é, basicamente, adicionar uma nova cor a sequência
  const cores = ['green', 'red', 'yellow', 'blue'] 
  // Aqui a gente define as cores que poderão ser usadas
  const corAleatoria = cores[Math.floor(Math.random() * cores.length)] 
  // Aqui a gente gera um numero entre 0 e 1 com o Math.random. Multiplicamos pelo valor da lista
  // anterior, o cores.lenght - que é 4 -  será multiplicado pelo numero decimal, gerará um outro número e será arrendodado pelo Math.floor, que converterá para um inteiro
  // de 0 a 3, pois ele sempre arredonda pra baixo

  return [...sequencia, corAleatoria]
  // Aqui, por fim, temos o retorno dessa função, que basicamente cria a cópia do array original, sem alterá-lo, e adiciona uma nova cor. Ou seja, é gerado um novo
  // array, que garante a imutabilidade
}


// recebe os arrays do jogo como parâmetros
// verifica se a última jogada do jogador foi correta
const verificarJogada = (sequenciaComputador, sequenciaJogador) => { 
  // ALTERAÇÃO: agora recebe dois arrays
  const indiceUltimaJogada = sequenciaJogador.length - 1 

  if (sequenciaJogador[indiceUltimaJogada] !== sequenciaComputador[indiceUltimaJogada]) {
    return 'incorreta' 
    // Temos aqui o teste para o 'gameover'. Essa condição compara  a cor que o jogador acabou de clicar com a da sequência do computador, se for diferente 'bye bye'
  }
  
  if (sequenciaJogador.length === sequenciaComputador.length) {
    return 'completa' 
    // Essa condição compara se a quantidade que o jogador clicou é igual a do computador
  }
  
  return 'correta' // Aqui, se tudo estiver na ordem correta
}


const handlers = {
  INICIAR_JOGO: () => [0, [], [], false, false],

  TURNO_COMPUTADOR: ([nivel, seqComp, , , fimJogo]) => [
    nivel + 1,
    proximoPassoDaSequencia(seqComp),
    [],
    false,
    fimJogo
  ],

  TURNO_JOGADOR: ([nivel, seqComp, seqJog, , fimJogo]) => [
    nivel,
    seqComp,
    seqJog,
    true,
    fimJogo
  ],

  JOGADA_JOGADOR: ([nivel, seqComp, seqJog, , fimJogo], { payload }) => {
    const novaSeqJog = [...seqJog, payload.cor];
    const resultado = verificarJogada(seqComp, novaSeqJog);

    return resultado === "incorreta"
      ? [nivel, seqComp, novaSeqJog, false, true]
      : resultado === "completa"
      ? [nivel, seqComp, novaSeqJog, false, fimJogo]
      : [nivel, seqComp, novaSeqJog, true, fimJogo];
  }
};

const jogoReducer = (estado, acao) =>
  (handlers[acao.tipo] || ((s) => s))(estado, acao);



// DOM
const botoesDeCores = {
    green: document.getElementById('green'),
    red: document.getElementById('red'),
    yellow: document.getElementById('yellow'),
    blue: document.getElementById('blue')
}

const botaoIniciar = document.getElementById('start-btn')
const exibicaoNivel = document.getElementById('level')


const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const piscarBotaoDeCor = async (cor) => {
    const botao = botoesDeCores[cor]
    botao.classList.add('lit')
    await esperar(400)
    botao.classList.remove('lit')
    await esperar(200)
}

const tocarSequencia = (sequencia) => {
    return sequencia.reduce((promessa, cor) => {
        return promessa.then(() => piscarBotaoDeCor(cor));
    }, Promise.resolve());
};

const atualizarInterface = (estado) => {
    const [nivel, , , turnoJog, fimJogo] = estado
    exibicaoNivel.textContent = nivel
    botaoIniciar.disabled = !fimJogo
    const container = document.querySelector('.genius-board')
    container.style.pointerEvents = turnoJog ? 'auto' : 'none'
    if (fimJogo && nivel > 0) {
        exibicaoNivel.textContent = `Fim! Nível ${nivel}`
    }
}


// essa função aqui é pra esperar o jogador clicar em um botão
// ela fica de olho nos cliques, quando o caba clica em uma cor
// ela para de escutar os outros e devolve a cor que ele apertou

const aguardarCliqueDoJogador = () => {
    return new Promise(resolve => {
        const botoes = Object.values(botoesDeCores);

        const listener = (evento) => {
            const corClicada = evento.target.id;

            botoes.map(botao => botao.removeEventListener('click', listener));

            resolve(corClicada);
        };

        botoes.map(botao => botao.addEventListener('click', listener));
    });
};




const loopTurnoJogador = estado =>
  aguardarCliqueDoJogador()
    .then(corClicada => {
      const novoEstado = jogoReducer(estado, { tipo: 'JOGADA_JOGADOR', payload: { cor: corClicada } });
      atualizarInterface(novoEstado);
      return novoEstado;
    })
    .then(novoEstado => {
      if (novoEstado[FIM_JOGO]) return;
      return novoEstado[TURNO_JOG]
        ? loopTurnoJogador(novoEstado)
        : loopDoJogo(novoEstado);
    });

const loopDoJogo = estado => {

    return esperar(1000)
        .then(() => jogoReducer(estado, { tipo: 'TURNO_COMPUTADOR' }))
        .then(estadoComputador => {
            atualizarInterface(estadoComputador);
            return tocarSequencia(estadoComputador[SEQ_COMP]).then(() => estadoComputador);
        })
        .then(estadoComputador => jogoReducer(estadoComputador, { tipo: 'TURNO_JOGADOR' }))
        
        .then(estadoJogador => {
            atualizarInterface(estadoJogador); // ATUALIZA A TELA PARA ATIVAR OS BOTÕES
            return estadoJogador; // Passa o estado adiante
        })
        .then(loopTurnoJogador); // Agora sim começa o turno do jogador
};

const configuracaoInicial = () => {
    atualizarInterface(criarEstadoInicial());
    botaoIniciar.addEventListener('click', () => {
        const estadoInicial = jogoReducer(criarEstadoInicial(), { tipo: 'INICIAR_JOGO' });
        loopDoJogo(estadoInicial);
    });
};

configuracaoInicial();
