// funções puras e helpers
const ler = texto => parseInt(texto, 10) || 0
const formatar = n => String(n)
// helpers específicos (puros)
const inflacionarComFator = (custo, fator) => Math.ceil(custo * fator)
const calcularRecompensa = (nivel, poder) => Math.floor(Math.pow(nivel, 1.25) * Math.pow(poder, 1.25))
// aplica uma função a todos elementos, usando reduce (evita forEach)
const tapAll = (arr, fn) => arr.reduce((_, x) => (fn(x), _), undefined)

// seleção de elementos
const scoreEl = document.getElementById('score')
const btn = document.getElementById('score-btn')
const pontosQEl = document.getElementById('PoderClicker')
const upgradeBtns = [].slice.call(document.querySelectorAll('.upgrade-btn'))
const body = document.body
const oneShotBtn = document.getElementById('upgrade-unico-clique2')
const audioToggleEl = document.getElementById('audio-toggle')

// áudio (UI-level side effects)
const audio = {
	bg: new Audio('audio/Musica de fundo.mp3'),
	click: new Audio('audio/clicker clicker.mp3'),
	buy: new Audio('audio/compra de upgrade.mp3')
}
audio.bg.loop = true; audio.bg.volume = 0.35
audio.click.volume = 0.3
audio.buy.volume = 0.3
const somAtivo = () => body.getAttribute('data-som') === 'on'
const setSom = (on) => { body.setAttribute('data-som', on ? 'on' : 'off'); atualizarBotaoSom() }
const tocar = (snd) => { if (!somAtivo() || !snd) return; try { snd.currentTime = 0; const p = snd.play(); if (p && typeof p.catch === 'function') p.catch(() => {}) } catch {} }
const atualizarBotaoSom = () => {
	if (!audioToggleEl) return
	const on = somAtivo()
	audioToggleEl.textContent = on ? '🔊 Som' : '🔇 Som'
}
// liga toggle de som (requer interação do usuário para tocar música de fundo)
if (audioToggleEl) {
	atualizarBotaoSom()
	audioToggleEl.addEventListener('click', async () => {
		const on = !somAtivo()
		setSom(on)
		if (on) {
			try { await audio.bg.play() } catch {}
		} else {
			try { audio.bg.pause() } catch {}
		}
	})
}

// estado derivado do DOM
const poderClicker = () => ler(pontosQEl.textContent)
const getScore = () => ler(scoreEl.textContent)
const setScore = v => (scoreEl.textContent = formatar(v))
const setPoderClicker = v => (pontosQEl.textContent = formatar(v))
const getBaseClick = () => ler(body.getAttribute('data-base-click') || '1')
const setBaseClick = v => body.setAttribute('data-base-click', String(v))
const creditarRecompensa = v => setScore(getScore() + v)

// custo/inflacao utilities
const getCost = el => ler(el.getAttribute('data-cost') || '0')
const setCost = (el, v) => el.setAttribute('data-cost', String(v))
const inflacionar = custo => inflacionarComFator(custo, 1.25) // +25% por compra
const formatarRotuloUpgrade = (el) => {
	const inc = ler(el.dataset.inc)
	const custo = getCost(el)
	el.setAttribute('aria-label', `Upgrade +${inc} (Custo: ${custo})`)
	el.innerHTML = `
		<span class="upg-inc">+${inc}</span>
		<span class="upg-cost"><span class="cost-label">Custo</span><span class="cost-value">${custo}</span></span>
	`.trim()
}

// atualiza todos os rótulos de upgrade
const atualizarRotulos = () => tapAll(upgradeBtns, formatarRotuloUpgrade)

// inflação global: aplica fator a todos os upgrades para manter mesma razão de preços
const inflacionarGlobal = (fator = 1.25) => { 
	tapAll(upgradeBtns, b => {
		const atual = getCost(b)
		const novo = inflacionarComFator(atual, fator)
		if (novo !== atual) setCost(b, novo)
		formatarRotuloUpgrade(b)
	})
}

// pagar e aplicar upgrade
const tentarComprarUpgrade = (el) => {
	const custo = getCost(el)
	const saldo = getScore()
	if (saldo < custo) return false
	setScore(saldo - custo)
	// aplica incremento ao poder do clicker
	const inc = ler(el.dataset.inc)
	setPoderClicker(poderClicker() + inc)
	// aumenta custo para próxima compra: todos os upgrades sobem na mesma razão (+25%)
	inflacionarGlobal(1.25)
	tocar(audio.buy)
	return true
}

// clique soma base + upgrades atuais
const ganharPonto = () => {
	// clique deve valer exatamente o Poder do Clicker
	const valor = getScore() + poderClicker()
	setScore(valor)
	tocar(audio.click)
}

// liga upgrades com custo (formata via tapAll e usa delegação de eventos no container)
tapAll(upgradeBtns, formatarRotuloUpgrade)
const upgradesContainer = document.querySelector('.upgrades')
if (upgradesContainer) {
	upgradesContainer.addEventListener('click', (e) => {
		const btnEl = e.target.closest('.upgrade-btn')
		if (btnEl) void tentarComprarUpgrade(btnEl)
	})
}

// upgrade único: efeito misterioso (vida extra no Genius por run)
const formatarRotuloOneShot = (el) => {
	const custo = getCost(el)
	el.setAttribute('aria-label', `Upgrade misterioso único (Custo: ${custo})`)
	el.innerHTML = `
		<span class="upg-title">Upgrade misterioso</span>
		<span class="badge">Único</span>
		<span class="upg-cost"><span class="cost-label">Custo</span><span class="cost-value">${custo}</span></span>
	`.trim()
}

if (oneShotBtn) {
	formatarRotuloOneShot(oneShotBtn)
	oneShotBtn.addEventListener('click', () => {
		if (oneShotBtn.disabled) return
		const custo = getCost(oneShotBtn)
		const saldo = getScore()
		if (saldo < custo) return
		setScore(saldo - custo)
	// compra única: apenas marca como adquirido
		body.setAttribute('data-one-shot', 'comprado')
		oneShotBtn.disabled = true
		oneShotBtn.innerHTML = `
			<span class="upg-title">Upgrade misterioso</span>
			<span class="badge">Adquirido</span>
		`.trim()
		oneShotBtn.setAttribute('aria-disabled', 'true')
	tocar(audio.buy)
	})
}

// removido reset e persistência; upgrade só vale durante a sessão

// liga ponto
btn && btn.addEventListener('click', ganharPonto)

// estado inicial do jogo Genius
// const criarEstadoInicial = () => [ ... ] do projeto original, mantendo os mesmos comentários:
const criarEstadoInicialG = () => [
	0,      // nivel  =  começa no nível 0, pois ainda não houve rodadas
	[],     // sequenciaComputador = aqui é onde fica guardada a sequência que será gerada pelo computador
	[],     // sequenciaJogador  =  esse array guardará as cores jogadas pelo usuário
	false,  // turnoDoJogador  = booleano, diz se é turno do jogador ou do computador
	true    // fimDeJogo = booleano que irá dizer se o jogo está parado ou em andamento
]
// Função auxiliar para dar nomes às posições da tupla (para não se perder em índices)
const NIVEL = 0, SEQ_COMP = 1, SEQ_JOG = 2, TURNO_JOG = 3, FIM_JOGO = 4

// Essa daqui é uma função arrow e seu objetivo é, basicamente, adicionar uma nova cor à sequência
const proximoPasso = sequencia => { 
	const cores = ['green', 'red', 'yellow', 'blue'] 
	// Aqui a gente define as cores que poderão ser usadas
	const corAleatoria = cores[Math.floor(Math.random() * cores.length)] 
	// Aqui a gente gera um número entre 0 e 1 com o Math.random. Multiplicamos pelo valor da lista
	// anterior, o cores.length (que é 4). Esse valor será multiplicado pelo número decimal e será arredondado pelo Math.floor,
	// que converterá para um inteiro de 0 a 3, pois ele sempre arredonda pra baixo

	return [...sequencia, corAleatoria]
	// Aqui, por fim, temos o retorno dessa função, que basicamente cria a cópia do array original, sem alterá-lo, e adiciona uma nova cor.
	// Ou seja, é gerado um novo array, que garante a imutabilidade
}

// recebe os arrays do jogo como parâmetros
// verifica se a última jogada do jogador foi correta
const verificarJogada = (sequenciaComputador, sequenciaJogador) => { 
	// ALTERAÇÃO: agora recebe dois arrays
	const indiceUltimaJogada = sequenciaJogador.length - 1 

	if (sequenciaJogador[indiceUltimaJogada] !== sequenciaComputador[indiceUltimaJogada]) {
		return 'incorreta' 
		// Temos aqui o teste para o 'gameover'. Essa condição compara a cor que o jogador acabou de clicar com a da sequência do computador, se for diferente 'bye bye'
	}
    
	if (sequenciaJogador.length === sequenciaComputador.length) {
		return 'completa' 
		// Essa condição compara se a quantidade que o jogador clicou é igual à do computador
	}
    
	return 'correta' // Aqui, se tudo estiver na ordem correta
}
// objeto handlers guarda as ações possíveis do jogo
// cada chave é o nome de um evento (INICIAR, TURNO_COMP, TURNO_JOG, JOGADA)
// cada valor associado é uma função que retorna o estado atualizado do jogo.
const reducerG = (estado, acao) => {
	const h = {
		INICIAR: () => [0, [], [], false, false],
		// °iniciar serve para resetar o estado e iniciar uma nova partida:
		// começa o jogo no nível 0; os arrays vazios se referem à sequência do computador e do jogador;
		// turno_jogador = false (não é a vez do jogador ainda); fimJogo = false (o jogo não acabou)

		TURNO_COMP: ([nivel, seqComp, , , fimJogo]) => [
			// recebe o estado atual do jogo e retorna um novo estado
			nivel + 1, // aumenta o nível porque o computador vai adicionar mais um passo
			proximoPasso(seqComp), // gera uma nova sequência para o computador (add uma cor, por exemplo)
			[], // zera a sequência do jogador (ele ainda não jogou)
			false, // ainda não é a vez do jogador
			fimJogo // mantém o estado de fim de jogo como estava
		], // °Essa função representa a vez do computador, aumentando a dificuldade

		TURNO_JOG: ([nivel, seqComp, seqJog, , fimJogo]) => [
			nivel, // mantém o mesmo nível
			seqComp, // mantém a mesma sequência do computador
			seqJog, // mantém a mesma sequência do jogador
			true, // agora é a vez do jogador
			fimJogo // mantém o fim do jogo
		], // °Turno_jogador sinaliza que o computador terminou e o jogador deve repetir a sequência.

		JOGADA: ([nivel, seqComp, seqJog, , fimJogo], { cor }) => {
			// recebe o estado e um payload (o clique do jogador)
			const novaSeqJog = [...seqJog, cor]; // cria uma nova sequência, adicionando a cor escolhida pelo jogador
			const resultado = verificarJogada(seqComp, novaSeqJog); // compara se a jogada está correta

			return resultado === 'incorreta' // se o jogador errou
				? [nivel, seqComp, novaSeqJog, false, true]
				: resultado === 'completa' // se ele completou a sequência
				? [nivel, seqComp, novaSeqJog, false, fimJogo]
				: [nivel, seqComp, novaSeqJog, true, fimJogo]; // se ainda é a vez do jogador
		} // Aqui o jogador faz uma jogada, e o código verifica se errou ou acertou.
	}
	return (h[acao.tipo] || (s=>s))(estado, acao)
}

const iniciarGeniusNo = (rootEl) => {
	if (!rootEl) return
	const pads = {
		green: rootEl.querySelector('[data-color="green"]'),
		red: rootEl.querySelector('[data-color="red"]'),
		yellow: rootEl.querySelector('[data-color="yellow"]'),
		blue: rootEl.querySelector('[data-color="blue"]')
	}
	const btnStart = rootEl.querySelector('.start-btn')
	const levelEl = rootEl.querySelector('.level')
	// Cria uma função que espera x milissegundos antes de continuar
	// Usa Promise e setTimeout para controlar o tempo entre os efeitos de piscar os botões.
	const esperar = ms => new Promise(r => setTimeout(r, ms))
	// Recebe uma cor e faz o botão piscar
	const piscar = async (cor) => {
		const el = pads[cor] // pega o botão da cor escolhida
		el.classList.add('lit') // adiciona a classe css "lit", faz o botão acender
		await esperar(400) // espera 400ms com o botão aceso
		el.classList.remove('lit') // apaga a luz
		await esperar(200) // espera mais 200ms antes de terminar
	} // Isso cria um efeito visual de "piscar"
	// Essa função faz os botões piscarem em sequência, um após o outro.
	// sequência é um array com as cores que devem piscar
	const tocarSeq = seq => {
		return seq.reduce((promessa, cor) => promessa.then(() => piscar(cor)), Promise.resolve())
	} // reduce é usado aqui para criar uma cadeia de promises (garantindo que um botão pisque após o outro).
	// Essa função lê o estado do jogo e atualiza elementos do DOM
	const atualizarUI = (estado) => {
		const [nivel, , , turnoJog, fim] = estado
		levelEl.textContent = nivel // mostra o nível atual
		btnStart.disabled = !fim // habilita/desabilita o botão iniciar
		rootEl.querySelector('.genius-board').style.pointerEvents = turnoJog ? 'auto' : 'none' // controla cliques
		if (fim && nivel > 0) { // se o jogo acabou e houve pelo menos um nível, mostra a mensagem de fim
			levelEl.textContent = `Fim! Nível ${nivel}`
		}
	}
	// essa função aqui é pra esperar o jogador clicar em um botão
	// ela fica de olho nos cliques, quando o caba clica em uma cor
	// ela para de escutar os outros e devolve a cor que ele apertou
	const aguardarClique = () => new Promise(res => {
		const botoes = Object.values(pads)
		const removeAll = (fn) => botoes.reduce((_, b) => (b.removeEventListener('click', fn), _), 0)
		const addAll = (fn) => botoes.reduce((_, b) => (b.addEventListener('click', fn), _), 0)
		const onClick = (e) => { removeAll(onClick); res(e.target.getAttribute('data-color')) }
		addAll(onClick)
	})
	const atualizarVidas = (vidas) => {
		const span = rootEl.querySelector('#genius-lives-count')
		if (!span) return
		span.textContent = String(vidas)
	}
	// Espera o jogador clicar em uma cor, atualiza o estado do jogo com essa jogada.
	// Atualiza a interface e decide se o jogo acabou, se continua no jogador ou passa para outro turno.
	const loopJog = (estado, vidas) => aguardarClique()
		.then(corClicada => { // quando o jogador clicar, recebe a cor clicada
			const s2 = reducerG(estado, {tipo:'JOGADA', cor: corClicada}); // atualiza o estado com a jogada
			atualizarUI(s2) // atualiza a interface gráfica com o novo estado
			return s2
		})
		.then(async s2 => {
			if (!s2[FIM_JOGO]) return s2[TURNO_JOG] ? loopJog(s2, vidas) : loop(s2, vidas) // decide próximo passo
			// decrementa vidas totais; se ainda houver (v2 > 0), repete a MESMA sequência; senão, fim da run
			const v2 = vidas - 1
			atualizarVidas(v2)
			if (v2 > 0) {
				const sRetry = [s2[NIVEL], s2[SEQ_COMP], [], false, false]
				atualizarUI(sRetry)
				return loop(sRetry, v2)
			}
			// vidas chegou a 0: run terminou -> aplicar recompensa nivel^2 * (poder do clicker)^2 e avisar no navegador
			const nivelFinal = s2[NIVEL]
			const upgrades = poderClicker()
			const recompensaBruta = Math.pow(nivelFinal, 2.5) * Math.pow(upgrades, 1.3)
			const recompensa = Math.floor(recompensaBruta)
			if (recompensa > 0) creditarRecompensa(recompensa)
			try {
				alert(`Run do Genius finalizada!\nNível: ${nivelFinal}\nPoder do Clicker: ${upgrades}\nRecompensa: ${recompensa}`)
			} catch {}
			return undefined
		})
	// o computador mostra a sequência, passa para o jogador e aguarda cliques
	const loop = (estado, vidas) => Promise.resolve()
		.then(()=>esperar(600)) // cria um atraso antes do computador jogar (efeito visual e lógico)
		.then(()=>reducerG(estado, {tipo:'TURNO_COMP'})) // agora é o turno do computador
		.then(estadoComputador => { // recebe o estado do computador atualizado
			atualizarUI(estadoComputador) // atualiza a interface
			return tocarSeq(estadoComputador[SEQ_COMP]).then(()=>estadoComputador) // toca a sequência e devolve o estado
		})
		.then(estadoComputador => reducerG(estadoComputador, {tipo:'TURNO_JOG'})) // muda para o turno do jogador
		.then(estadoJogador => { atualizarUI(estadoJogador); return estadoJogador }) // ativa botões
		.then(estadoJogador => loopJog(estadoJogador, vidas)) // começa o turno do jogador
	// prepara o jogo antes de começar
	const setup = () => {
		atualizarUI(criarEstadoInicialG()) // cria o estado inicial e atualiza a interface para mostrar esse estado
		atualizarVidas(ler(document.getElementById('genius-lives-count')?.textContent || '1'))
		btnStart.addEventListener('click', () => {
			// vidas totais na run: sem upgrade = 1; com upgrade = 2
			const temUpgrade = body.getAttribute('data-one-shot') === 'comprado'
			const vidas0 = temUpgrade ? 2 : 1
			atualizarVidas(vidas0)
			const st = reducerG(criarEstadoInicialG(), {tipo:'INICIAR'}) // começa o jogo
			loop(st, vidas0) // começa o ciclo do jogo
		})
	}
	setup()
}

iniciarGeniusNo(document.getElementById('genius1'))