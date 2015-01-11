var Phaser = Phaser || {};
var Tetris = Tetris || {};
var _ = _ || {};
var Tetrad = Tetris.Tetrad;

Tetris.COLUMNS = 10;
Tetris.ROWS = 18;
Tetris.TILE_SIZE = 32; // pixels square

function createGameInstance() {
    return new Phaser.Game(Tetris.COLUMNS * Tetris.TILE_SIZE + 4 * Tetris.TILE_SIZE + 5 + 5 + 5,
        Tetris.ROWS * Tetris.TILE_SIZE, Phaser.AUTO, '', {
            preload: preload,
            create: create,
            update: update
        }, true, false);
}

var game = createGameInstance();

function preload() {
    game.load.image('block1', 'blocks/block1.png');
    game.load.image('block2', 'blocks/block2.png');
    game.load.image('block3', 'blocks/block3.png');
    game.load.image('block4', 'blocks/block4.png');
    game.load.image('block5', 'blocks/block5.png');
    game.load.image('block6', 'blocks/block6.png');
    var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(function() {
        Tetris.actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone();
            copy.x -= 1;
            if (!checkCollision(copy))
                Tetris.activeTetrad.x -= 1;
        });
    });
    var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(function() {
        Tetris.actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone();
            copy.x += 1;
            if (!checkCollision(copy))
                Tetris.activeTetrad.x += 1;
        });
    });
    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function() {
        Tetris.actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone().rotateRight();
            if (!checkCollision(copy))
                Tetris.activeTetrad.rotateRight();
        });
    });
    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(function() {
        Tetris.actionQueue.push(function() {
            Tetris.counter = Tetris.tickLength + 1;
        });
    });
    Tetris.flashMask = game.add.bitmapData(game.width, game.height);
    Tetris.flashMask.fill(0xFF, 0xFF, 0xFF, 0.8);
    Tetris.gameOverMask = game.add.bitmapData(game.width, game.height);
    Tetris.gameOverMask.fill(0xFF, 0xBB, 0xBB, 0.7);
    Tetris.gameboyMask = game.add.bitmapData(game.width, game.height);
    Tetris.gameboyMask.fill(0x70, 0xCC, 0x70, 0.3);
}

function create() {
    Tetris.field = [];
    for (var i = 0; i < Tetris.ROWS; i++) {
        var row = [];
        for (var j = 0; j < Tetris.COLUMNS; j++)
            row.push(0);
        Tetris.field.push(row);
    }
    Tetris.tickLength = 800; // milliseconds
    Tetris.activeTetrad = new Tetrad().createRandom();
    Tetris.nextTetrad = new Tetrad().createRandom();
    Tetris.counter = 0; // milliseconds
    Tetris.flashCounter = 0;
    Tetris.flashImage = null;
    Tetris.gameOverCounter = 0;
    Tetris.renderBlocks = [];
    Tetris.actionQueue = [];
    Tetris.gameState = 0; // 0 = normal, 1 = flashing, 2 = game over
    Tetris.gameboyImage = game.add.image(0, 0, Tetris.gameboyImage);
}

function update() {
    switch (Tetris.gameState) {
        case 0:
            Tetris.counter += game.time.elapsed;
            if (Tetris.counter > Tetris.tickLength)
                Tetris.actionQueue.push(function() {
                    processTick();
                });
            Tetris.actionQueue.forEach(function(action) {
                action();
            });
            Tetris.actionQueue = [];
            break;
        case 1:
            Tetris.flashCounter += game.time.elapsed;
            switch (Math.floor(Tetris.flashCounter / 100)) {
                case 0:
                    Tetris.flashImage.tint = 0xFFFFFF;
                    break;
                case 1:
                    Tetris.flashImage.tint = 0x80FF80;
                    break;
                case 2:
                    Tetris.flashImage.tint = 0xFFFFFF;
                    break;
                default:
                    break;
            }
            if (Tetris.flashCounter > 300) {
                Tetris.gameState = 0;
                Tetris.flashImage.destroy();
                Tetris.flashImage = null;
            }
            break;
        case 2:
            Tetris.gameOverCounter += game.time.elapsed;
            if (Tetris.gameOverCounter > 2000) {
                game.destroy();
                game = null;
                game = createGameInstance();
            }
            break;
    }
    render();
}

function render() {
    Tetris.gameboyImage.destroy();
    Tetris.gameboyImage = null;
    Tetris.renderBlocks.forEach(function(element) {
        element.destroy();
    });
    Tetris.renderBlocks = [];
    for (var row = 0; row < 4; row++)
        for (var col = 0; col < 4; col++)
            if (Tetris.activeTetrad.matrix[row][col])
                Tetris.renderBlocks.push(game.add.image((col + Tetris.activeTetrad.x) * Tetris.TILE_SIZE + 5, (row + Tetris.activeTetrad.y) * Tetris.TILE_SIZE, Tetris.activeTetrad.block));
    for (var fieldRow = 0; fieldRow < Tetris.ROWS; fieldRow++)
        for (var fieldCol = 0; fieldCol < Tetris.COLUMNS; fieldCol++)
            if (Tetris.field[fieldRow][fieldCol])
                Tetris.renderBlocks.push(game.add.image(fieldCol * Tetris.TILE_SIZE + 5, fieldRow * Tetris.TILE_SIZE, Tetris.field[fieldRow][fieldCol]));
    var offset = Tetris.COLUMNS * Tetris.TILE_SIZE + 15;
    for (var nextRow = 0; nextRow < 4; nextRow++)
        for (var nextCol = 0; nextCol < 4; nextCol++)
            if (Tetris.nextTetrad.matrix[nextRow][nextCol])
                Tetris.renderBlocks.push(game.add.image(offset + Tetris.TILE_SIZE * nextCol, Tetris.TILE_SIZE * nextRow + 5, Tetris.nextTetrad.block));
    Tetris.renderBlocks.forEach(function(e) {
        e.scale.x = 4;
        e.scale.y = 4;
    });
    Tetris.gameboyImage = game.add.image(0, 0, Tetris.gameboyMask);
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
                    Tetris.field[row + Tetris.activeTetrad.y][col + Tetris.activeTetrad.x] = Tetris.activeTetrad.block;
        Tetris.activeTetrad = Tetris.nextTetrad;
        Tetris.nextTetrad = new Tetrad().createRandom();
        if (checkCollision(Tetris.activeTetrad)) {
            game.add.image(0, 0, Tetris.gameOverMask);
            Tetris.gameState = 2;
        }
    }
    var emptyRow = [];
    _(Tetris.COLUMNS).times(function() {
        emptyRow.push(0);
    });
    for (var row = 0; row < Tetris.ROWS; row++) {
        var allFilled = true;
        for (var f = 0; f < Tetris.COLUMNS; f++)
            if (!Tetris.field[row][f]) allFilled = false;
        if (allFilled) {
            Tetris.tickLength -= 1;
            for (var i = row; i > 0; i--)
                Tetris.field[i] = _.cloneDeep(Tetris.field[i - 1]);
            Tetris.field[0] = emptyRow;
            Tetris.gameState = 1;
            Tetris.flashCounter = 0;
            if (Tetris.flashImage === null) Tetris.flashImage = game.add.image(0, 0, Tetris.flashMask);
        }
    }
}

function checkCollision(testTetrad) {
    if (testTetrad.x < 0 || testTetrad.x >= Tetris.COLUMNS) return true;
    if (testTetrad.y + 3 >= Tetris.ROWS) return true;
    for (var row = 0; row < 4; row++)
        for (var col = 0; col < 4; col++)
            if (testTetrad.matrix[row][col] &&
                (
                    Tetris.field[row + testTetrad.y][col + testTetrad.x] ||
                    testTetrad.x + col >= Tetris.COLUMNS
                )
            )
                return true;
    return false;
}