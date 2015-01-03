var _ = _ || {};
var Tetris = Tetris || {};

Tetris.Tetrad = function() {
    this.x = 0;
    this.y = 0;
    this.block = 'block' + _.random(1,5);
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
};