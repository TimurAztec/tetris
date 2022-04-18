function randNum(max, min = 1) {
    return Math.floor(Math.random() * max) + min
}

function colorize(color, output) {
    return ['\033[', color, 'm', output, '\033[0m'].join('');
}

function iterateTwoDimArray(array, callback) {
    for (let [rowIndex, row] of array.entries()) {
        for (let [tileIndex, tile] of row.entries()) {
            callback({row, rowIndex, tile, tileIndex});
        }
    }
}

module.exports = { randNum, colorize, iterateTwoDimArray }