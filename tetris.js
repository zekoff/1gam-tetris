var Phaser = Phaser || {};
var Tetris = Tetris || {};

Tetris.COLUMNS = 10;
Tetris.ROWS = 18;
Tetris.TILE_SIZE = 32; // square
Tetris.tickLength = 1000;
var game = new Phaser.Game(Tetris.COLUMNS * Tetris.TILE_SIZE,
    Tetris.ROWS * Tetris.TILE_SIZE, Phaser.AUTO, '',
    { preload: preload, create: create, update: update }, true);
var actionQueue = [];
var counter = 0;

function preload() {
    game.load.image('block','block.png');
}

function create() {
    Tetris.activeTetrad = game.add.sprite(0,0,'block');
}

function update() {
    counter += game.time.elapsed;
    if (counter > Tetris.tickLength) {
        counter = 0;
        processTick();
    }
    for (var i = 0; i < actionQueue.length; i++) actionQueue[i]();
    actionQueue = [];
}

function processTick() {
    actionQueue.push(function() {
        Tetris.activeTetrad.y += 32;
    });
}