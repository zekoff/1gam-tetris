var Phaser = Phaser || {};
var Tetris = Tetris || {};
var _ = _ || {};

function Tetrad() {
    this.x = 0;
    this.y = 0;
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
        return this;
    };
    this.log = function() {
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
            this.matrix[0][i] = this.matrix[3 - i][0];
            // bottom row to left column
            this.matrix[3 - i][0] = this.matrix[3][3 - i];
            // right column to bottom row
            this.matrix[3][3 - i] = this.matrix[i][3];
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
        while (_.isEqual(this.matrix[3], [0, 0, 0, 0])) {
            for (var i = 2; i >= 0; i--) this.matrix[i + 1] = this.matrix[i];
            this.matrix[0] = [0, 0, 0, 0];
        }
        return this;
    };
    this.rotateLeft = function() {
        for (var i = 0; i < 3; i++) this.rotateRight();
        return this;
    };
    this.clone = function() {
        return _.cloneDeep(this);
    };
}

Tetris.COLUMNS = 10;
Tetris.ROWS = 18;
Tetris.TILE_SIZE = 33; // pixels square
Tetris.tickLength = 1000; // milliseconds
Tetris.field = [];
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
    for (var i = 0; i < Tetris.ROWS; i++) {
        var row = [];
        for (var j = 0; j < Tetris.COLUMNS; j++)
            row.push(0);
        Tetris.field.push(row);
    }
    Tetris.activeTetrad = new Tetrad().createRandom();
    var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(function() {
        actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone();
            copy.x -= 1;
            if (!checkCollision(copy))
                Tetris.activeTetrad.x -= 1;
        });
    });
    var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(function() {
        actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone();
            copy.x += 1;
            if (!checkCollision(copy))
                Tetris.activeTetrad.x += 1;
        });
    });
    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function() {
        actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone().rotateRight();
            if (!checkCollision(copy))
                Tetris.activeTetrad.rotateRight();
        });
    });
    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(function() {
        actionQueue.push(function() {
            processTick();
        });
    });
}

var blocks = [];

function update() {
    blocks.forEach(function(element) {
        element.destroy();
    });
    blocks = [];
    counter += game.time.elapsed;
    if (counter > Tetris.tickLength)
        processTick();
    for (var row = 0; row < 4; row++)
        for (var col = 0; col < 4; col++)
            if (Tetris.activeTetrad.matrix[row][col])
                blocks.push(game.add.image((col + Tetris.activeTetrad.x) * Tetris.TILE_SIZE, (row + Tetris.activeTetrad.y) * Tetris.TILE_SIZE, 'block'));
    for (var fieldRow = 0; fieldRow < Tetris.ROWS; fieldRow++)
        for (var fieldCol = 0; fieldCol < Tetris.COLUMNS; fieldCol++)
            if (Tetris.field[fieldRow][fieldCol])
                blocks.push(game.add.image(fieldCol * Tetris.TILE_SIZE, fieldRow * Tetris.TILE_SIZE, 'block'));
    for (var i = 0; i < actionQueue.length; i++) actionQueue[i]();
    actionQueue = [];
}

function processTick() {
    actionQueue.push(function() {
        counter = 0;
        var copy = Tetris.activeTetrad.clone();
        copy.y += 1;
        if (!checkCollision(copy))
            Tetris.activeTetrad.y += 1;
        else {
            for (var row = 0; row < 4; row++)
                for (var col = 0; col < 4; col++)
                    if (Tetris.activeTetrad.x + col < 10)
                        Tetris.field[row + Tetris.activeTetrad.y][col + Tetris.activeTetrad.x] += Tetris.activeTetrad.matrix[row][col];
            Tetris.activeTetrad = new Tetrad().createRandom();
        }
    });
    actionQueue.push(function() {
        var filledRow = [];
        var emptyRow = [];
        _(Tetris.COLUMNS).times(function() {
            filledRow.push(1);
            emptyRow.push(0);
        });
        for (var row = 0; row < Tetris.ROWS; row++) {
            if (_.isEqual(filledRow, Tetris.field[row])) {
                Tetris.tickLength -= 1;
                for (var i = row; i > 0; i--) {
                    Tetris.field[i] = Tetris.field[i - 1];
                }
                Tetris.field[0] = emptyRow;
            }
        }
    });
}

function checkCollision(testTetrad) {
    if (testTetrad.x < 0 || testTetrad.x >= Tetris.COLUMNS) return true;
    if (testTetrad.y + 3 >= Tetris.ROWS) return true;
    for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 4; col++) {
            if (testTetrad.matrix[row][col] &&
                (
                    Tetris.field[row + testTetrad.y][col + testTetrad.x] ||
                    testTetrad.x + col >= Tetris.COLUMNS
                )
            )
                return true;
        }
    }
    return false;
}