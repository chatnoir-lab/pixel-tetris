// Configuration du canvas
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scale = 30; // Taille d'un bloc en pixels
const rows = canvas.height / scale;
const columns = canvas.width / scale;

// Couleurs des pièces (pixel art simple)
const colors = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// Formes des pièces (Tetrominoes)
const shapes = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                        // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                        // L
    [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                        // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                        // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                        // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                         // Z
];

// Variables du jeu
let board = createMatrix(columns, rows);
let player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};

// Initialisation
function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    return shapes[type];
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(board, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide()) {
        player.pos.y--;
        merge();
        playerReset();
    }
    draw();
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide()) {
        player.pos.x -= dir;
    }
    draw();
}

function playerRotate() {
    const matrix = player.matrix;
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
    if (collide()) {
        matrix.forEach(row => row.reverse());
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
    }
    draw();
}

function collide() {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (board[y + o.y] === undefined ||
                 board[y + o.y][x + o.x] === undefined ||
                 board[y + o.y][x + o.x] !== 0)) {
                return true;
            }
        }
    }
    return false;
}

function playerReset() {
    player.matrix = createPiece(Math.floor(Math.random() * 6) + 1);
    player.pos.y = 0;
    player.pos.x = Math.floor(columns / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide()) {
        board = createMatrix(columns, rows);
    }
}

// Contrôles clavier
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) playerMove(-1); // Gauche
    if (event.keyCode === 39) playerMove(1);  // Droite
    if (event.keyCode === 40) playerDrop();   // Bas
    if (event.keyCode === 38) playerRotate(); // Haut
});

// Boucle de jeu
function update() {
    playerDrop();
    requestAnimationFrame(update);
}

// Démarrer le jeu
playerReset();
update();
