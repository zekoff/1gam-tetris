var Phaser = Phaser || {};
var Tetris = Tetris || {};

Tetris.COLUMNS = 10;
Tetris.ROWS = 18;
Tetris.TILE_SIZE = 32; // pixels square
Tetris.tickLength = 1000; // milliseconds
var game = new Phaser.Game(Tetris.COLUMNS * Tetris.TILE_SIZE,
    Tetris.ROWS * Tetris.TILE_SIZE, Phaser.AUTO, '',
    { preload: preload, create: create, update: update }, true);
var actionQueue = [];
var counter = 0; // milliseconds

function preload() {
    game.load.image('block','block.png');
}

function create() {
    Tetris.activeTetrad = game.add.sprite(0,0,'block');
    var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(function() {
        actionQueue.push(function() {
            Tetris.activeTetrad.x -= Tetris.TILE_SIZE;
        });
    });
    var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(function() {
        actionQueue.push(function() {
            Tetris.activeTetrad.x += Tetris.TILE_SIZE;
        });
    });
    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function() {
        actionQueue.push(function() {
            // rotate tetrad
        });
    });
    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(function() {
        actionQueue.push(function() {
            // drop tetrad 
        });
    });
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
        Tetris.activeTetrad.y += Tetris.TILE_SIZE;
    });
}