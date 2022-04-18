const { randNum, colorize, iterateTwoDimArray } = require("./utils");
// TODO Refactor this code, separate is to pieces.
// TODO collisions (rare bug)
// TODO separate utils and variables, probably make better color pick
const Colors = {
    BLACK: 30,
    GRAY: 90,
    RED: 31,
    GREEN: 32,
    YELLOW: 33,
    BLUE: 34,
    MAGENTA: 35,
    CYAN: 36,
    WHITE: 37
}
const GRID_SIZE = {
    width: 10,
    height: 24
}
let SCORE = 0;
let GAME_OVER = false;
let tileMap;
let figuresMap;
const tilesColors = [Colors.BLACK, Colors.RED, Colors.GREEN, Colors.YELLOW, Colors.BLUE, Colors.MAGENTA, Colors.CYAN, Colors.WHITE];
const figuresPresets = Object.freeze({
    O: () => {
        const c = randNum(tilesColors.length - 2);
        return [[c, c],
                [c, c]]
    },
    I: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, 0, 0, 0],
                [c, c, c, c],
                [0, 0, 0, 0],
                [0, 0, 0, 0]]
    },
    S: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, c, 0],
                [0, c, c],
                [0, 0, c]]
    },
    Z: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, 0, c],
                [0, c, c],
                [0, c, 0]]
    },
    L: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, c, 0],
                [0, c, 0],
                [0, c, c]]
    },
    J: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, c, 0],
                [0, c, 0],
                [c, c, 0]]
    },
    T: () => {
        const c = randNum(tilesColors.length - 2);
        return [[c, c, c],
                [0, c, 0],
                [0, 0, 0]]
    },
});
const figureVariants = "OISZLJT";
const figuresIterator = iterateFigures()
let currentFigure

// Preudorandom sequence
function* iterateFigures() {
    let pack = "";
    function* iteration() {
        while (true) {
            if (pack.length <= 0) pack = figureVariants;
            let i = randNum(pack.length, 0);
            yield pack[i];
            pack = pack.replace(pack[i], '');
        }
    }
    yield* iteration();
}

// TODO refactor to make less of same code
function createFigure() {
    const localMap = figuresPresets[figuresIterator.next().value]();
    return {
        localMap: localMap,
        position: {x: Math.floor((GRID_SIZE.width/2) - (localMap[0].length/2)), y: 0},
        move: 0,
        turn: false,
        process: function () {
            let shouldDrop = true;
            let shouldMove = true;
            if (this.turn) {
                const turnedMap = this.localMap.map((val, index) => this.localMap.map(row => row[index]).reverse());
                this.turn = false;
                let shouldTurn = true;
                iterateTwoDimArray(turnedMap, (i) => {
                    if (turnedMap[i.rowIndex] && turnedMap[i.rowIndex][i.tileIndex]) {
                        if (tileMap[this.position.y + i.rowIndex]
                            && tileMap[this.position.y + i.rowIndex][this.position.x + i.tileIndex]) {
                            shouldTurn = false
                        }
                    }
                });
                if (shouldTurn) {
                    this.localMap = turnedMap;
                }
            }
            iterateTwoDimArray(this.localMap, (i) => {
                if (this.localMap[i.rowIndex] && this.localMap[i.rowIndex][i.tileIndex]) {
                    if ((this.position.y + i.rowIndex) >= GRID_SIZE.height) {
                        this.position.y -= i.rowIndex + 1;
                    }
                    if ((this.position.x + i.tileIndex) >= GRID_SIZE.width) {
                        this.position.x -= i.tileIndex - 1;
                    }
                    if ((this.position.x + i.tileIndex) < 0) {
                        this.position.x += i.tileIndex + 1;
                    }
                    if (tileMap[this.position.y + i.rowIndex]
                        && tileMap[this.position.y + i.rowIndex][this.position.x + i.tileIndex] === 0) {
                        tileMap[this.position.y + i.rowIndex][this.position.x + i.tileIndex] =
                            this.localMap[i.rowIndex][i.tileIndex];
                    }
                }
            });
            iterateTwoDimArray(this.localMap, (i) => {
                if (this.localMap[i.rowIndex][i.tileIndex]) {

                    if ((this.localMap[i.rowIndex][i.tileIndex + this.move] === 0)
                        &&
                        (tileMap[this.position.y + i.rowIndex][this.position.x + i.tileIndex + this.move] === undefined ||
                        tileMap[this.position.y + i.rowIndex][this.position.x + i.tileIndex + this.move])) {
                        shouldMove = false;
                    }

                    if ((!this.localMap[i.rowIndex + 1] || this.localMap[i.rowIndex + 1][i.tileIndex + this.move] === 0)
                        &&
                        (tileMap[this.position.y + i.rowIndex + 1]) &&
                        (tileMap[this.position.y + i.rowIndex + 1][this.position.x + i.tileIndex + this.move] === undefined ||
                            tileMap[this.position.y + i.rowIndex + 1][this.position.x + i.tileIndex + this.move])) {
                        shouldMove = false;
                    }

                    if ((!this.localMap[i.rowIndex + 1] || this.localMap[i.rowIndex + 1][i.tileIndex] === 0) &&
                        (tileMap[this.position.y + i.rowIndex + 1] === undefined ||
                        tileMap[this.position.y + i.rowIndex + 1][this.position.x + i.tileIndex])) {
                        shouldDrop = false;
                    }

                }
            });
            if (shouldDrop) {
                if (shouldMove) {
                    if (this.move !== 0) {
                        this.position.x += this.move;
                        this.move = 0;
                    }
                }
                this.position.y += 1
            } else {
                figuresMap = tileMap;
                currentFigure = undefined;
                setTimeout(() => {
                    currentFigure = createFigure();
                }, 1000);
                if (this.position.y <= 0) {
                    GAME_OVER = true;
                }
            }
        }
    }
}

// Draws game to terminal
// TODO find the way to change font size in terminal
// TODO redraw only changed parts via ASCI escape codes
function draw() {
    console.clear();
    process.stdout.write(' '.repeat(8) + colorize(Colors.GRAY, '█'.repeat(GRID_SIZE.width + 2) + '\n'));
    for (const row of tileMap) {
        process.stdout.write(' '.repeat(8) + colorize(Colors.GRAY, '█'));
        for (const tile of row) {
            process.stdout.write(colorize(tilesColors[tile], '█'));
        }
        process.stdout.write(colorize(Colors.GRAY, '█\n'));
    }
    process.stdout.write(' '.repeat(8) + colorize(Colors.GRAY, '█'.repeat(GRID_SIZE.width + 2) + '\n'));
    process.stdout.write('\n' + ' '.repeat(8) + colorize(Colors.WHITE, 'SCORE: ' + SCORE));
}

// Saves fallen pieces
function updateTileMap() {
    tileMap = Array.from({length: GRID_SIZE.height},
        () => {
            return Array.from({length: GRID_SIZE.width},
                () => {
                    return 0
                })
        });
    if (!figuresMap) {
        figuresMap = tileMap;
        return;
    }
    iterateTwoDimArray(figuresMap, (i) => {
        if (tileMap.length - 1 >= i.rowIndex &&
            tileMap[tileMap.length - 1].length >= i.tileIndex) {
            if (tileMap[i.rowIndex][i.tileIndex] === 0) {
                tileMap[i.rowIndex][i.tileIndex] =
                    figuresMap[i.rowIndex][i.tileIndex];
            }
        }
    });
}

// Works kinda OK
function removeWhiteLines() {
    let removedRows = 0;
    for (let [rowIndex, row] of [...figuresMap].entries()) {
        if (row.every((tile) => tile === tilesColors.length - 1)) {
            figuresMap.splice(rowIndex, 1);
            figuresMap.unshift(Array.from({length: GRID_SIZE.width},
                () => {
                    return 0
                }));
            removedRows += 1;
        }
    }
    SCORE += (removedRows * GRID_SIZE.width) * (1 + (removedRows * 0.5));
}

function colorFullLines() {
    for (let [rowIndex, row] of [...figuresMap].entries()) {
        if (row.every((tile) => tile !== 0)) {
            for (let [tileIndex] of row.entries()) {
                figuresMap[rowIndex][tileIndex] = tilesColors.length - 1;
            }
        }
    }
}

// TODO Separate into startup module
updateTileMap();
currentFigure = createFigure();
process.stdout.write('\033[?25l');
setInterval(() => {
    if (!GAME_OVER) {
        updateTileMap();
        if (currentFigure) { currentFigure.process(); }
        removeWhiteLines();
        if (!currentFigure) { colorFullLines(); }
        draw();
    } else {
        process.stdout.clearScreenDown(() => {
            process.stdout.write(colorize(Colors.YELLOW, 'GAME OVER | SCORE: ' + SCORE));
            process.stdout.write('\033[?47l');
            process.exit(1);
        });
    }
}, 175);

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
    if (data === '\u001B\u005B\u0043') {
        if (currentFigure) currentFigure.move = 1;
    }
    if (data === '\u001B\u005B\u0044') {
        if (currentFigure) currentFigure.move = -1;
    }
    if (data === '\u0020') {
        if (currentFigure) currentFigure.turn = true;
    }
    if (data === '\u0003') {
        process.exit();
    }
});