// Essa é a função que inicia o jogo. Sempre que chamamos, ela cria o novo jogo, completamento do zero
const criarEstadoInicial = () => ({
    // Aqui, o que temos é um objeto, mas que ainda permanece dentro dos paradigmas funcionais, pois ele representa: 
    //Funções puras (saída depende só da entrada, sem efeitos colaterais).
    // Imutabilidade (não alterar valores diretamente, mas criar novos estados).
    // Uso de composição de funções.
    //Evitar estado global e mutável.
    //Um objeto em si não é exclusivo da orientação a objetos (OO).
    //OO se caracteriza por coisas como classes, herança, polimorfismo, métodos que carregam estado, etc.
    //No seu caso, o objeto está sendo usado só como estrutura de dados (um agrupador de informações).
    // A gente optou por essa abordagem, pois fica mais didático o código, mas poderiamos fazer da seguinte forma,  
    //const [nivel, sequenciaComputador, sequenciaJogador, turnoDoJogador, fimDeJogo] = criarEstadoInicial()

    nivel: 0, // Aqui, diz respeito ao nível. Ele começa no nível 0, pois ainda não houve rodadas
    sequenciaComputador: [], // aqui é onde fica guardada a sequência que será gerada pelo computador
    sequenciaJogador: [], //  Esse array guardará as cores jogadas pelo usuário
    turnoDoJogador: false, // Essa parte é um booleano, ele basicamente irá dizer se é o turno do computador, ou se é a vez do jogador jogar
    fimDeJogo: true, //  Esse é também um booleano que irá dizer se o jogo está parado ou em andamento
});


const proximoPassoDaSequencia = sequencia => { // Essa daqui é uma função arrow e seu objetivo é, basicamente, adicionar uma nova cor a sequência
  const cores = ['green', 'red', 'yellow', 'blue'] // Aqui, a gente define as cores que poderão ser usadas
  const corAleatoria = cores[Math.floor(Math.random() * cores.length)] // // Aqui a gente gera um numero entre 0 e 1 com o Math.random. Multiplicamos pelo valor da lista
    // anterior, o cores.lenght - que é 4 -  será multiplicado pelo numero decimal, gerará um outro número e será arrendodado pelo Math.floor, que converterá para um inteiro
    // de 0 a 3, pois ele sempre arredonda pra baixo
  return [...sequencia, corAleatoria]
    // Aqui, por fim, temos o retorno dessa função, que basicamente cria a cópia do array original, sem alterá-lo, e adiciona uma nova cor. Ou seja, é gerado um novo
    // array, que garante a imutabilidade
}

// recebe o estado atual do jogo como parâmetro
// verifica se a última jogada do jogador foi correta
const verificarJogada = estado => {
  const { sequenciaComputador, sequenciaJogador } = estado //  Essa parte aqui é basicamente pra pegar duas características do objeto estado pra evitar ter de repetir: estado.sequenciacomputador, por exemplo
    
  const indiceUltimaJogada = sequenciaJogador.length - 1 // Aqui, basicamente, temos a sequencia que o jogador já clicou aliado ao -1, pois os arrays começam em 0

  if sequenciaJogador[indiceUltimaJogada] !== sequenciaComputador[indiceUltimaJogada] {
    return 'incorreta'
  }
    // Temos aqui o teste para o 'gameover'. Essa condição compara  a cor que o jogador acabou de clicar com o a da sequência do computador, se for diferente 'bye bye'
  
  if sequenciaJogador.length === sequenciaComputador.length {
    return 'completa' // Essa condição diz compara se a quantidade que o jogador clicou é igual a do computador
  }
  return 'correta' // Aqui, se tudo estiver na ordem correta
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
