// Essa é a função que inicia o jogo. Sempre que chamamos, ela cria o novo jogo, completamento do zero
// Agora o estado é representado como uma tupla (array posicional), e não mais como objeto.
// A ordem é fixa: [nivel, sequenciaComputador, sequenciaJogador, turnoDoJogador, fimDeJogo]
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


const jogoReducer = (estado, acao) => {
  const [nivel, seqComp, seqJog, turnoJog, fimJogo] = estado

  switch (acao.tipo) {
    case 'INICIAR_JOGO':
      return [0, [], [], false, false] // novo jogo iniciado

    case 'TURNO_COMPUTADOR':
      return [
        nivel + 1, 
        proximoPassoDaSequencia(seqComp), 
        [], 
        false, 
        fimJogo
      ]

    case 'TURNO_JOGADOR':
      return [nivel, seqComp, seqJog, true, fimJogo]

    case 'JOGADA_JOGADOR':
      const novaSequenciaJogador = [...seqJog, acao.payload.cor]
      const resultado = verificarJogada(seqComp, novaSequenciaJogador) 

      if (resultado === 'incorreta') {
        return [nivel, seqComp, novaSequenciaJogador, false, true]
      }
      if (resultado === 'completa') {
        return [nivel, seqComp, novaSequenciaJogador, false, fimJogo]
      }
      return [nivel, seqComp, novaSequenciaJogador, true, fimJogo]

    default:
      return estado
  }
}



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

const tocarSequencia = async (sequencia) => {
    for (const cor of sequencia) {
        await piscarBotaoDeCor(cor)
    }
}

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
            botoes.forEach(b => b.removeEventListener('click', listener));
            resolve(evento.target.id);
        };
        botoes.forEach(b => b.addEventListener('click', listener));
    });
};


// aqui é o turno do jogador, o caba tem que repetir a sequencia
// a gente atualiza a tela e fica esperando ele clicar
// quando ele clica, o jogo vê se a jogada foi certa. se errou, o jogo acaba
// se acertou mas ainda falta cor, ele joga de novo. se acertou tudo, passa a vez pro pc
const loopTurnoJogador = async (estado) => {
    atualizarInterface(estado)
    const corClicada = await aguardarCliqueDoJogador()
    const novoEstado = jogoReducer(estado, { tipo: 'JOGADA_JOGADOR', payload: { cor: corClicada } })
    atualizarInterface(novoEstado)
    if (novoEstado[FIM_JOGO]) return
    if (novoEstado[TURNO_JOG]) {
        await loopTurnoJogador(novoEstado) // ALTERAÇÃO: await para Promise resolver corretamente
    } else {
        await loopDoJogo(novoEstado) // ALTERAÇÃO: await para Promise resolver corretamente
    }
};


// esse é o loop principal, o que controla o jogo todo
// primeiro a gente desliga os botoes pro jogador não clicar na vez do pc e espera um segundo
// o computador pensa numa cor nova e aumenta o nivel
// ai mostra a sequencia nova pro jogador piscar
// e depois chama a função do turno do jogador pra ele se virar e tentar acertar
const loopDoJogo = async (estado) => {
    atualizarInterface([...estado.slice(0, TURNO_JOG), false, ...estado.slice(TURNO_JOG + 1)])
    await esperar(1000);
    const estadoComputador = jogoReducer(estado, { tipo: 'TURNO_COMPUTADOR' })
    atualizarInterface(estadoComputador)
    await tocarSequencia(estadoComputador[SEQ_COMP]);
    const estadoJogador = jogoReducer(estadoComputador, { tipo: 'TURNO_JOGADOR' })
    await loopTurnoJogador(estadoJogador) // ALTERAÇÃO: await para Promise resolver corretamente
};


//Altera o estado inicial para um estado de jogo iniciado
const configuracaoInicial = () => {
    atualizarInterface(criarEstadoInicial());
    botaoIniciar.addEventListener('click', () => {
        const estadoInicial = jogoReducer(criarEstadoInicial(), { tipo: 'INICIAR_JOGO' });
        loopDoJogo(estadoInicial);
    });
};

// CHAMADA NECESSÁRIA: inicia a configuração do jogo
configuracaoInicial(); // ALTERAÇÃO: chamar a função para o jogo começar
