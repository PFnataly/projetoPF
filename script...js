document.addEventListener('DOMContentLoaded', function() {
    // Mapeamento de elementos do DOM
    var elements = {
        colorPads: document.querySelectorAll('.color-pad'),
        startButton: document.getElementById('start-btn'),
        levelDisplay: document.getElementById('level'),
        colorMap: {
            green: document.getElementById('green'),
            red: document.getElementById('red'),
            yellow: document.getElementById('yellow'),
            blue: document.getElementById('blue')
        }
    };

    // Variáveis de estado do jogo
    var sequence = [];
    var playerSequence = [];
    var level = 0;
    var isPlayerTurn = false;

    var colors = ['green', 'red', 'yellow', 'blue'];

    /**
     * Inicia um novo jogo ou o próximo nível.
     */
    var nextLevel = function() {
        level++;
        elements.levelDisplay.textContent = level;
        playerSequence = [];
        isPlayerTurn = false;
        elements.startButton.disabled = true;

        // Adiciona uma nova cor à sequência
        var randomColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(randomColor);

        playSequence();
    };

    /**
     * "Acende" um botão de cor.
     * @param {string} color - A cor a ser ativada.
     */
    var activatePad = function(color) {
        var pad = elements.colorMap[color];
        pad.classList.add('lit');
        setTimeout(function() {
            pad.classList.remove('lit');
        }, 500); // Duração que a cor fica acesa
    };

    /**
     * Reproduz a sequência de cores atual para o jogador.
     */
    var playSequence = function() {
        var i = 0;
        var interval = setInterval(function() {
            if (i < sequence.length) {
                activatePad(sequence[i]);
                i++;
            } else {
                clearInterval(interval);
                isPlayerTurn = true; // Agora é a vez do jogador
            }
        }, 1000); // Intervalo entre as cores
    };

    /**
     * Lida com o clique do jogador em um botão de cor.
     * @param {Event} event - O evento de clique.
     */
    var handlePlayerClick = function(event) {
        if (!isPlayerTurn) return;

        var clickedColor = event.target.id;
        playerSequence.push(clickedColor);
        activatePad(clickedColor);

        // Verifica se o clique está correto
        var lastIndex = playerSequence.length - 1;
        if (playerSequence[lastIndex] !== sequence[lastIndex]) {
            gameOver();
            return;
        }

        // Se o jogador completou a sequência, avança para o próximo nível
        if (playerSequence.length === sequence.length) {
            isPlayerTurn = false;
            setTimeout(nextLevel, 1000);
        }
    };

    /**
     * Inicia o jogo a partir do zero.
     */
    var startGame = function() {
        sequence = [];
        level = 0;
        nextLevel();
    };

    /**
     * Finaliza o jogo e reinicia o estado.
     */
    var gameOver = function() {
        alert('Fim de jogo! 😢 Você alcançou o nível ' + level + '.');
        isPlayerTurn = false;
        elements.startButton.disabled = false;
        elements.levelDisplay.textContent = '0';
    };

    // Adiciona os event listeners
    elements.startButton.addEventListener('click', startGame);
    elements.colorPads.forEach(function(pad) {
        pad.addEventListener('click', handlePlayerClick);
    });
});