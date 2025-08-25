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

const jogoReducer = (estado, acao) => {
    switch (acao.tipo) {
        case 'INICIAR_JOGO':
            return { ...criarEstadoInicial(), fimDeJogo: false };
        case 'TURNO_COMPUTADOR':
            return {
                ...estado,
                nivel: estado.nivel + 1,
                sequenciaJogador: [],
                sequenciaComputador: proximoPassoDaSequencia(estado.sequenciaComputador),
                turnoDoJogador: false,
            };
        case 'TURNO_JOGADOR':
            return { ...estado, turnoDoJogador: true };
        case 'JOGADA_JOGADOR': {
            const novaSequenciaJogador = [...estado.sequenciaJogador, acao.payload.cor];
            const resultado = verificarJogada(estado.sequenciaComputador, novaSequenciaJogador);
            if (resultado === 'incorreta') return { ...estado, sequenciaJogador: novaSequenciaJogador, fimDeJogo: true, turnoDoJogador: false };
            if (resultado === 'completa') return { ...estado, sequenciaJogador: novaSequenciaJogador, turnoDoJogador: false };
            return { ...estado, sequenciaJogador: novaSequenciaJogador };
        }
        default:
            return estado;
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



