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
    for (var i = 1; i < 7; i++)
        game.load.image('block' + i, 'blocks/block' + i + '.png');
    game.load.image('splash', 'splash.png');
    var moveLeft = function() {
        Tetris.actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone();
            copy.x -= 1;
            if (!checkCollision(copy))
                Tetris.activeTetrad.x -= 1;
        });
    };
    var moveRight = function() {
        Tetris.actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone();
            copy.x += 1;
            if (!checkCollision(copy))
                Tetris.activeTetrad.x += 1;
        });
    };
    var inputRotate = function() {
        Tetris.actionQueue.push(function() {
            var copy = Tetris.activeTetrad.clone().rotateRight();
            if (!checkCollision(copy))
                Tetris.activeTetrad.rotateRight();
            else {
                copy.x--;
                if (!checkCollision(copy)) {
                    Tetris.activeTetrad.x--;
                    Tetris.activeTetrad.rotateRight();
                }
            }
        });
    };
    var inputDrop = function() {
        Tetris.actionQueue.push(function() {
            Tetris.score++;
            Tetris.counter = Tetris.tickLength + 1;
        });
    };
    game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(moveLeft);
    game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(moveRight);
    game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(inputRotate);
    game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(inputDrop);
    Tetris.gameOverMask = game.add.bitmapData(game.width, game.height);
    Tetris.gameOverMask.fill(0xFF, 0xBB, 0xBB, 0.7);
    Tetris.gameboyMask = game.add.bitmapData(game.width, game.height);
    Tetris.gameboyMask.fill(0x70, 0xCC, 0x70, 0.3);
    Tetris.GUTTER_WIDTH = 5;
    Tetris.gutterTexture = game.add.bitmapData(Tetris.GUTTER_WIDTH, game.height);
    Tetris.gutterTexture.fill(0, 0, 0, 1);
    game.add.image(0, 0, Tetris.gutterTexture);
    game.add.image(Tetris.TILE_SIZE * Tetris.COLUMNS + Tetris.GUTTER_WIDTH, 0, Tetris.gutterTexture);

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
    Tetris.gameOverCounter = 0;
    Tetris.renderBlocks = [];
    Tetris.actionQueue = [];
    Tetris.gameState = 1; // 0 = normal, 1 = splashscreen, 2 = game over
    Tetris.gameboyImage = game.add.image(0, 0, Tetris.gameboyImage);
    Tetris.linesCompleted = 0;
    Tetris.score = 0;
    Tetris.textStyle = {
        'font': '20px monospace',
        'fill': '#000000',
        'align': 'center'
    };
    Tetris.nextText = game.add.text(0, 0, '', Tetris.textStyle);
    Tetris.scoreText = game.add.text(0, 0, '', Tetris.textStyle);
    Tetris.linesText = game.add.text(0, 0, '', Tetris.textStyle);
    Tetris.splashImage = game.add.image(0, 0, 'splash');
    Tetris.splashCounter = 0;
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
            Tetris.splashImage.destroy();
            Tetris.splashImage = null;
            Tetris.splashCounter += game.time.elapsed;
            if (Tetris.splashCounter > 2000) Tetris.gameState = 0;
            else Tetris.splashImage = game.add.image(0, 0, 'splash');
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
    Tetris.nextText.destroy();
    Tetris.linesText.destroy();
    Tetris.scoreText.destroy();
    Tetris.gameboyImage.destroy();
    Tetris.renderBlocks.forEach(function(element) {
        element.destroy();
    });
    Tetris.renderBlocks = [];
    for (var row = 0; row < 4; row++)
        for (var col = 0; col < 4; col++)
            if (Tetris.activeTetrad.matrix[row][col])
                Tetris.renderBlocks.push(game.add.image((col + Tetris.activeTetrad.x) * Tetris.TILE_SIZE + Tetris.GUTTER_WIDTH, (row + Tetris.activeTetrad.y) * Tetris.TILE_SIZE, Tetris.activeTetrad.block));
    for (var fieldRow = 0; fieldRow < Tetris.ROWS; fieldRow++)
        for (var fieldCol = 0; fieldCol < Tetris.COLUMNS; fieldCol++)
            if (Tetris.field[fieldRow][fieldCol])
                Tetris.renderBlocks.push(game.add.image(fieldCol * Tetris.TILE_SIZE + Tetris.GUTTER_WIDTH, fieldRow * Tetris.TILE_SIZE, Tetris.field[fieldRow][fieldCol]));
    var offset = Tetris.COLUMNS * Tetris.TILE_SIZE + Tetris.GUTTER_WIDTH * 2 + 5;
    for (var nextRow = 0; nextRow < 4; nextRow++)
        for (var nextCol = 0; nextCol < 4; nextCol++)
            if (Tetris.nextTetrad.matrix[nextRow][nextCol])
                Tetris.renderBlocks.push(game.add.image(offset + Tetris.TILE_SIZE * (nextCol + 1) - 5, Tetris.TILE_SIZE * nextRow + 50, Tetris.nextTetrad.block));
    Tetris.renderBlocks.forEach(function(e) {
        e.scale.x = 4;
        e.scale.y = 4;
    });
    var textCenter = (game.width - offset) / 2 + offset;
    Tetris.nextText = game.add.text(textCenter, 20, "Next:", Tetris.textStyle);
    Tetris.nextText.anchor.set(0.5);
    Tetris.linesText = game.add.text(textCenter, 300, "Lines\ncomplete:\n" + Tetris.linesCompleted, Tetris.textStyle);
    Tetris.linesText.anchor.set(0.5);
    Tetris.scoreText = game.add.text(textCenter, 450, "Score:\n" + Tetris.score, Tetris.textStyle);
    Tetris.scoreText.anchor.set(0.5);
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
        Tetris.activeTetrad.x = _.random(Tetris.COLUMNS);
        while (checkCollision(Tetris.activeTetrad))
            Tetris.activeTetrad.x = _.random(Tetris.COLUMNS);
        Tetris.nextTetrad = new Tetrad().createRandom();
        _(_.random(3)).times(function() {
            Tetris.activeTetrad.rotateRight();
        });
        if (checkCollision(Tetris.activeTetrad)) {
            game.add.image(0, 0, Tetris.gameOverMask);
            Tetris.gameState = 2;
        }
    }
    var emptyRow = [];
    _(Tetris.COLUMNS).times(function() {
        emptyRow.push(0);
    });
    var linesCompletedThisDrop = 0;
    for (var row = 0; row < Tetris.ROWS; row++) {
        var allFilled = true;
        for (var f = 0; f < Tetris.COLUMNS; f++)
            if (!Tetris.field[row][f]) allFilled = false;
        if (allFilled) {
            linesCompletedThisDrop++;
            Tetris.linesCompleted++;
            Tetris.tickLength--;
            for (var i = row; i > 0; i--)
                Tetris.field[i] = _.cloneDeep(Tetris.field[i - 1]);
            Tetris.field[0] = emptyRow;
        }
    }
    Tetris.score += linesCompletedThisDrop * linesCompletedThisDrop * 10;
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