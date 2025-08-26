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


const proximoPassoDaSequencia = sequencia => {
  const cores = ['green', 'red', 'yellow', 'blue']
  const corAleatoria = cores[Math.floor(Math.random() * cores.length)]
  return [...sequencia, corAleatoria]
}

// recebe o estado atual do jogo como parâmetro
// verifica se a última jogada do jogador foi correta
const verificarJogada = estado => {
  const { sequenciaComputador, sequenciaJogador } = estado
  const indiceUltimaJogada = sequenciaJogador.length - 1

  if sequenciaJogador[indiceUltimaJogada] !== sequenciaComputador[indiceUltimaJogada] {
    return 'incorreta'
  }
  if sequenciaJogador.length === sequenciaComputador.length {
    return 'completa'
  }
  return 'correta'
}

const jogoReducer = (estado, acao) => {
  switch acao.tipo {
    case 'INICIAR_JOGO':
      return { ...criarEstadoInicial(), fimDeJogo: false }

    case 'TURNO_COMPUTADOR':
      return {
        ...estado,
        nivel: estado.nivel + 1,
        sequenciaJogador: [],
        sequenciaComputador: proximoPassoDaSequencia(estado.sequenciaComputador),
        turnoDoJogador: false
      }

    case 'TURNO_JOGADOR':
      return { ...estado, turnoDoJogador: true }

    case 'JOGADA_JOGADOR':
      const novaSequenciaJogador = [...estado.sequenciaJogador, acao.payload.cor]
      const resultado = verificarJogada(estado.sequenciaComputador, novaSequenciaJogador)

      if resultado === 'incorreta' {
        return { ...estado, sequenciaJogador: novaSequenciaJogador, fimDeJogo: true, turnoDoJogador: false }
      }
      if resultado === 'completa' {
        return { ...estado, sequenciaJogador: novaSequenciaJogador, turnoDoJogador: false }
      }
      return { ...estado, sequenciaJogador: novaSequenciaJogador }

    default:
      return estado
  }
}



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
    exibicaoNivel.textContent = estado.nivel
    botaoIniciar.disabled = !estado.fimDeJogo
    const container = document.querySelector('.genius-board')
    container.style.pointerEvents = estado.turnoDoJogador ? 'auto' : 'none'
    if (estado.fimDeJogo && estado.nivel > 0) {
        exibicaoNivel.textContent = `Fim! Nível ${estado.nivel}`
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
    if (novoEstado.fimDeJogo) return
    if (novoEstado.turnoDoJogador) {
        loopTurnoJogador(novoEstado)
    } else {
        loopDoJogo(novoEstado)
    }
};

// esse é o loop principal, o que controla o jogo todo
// primeiro a gente desliga os botoes pro jogador não clicar na vez do pc e espera um segundo
// o computador pensa numa cor nova e aumenta o nivel
// ai mostra a sequencia nova pro jogador piscar
// e depois chama a função do turno do jogador pra ele se virar e tentar acertar
const loopDoJogo = async (estado) => {
    atualizarInterface({ ...estado, turnoDoJogador: false })
    await esperar(1000);
    const estadoComputador = jogoReducer(estado, { tipo: 'TURNO_COMPUTADOR' })
    atualizarInterface(estadoComputador)
    await tocarSequencia(estadoComputador.sequenciaComputador);
    const estadoJogador = jogoReducer(estadoComputador, { tipo: 'TURNO_JOGADOR' })
    loopTurnoJogador(estadoJogador)
};
