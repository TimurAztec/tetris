// TODO Refactor this code, separate is to pieces.
// TODO Fix laggy input

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

function randNum(max, min = 1) {
    return Math.floor(Math.random() * max) + min
}

function colorize(color, output) {
    return ['\033[', color, 'm', output, '\033[0m'].join('');
}

const figuresPresets = Object.freeze({
    O: () => {
        const c = randNum(tilesColors.length - 2);
        return [[c, c],
                [c, c]]
    },
    I: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, c, 0, 0],
                [0, c, 0, 0],
                [0, c, 0, 0],
                [0, c, 0, 0]]
    },
    S: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, 0, 0, 0, 0],
                [0, c, 0, 0, 0],
                [0, c, c, 0, 0],
                [0, 0, c, 0, 0],
                [0, 0, 0, 0, 0]]
    },
    Z: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, c, c, 0, 0],
                [0, 0, c, c, 0],
                [0, 0, 0, 0, 0]]
    },
    L: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, c, 0, 0],
                [0, c, 0, 0],
                [0, c, c, 0]]
    },
    J: () => {
        const c = randNum(tilesColors.length - 2);
        return [[0, 0, c, 0],
                [0, 0, c, 0],
                [0, c, c, 0]]
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

function* iterateFigures() {
    let pack = figureVariants;
    for (let i = 0; i < pack.length; i++) {
        yield pack[randNum(pack.length - 1)];
        pack.replace(pack[i], '');
        if (i === pack.length - 1) {
            i = 0;
            pack = figureVariants;
        }
    }
}

function createFigure() {
    return {
        position: {x: randNum(GRID_SIZE.width - 1), y: 0},
        localMap: figuresPresets[figuresIterator.next().value](),
        move: 0,
        turn: false,
        process: function () {
            let shouldDrop = true;
            let shouldMove = true;
            if (this.turn) {
                const turnedMap = this.localMap.map((val, index) => this.localMap.map(row => row[index]).reverse());
                this.turn = false;
                let shouldTurn = true;
                for (let [LM_rowIndex, LM_row] of turnedMap.entries()) {
                    for (let [LM_tileIndex, LM_tile] of LM_row.entries()) {
                        if (turnedMap[LM_rowIndex] && turnedMap[LM_rowIndex][LM_tileIndex]) {
                            if (tileMap[this.position.y + LM_rowIndex]
                                && tileMap[this.position.y + LM_rowIndex][this.position.x + LM_tileIndex]) {
                                shouldTurn = false
                            }
                        }
                    }
                }
                if (shouldTurn) {
                    this.localMap = turnedMap;
                }
            }
            for (let [LM_rowIndex, LM_row] of this.localMap.entries()) {
                for (let [LM_tileIndex, LM_tile] of LM_row.entries()) {
                    if (this.localMap[LM_rowIndex] && this.localMap[LM_rowIndex][LM_tileIndex]) {
                        if ((this.position.y + LM_rowIndex) >= GRID_SIZE.height) {
                            this.position.y -= LM_rowIndex;
                        }
                        if ((this.position.x + LM_tileIndex) >= GRID_SIZE.width) {
                            this.position.x -= LM_tileIndex;
                        }
                        if (tileMap[this.position.y + LM_rowIndex]
                            && tileMap[this.position.y + LM_rowIndex][this.position.x + LM_tileIndex] === 0) {
                            tileMap[this.position.y + LM_rowIndex][this.position.x + LM_tileIndex] =
                                this.localMap[LM_rowIndex][LM_tileIndex];
                        }
                    }
                }
            }
            for (let [LM_rowIndex, LM_row] of this.localMap.entries()) {
                for (let [LM_tileIndex, LM_tile] of LM_row.entries()) {
                    if (this.localMap[LM_rowIndex][LM_tileIndex] &&
                        (!this.localMap[LM_rowIndex + 1] || this.localMap[LM_rowIndex + 1][LM_tileIndex] === 0)) {

                        if (tileMap[this.position.y + LM_rowIndex + 1] &&
                            (tileMap[this.position.y + LM_rowIndex + 1][this.position.x + LM_tileIndex + this.move] === undefined ||
                                tileMap[this.position.y + LM_rowIndex + 1][this.position.x + LM_tileIndex + this.move])) {
                            shouldMove = false;
                        }

                        if (tileMap[this.position.y + LM_rowIndex + 1] === undefined ||
                            tileMap[this.position.y + LM_rowIndex + 1][this.position.x + LM_tileIndex]) {
                            shouldDrop = false;
                        }

                    }
                }
            }
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
    for (let [LM_rowIndex, LM_row] of figuresMap.entries()) {
        for (let [LM_tileIndex, LM_tile] of LM_row.entries()) {
            if (tileMap.length - 1 >= LM_rowIndex &&
                tileMap[tileMap.length - 1].length >= LM_tileIndex) {
                if (tileMap[LM_rowIndex][LM_tileIndex] === 0) {
                    tileMap[LM_rowIndex][LM_tileIndex] =
                        figuresMap[LM_rowIndex][LM_tileIndex];
                }
            }
        }
    }
}

function removeFullLines() {
    for (let [rowIndex, row] of tileMap.entries()) {
        if (row.every((tile) => tile !== 0)) {
            tileMap.splice(rowIndex, 1);
            tileMap.unshift(Array.from({length: GRID_SIZE.width},
                () => {
                    return 0
                }));
            SCORE += 10;
        }
    }
}

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
    if (data === '\u0003') { process.exit(); }
});

updateTileMap();
currentFigure = createFigure();
setInterval(() => {
    if (!GAME_OVER) {
        updateTileMap();
        if (currentFigure) {
            currentFigure.process();
        }
        removeFullLines();
        draw();
    } else {
        console.clear();
        process.stdout.write(colorize(Colors.YELLOW, 'GAME OVER | SCORE: ' + SCORE));
        process.exit(1);
    }
}, 150);