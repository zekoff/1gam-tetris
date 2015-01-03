var Phaser = Phaser || {};
var Tetris = Tetris || {};
var _ = _ || {};
var Tetrad = Tetris.Tetrad;

Tetris.COLUMNS = 10;
Tetris.ROWS = 18;
Tetris.TILE_SIZE = 33; // pixels square
Tetris.tickLength = 990; // milliseconds
Tetris.field = [];
Tetris.counter = 0; // milliseconds
Tetris.renderBlocks = [];

var game = new Phaser.Game(Tetris.COLUMNS * Tetris.TILE_SIZE + 4 * Tetris.TILE_SIZE + 5 + 5 + 5,
    Tetris.ROWS * Tetris.TILE_SIZE, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    }, true);

function preload() {
    game.load.image('block', 'block.png');
    game.load.image('block_next', 'block_white.png');
}

function create() {
    for (var i = 0; i < Tetris.ROWS; i++) {
        var row = [];
        for (var j = 0; j < Tetris.COLUMNS; j++)
            row.push(0);
        Tetris.field.push(row);
    }
    Tetris.activeTetrad = new Tetrad().createRandom();
    Tetris.nextTetrad = new Tetrad().createRandom();
    var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(function() {
        var copy = Tetris.activeTetrad.clone();
        copy.x -= 1;
        if (!checkCollision(copy))
            Tetris.activeTetrad.x -= 1;
    });
    var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(function() {
        var copy = Tetris.activeTetrad.clone();
        copy.x += 1;
        if (!checkCollision(copy))
            Tetris.activeTetrad.x += 1;
    });
    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function() {
        var copy = Tetris.activeTetrad.clone().rotateRight();
        if (!checkCollision(copy))
            Tetris.activeTetrad.rotateRight();
    });
    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(function() {
        processTick();
    });
}

function update() {
    Tetris.counter += game.time.elapsed;
    if (Tetris.counter > Tetris.tickLength)
        processTick();
    render();
}

function render() {
    Tetris.renderBlocks.forEach(function(element) {
        element.destroy();
    });
    Tetris.renderBlocks = [];
    for (var row = 0; row < 4; row++)
        for (var col = 0; col < 4; col++)
            if (Tetris.activeTetrad.matrix[row][col])
                Tetris.renderBlocks.push(game.add.image((col + Tetris.activeTetrad.x) * Tetris.TILE_SIZE + 5, (row + Tetris.activeTetrad.y) * Tetris.TILE_SIZE, 'block'));
    for (var fieldRow = 0; fieldRow < Tetris.ROWS; fieldRow++)
        for (var fieldCol = 0; fieldCol < Tetris.COLUMNS; fieldCol++)
            if (Tetris.field[fieldRow][fieldCol])
                Tetris.renderBlocks.push(game.add.image(fieldCol * Tetris.TILE_SIZE + 5, fieldRow * Tetris.TILE_SIZE, 'block'));
    var offset = Tetris.COLUMNS * Tetris.TILE_SIZE + 15;
    for (var nextRow = 0; nextRow < 4; nextRow++)
        for (var nextCol = 0; nextCol < 4; nextCol++)
            if (Tetris.nextTetrad.matrix[nextRow][nextCol])
                Tetris.renderBlocks.push(game.add.image(offset + Tetris.TILE_SIZE * nextCol, Tetris.TILE_SIZE * nextRow + 5, 'block_next'));
}

function processTick() {
    Tetris.counter = 0;
    var copy = Tetris.activeTetrad.clone();
    copy.y += 1;
    if (!checkCollision(copy))
        Tetris.activeTetrad.y += 1;
    else {
        for (var row = 0; row < 4; row++)
            for (var col = 0; col < 4; col++)
                if (Tetris.activeTetrad.x + col < 10 && Tetris.activeTetrad.matrix[row][col])
                    Tetris.field[row + Tetris.activeTetrad.y][col + Tetris.activeTetrad.x] = 1;
        Tetris.activeTetrad = Tetris.nextTetrad;
        Tetris.nextTetrad = new Tetrad().createRandom();
    }
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
                Tetris.field[i] = _.cloneDeep(Tetris.field[i - 1]);
            }
            Tetris.field[0] = emptyRow;
        }
    }
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