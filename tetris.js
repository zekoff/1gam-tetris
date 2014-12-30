var Phaser = Phaser || {};
var Tetris = Tetris || {};
var _ = _ || {};

function Tetrad() {
    this.anchor = {
        "x": 1,
        "y": 1
    };
    this.matrix = []; // 2D matrix, access by [row][column]
    for (var i = 0; i < 4; i++) this.matrix.push([0, 0, 0, 0]);
    this.createRandom = function() {
        this.matrix = []; // 2D matrix, access by [row][column]
        for (var i = 0; i < 4; i++) this.matrix.push([0, 0, 0, 0]);
        switch (_.random(6)) {
            case 0:
                /*
                0 0 0 0
                1 1 0 0
                1 0 0 0
                1 0 0 0
                */
                this.matrix[1][0] = 1;
                this.matrix[1][1] = 1;
                this.matrix[2][0] = 1;
                this.matrix[3][0] = 1;
                break;
            case 1:
                /*
                0 0 0 0
                1 1 0 0
                0 1 0 0
                0 1 0 0
                */
                this.matrix[1][0] = 1;
                this.matrix[1][1] = 1;
                this.matrix[2][1] = 1;
                this.matrix[3][1] = 1;
                break;
            case 2:
                /*
                1 0 0 0
                1 0 0 0
                1 0 0 0
                1 0 0 0
                */
                this.matrix[0][0] = 1;
                this.matrix[1][0] = 1;
                this.matrix[2][0] = 1;
                this.matrix[3][0] = 1;
                break;
            case 3:
                /*
                0 0 0 0
                0 1 0 0
                1 1 0 0
                1 0 0 0
                */
                this.matrix[1][1] = 1;
                this.matrix[2][0] = 1;
                this.matrix[2][1] = 1;
                this.matrix[3][0] = 1;
                break;
            case 4:
                /*
                0 0 0 0
                1 0 0 0
                1 1 0 0
                0 1 0 0
                */
                this.matrix[1][0] = 1;
                this.matrix[2][0] = 1;
                this.matrix[2][1] = 1;
                this.matrix[3][1] = 1;
                break;
            case 5:
                /*
                0 0 0 0
                0 0 0 0
                1 1 0 0
                1 1 0 0
                */
                this.matrix[2][0] = 1;
                this.matrix[2][1] = 1;
                this.matrix[3][0] = 1;
                this.matrix[3][1] = 1;
                break;
            case 6:
                /*
                0 0 0 0
                0 0 0 0
                0 1 0 0
                1 1 1 0
                */
                this.matrix[2][1] = 1;
                this.matrix[3][0] = 1;
                this.matrix[3][1] = 1;
                this.matrix[3][2] = 1;
                break;
        }
    };
    this.prettyLog = function() {
        for (var row = 0; row < 4; row++) {
            var line = "";
            for (var col = 0; col < 4; col++) {
                if (this.matrix[row][col]) line += "X ";
                else line += "  ";
            }
            console.log(line);
        }
    };
    this.rotateRight = function() {
        // rotate outer layer
        for (var i = 0; i < 3; i++) {
            // save top row
            var temp = this.matrix[0][i];
            // left column to top row
            this.matrix[0][i] = this.matrix[3-i][0];
            // bottom row to left column
            this.matrix[3-i][0] = this.matrix[3][3-i];
            // right column to bottom row
            this.matrix[3][3-i] = this.matrix[i][3];
            // top row (temp) to right columm
            this.matrix[i][3] = temp;
        }
        // rotate inner layer
        var innerTemp = this.matrix[1][1];
        this.matrix[1][1] = this.matrix[2][1];
        this.matrix[2][1] = this.matrix[2][2];
        this.matrix[2][2] = this.matrix[1][2];
        this.matrix[1][2] = innerTemp;
        // fill bottom rows
        while (_.isEqual(this.matrix[3],[0,0,0,0])) {
            for (var i = 2; i >= 0; i--) this.matrix[i+1] = this.matrix[i];
            this.matrix[0] = [0,0,0,0];
        }
    };
    this.rotateLeft = function() {
        for (var i = 0; i < 3; i++) this.rotateRight();
    };
}

Tetris.COLUMNS = 10;
Tetris.ROWS = 18;
Tetris.TILE_SIZE = 32; // pixels square
Tetris.tickLength = 1000; // milliseconds
var game = new Phaser.Game(Tetris.COLUMNS * Tetris.TILE_SIZE,
    Tetris.ROWS * Tetris.TILE_SIZE, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    }, true);
var actionQueue = [];
var counter = 0; // milliseconds

function preload() {
    game.load.image('block', 'block.png');
}

function create() {
    Tetris.activeTetrad = game.add.sprite(0, 0, 'block');
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