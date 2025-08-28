
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

//objeto handlers guarda as ações possiveis do jogo
//cada chave é o nome de um evento(iniciar_jogo, turno_computador, turno_jogador,jogada_jogador)
//cada valor associado é uma função que retorna que retorna o estado atualizado do jogo.

const handlers = {
  INICIAR_JOGO: () => [0, [], [], false, false],
//°iniciar_jogo serve para resetar o estado atualizado e iniciar uma nova partida
//começa o jogo no nivel 0, os arrays vazios se referem a sequencia do computador e e a sequencia do jogador
  //turno_jogador= false, não é a vez do jogador ainda
    //fimjogo = false, o jogo não acabou
    
    TURNO_COMPUTADOR: ([nivel, seqComp, , , fimJogo]) => [
        //recebe o estado atual do jogo
        //retorna um novo estado
        
    nivel + 1, //aumenta o nivel porque o computador vai adicionar mais um passo
        
    proximoPassoDaSequencia(seqComp), //gera uma nova sequencia para o computador (add uma cor, por exemplo)
    [], // zera a sequencia do jogador (ele ainda nao jogou)
    false, // ainda nao é a vez do jogador
    fimJogo //mantém o estado de fim de jogo como estava
  ], //°Essa função representa a vez do computador, aumentando a dificuldade,
    // adicionando um passo a sequencia e prepara para o jogador responder

  TURNO_JOGADOR: ([nivel, seqComp, seqJog, , fimJogo]) => [
    nivel, //mantem o mesmo nivel
    seqComp, //mantem a mesma sequencia do computador
    seqJog, //mantem a mesma sequencia do jogador
    true, // agora é a vez do jogador
    fimJogo //mantem o fim do jogo
  ], //°Turno_jogador sinaliza que o computador terminou e o jogador deve repetir a sequencia.

  JOGADA_JOGADOR: ([nivel, seqComp, seqJog, , fimJogo], { payload }) => {
      //recebe o estado e um payload, o clique do jogador
    const novaSeqJog = [...seqJog, payload.cor]; //cria uma nova sequencia, adicionando a cor escolhida pelo jogador
    const resultado = verificarJogada(seqComp, novaSeqJog); //compara se a jogada está correta

    return resultado === "incorreta" //se o jogador errou
      ? [nivel, seqComp, novaSeqJog, false, true]
      : resultado === "completa" //se ele acertou parcialmente
      ? [nivel, seqComp, novaSeqJog, false, fimJogo] //se completou a sequencia, o jogo continua
      : [nivel, seqComp, novaSeqJog, true, fimJogo]; //se o jogo acabou
  }// Aqui o jogador faz uma jogada, e o codigo verifica se errou ou acertou.
};

const jogoReducer = (estado, acao) => //A função recebe, estado: array com, nivel,seqcomp, seqjog, turnojog, fimjogo.
    //ação: objeto que tem tipo,payload
  (handlers[acao.tipo] || ((s) => s))(estado, acao);
 //pega a função correspondente à ação que chegou
// caso não exista uma função para esse ação.tipo, ele usa umaa °função fallback
//(s)=>s , que retorna o estado do jeito que recebeu, evitando erro caso apareça uma ação inválida
//decide qual transformação aplicar no estado do jogo com base na ação recebida

// DOM
//objeto de referencia das cores dos botoes
const botoesDeCores = {
    green: document.getElementById('green'),
    red: document.getElementById('red'),
    yellow: document.getElementById('yellow'),
    blue: document.getElementById('blue')
}
//botao de iniciar e exibição de nivel
//botao que inicia o jogo
const botaoIniciar = document.getElementById('start-btn')
//lugar no HTML onde mostra o numero do nivel atual
const exibicaoNivel = document.getElementById('level')

//Cria uma função que espera x milissegundos antes de continuar
//Usa Promise e setTimeuot para controlar o tempo entre os efeitos de piscar os botões.
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms))
// Recebe uma cor e faz o botão piscar
const piscarBotaoDeCor = async (cor) => {
    const botao = botoesDeCores[cor] //pega o botao da cor escolhida
    botao.classList.add('lit') // adiciona a classe css "lit", faz o botao acender
    await esperar(400) //espera 400ms com o botao aceso
    botao.classList.remove('lit') //apaga a luz
    await esperar(200) //espera mais 200ms antes de terminar
} //Isso cria um efeito visual de "piscar"

//Essa função faz os botoes piscarem em sequencia, um após o outro.
//sequencia é um array com as cores que devem piscar
const tocarSequencia = (sequencia) => {
    return sequencia.reduce((promessa, cor) => { //reduce é usado aqui para criar uma cadeia de °promises (garantindo que um botao pisque apos o outro).
        return promessa.then(() => piscarBotaoDeCor(cor));
    }, Promise.resolve()); //ponto de partida da cadeia, promessa resolvida de imediato
}; //Essa funçao toca a sequencia do jogo, que o jogador deve repetir

//Essa função lê o estado do jogo e atualiza elemntos do DOM
const atualizarInterface = (estado) => { //declara a função que vai receber o estado do jogo
    const [nivel, , , turnoJog, fimJogo] = estado //pega o elem que mostra o nivel do DOM
    exibicaoNivel.textContent = nivel //desabilita/ativa o botao iniciar de acordo com o jogo
    botaoIniciar.disabled = !fimJogo //seleciona o container do tabuleiro
    const container = document.querySelector('.genius-board') //permite ou impede cliques dentro do container (se é a vez do jogador
    container.style.pointerEvents = turnoJog ? 'auto' : 'none'  //se o jogo acabou e houve pelo menos um nivel, mostra a mensagem de fim
    if (fimJogo && nivel > 0) { //verifica se o jogo acabou e se houve pelo menos um nivel
        exibicaoNivel.textContent = `Fim! Nível ${nivel}` //substitui o texto de nivel por uma mensagem de fim
    }
}


// essa função aqui é pra esperar o jogador clicar em um botão
// ela fica de olho nos cliques, quando o caba clica em uma cor
// ela para de escutar os outros e devolve a cor que ele apertou

const aguardarCliqueDoJogador = () => {
    return new Promise(resolve => { //só termina quando o jogador clicar em um botao
        const botoes = Object.values(botoesDeCores); //Cria um array com todos os botoes de cores

        const listener = (evento) => { //função ouvinte, sera chamada quando o jogador clicar em um botao
            const corClicada = evento.target.id; //pega o id do botao clicado (a cor escolhida pelo jogador)

            botoes.map(botao => botao.removeEventListener('click', listener)); //remove os eventos de cliques dos botoes, evitando cliques indesejaveis.
            resolve(corClicada); //finaliza a promise, chamando resolve, enviando a cor clicada de volta para quem chamou a função.
        };
         botoes.map(botao => botao.addEventListener('click', listener)); //adiciona a função de clique "listener" a todos os botoes.
    }); 
};


//Espera o jogador clicar em uma cor, atualiza o estado do jogo com essa jogada.
//Atualiza a interface
//Decide se o jogo acabou, se continua no jogador ou passa para outro turno.
const loopTurnoJogador = estado =>
  aguardarCliqueDoJogador() //Espera o clique do jogador
    .then(corClicada => { //quando o jogador clicar, recebe a corclicada
      const novoEstado = jogoReducer(estado, { tipo: 'JOGADA_JOGADOR', payload: { cor: corClicada } }); //Usa jogoreducer para atualizar o estado do jogo
        //estado: estado atual do jogo
        //tipo: Ação que diz qual cor o jogador escolheu
      atualizarInterface(novoEstado); //atualiza a interface gráfica com o novo estado
      return novoEstado; // retorna o novo estado
    })
    .then(novoEstado => { //continua o fluxo recebendo o novo estado
      if (novoEstado[FIM_JOGO]) return; //se o estado indicar que o jogo acabou (FIM_JOGO), ele para e não continua.
      return novoEstado[TURNO_JOG] //caso contrario, verifica quem é o turno
        ? loopTurnoJogador(novoEstado) //loopTurnojogador é chamada de volta de forma recursiva se ainda for o turno do jogador e ele joga novamente
        : loopDoJogo(novoEstado); //se não for o turno do jogador loopDojogo é chamada (o turno da maquina).
    });

//o computador mostra a sequencia passa para o jogador e aguarda cliques
const loopDoJogo = estado => {

    return esperar(1000) //chama esperar pausando o fluxo por 1 segundo. cria um atras antes do computador jogar (efeito visual e logico)
        .then(() => jogoReducer(estado, { tipo: 'TURNO_COMPUTADOR' })) //depois da espera atualiza o estado para indicar que agora é o turno do computador
        .then(estadoComputador => { //recebe o estado do computador atualizado
            atualizarInterface(estadoComputador); //atualiza a interface gráfica com esse estado
            return tocarSequencia(estadoComputador[SEQ_COMP]).then(() => estadoComputador); //chama tocarsequencia, que mostra a sequencia de cores que o jogador deve repetir
        }) //quando terminar a sequencia, retorna o mesmo estado do computador
        .then(estadoComputador => jogoReducer(estadoComputador, { tipo: 'TURNO_JOGADOR' })) //atualiza o estado de novo, agora mudando para o turno do jogador
        
        .then(estadoJogador => { //recebe o estado do jogador
            atualizarInterface(estadoJogador); // ATUALIZA A TELA PARA ATIVAR OS BOTÕES
            return estadoJogador; // Passa o estado adiante
        })
        .then(loopTurnoJogador); // Agora sim começa o turno do jogador
};
//prepara o jogo antes de começar
const configuracaoInicial = () => {
    atualizarInterface(criarEstadoInicial()); //cria o estado inicial e atualiza a interface para mostrar esse estado
    botaoIniciar.addEventListener('click', () => { // adiciona um evento de clique no botao iniciar
        const estadoInicial = jogoReducer(criarEstadoInicial(), { tipo: 'INICIAR_JOGO' }); //quando clicado, cria um novo estado inicial, só que usando jogoReducer
        // com a ação INICIAR_JOGO ( ou seja, o jogo começa).
        loopDoJogo(estadoInicial); //começa o ciclo do jogo
    });
};

configuracaoInicial();// assim que o script carrega a função configuraçãoInicial é executada
//Assim a interface inicial do jogo é configurada automaticamente
