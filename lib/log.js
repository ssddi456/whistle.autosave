const fs = require('fs');
const path = require('path');
const util = require('util');

// a logger that writes all arguments to a file stream, and rotates the file when it reaches a certain size
/** @type {fs.WriteStream} */
let stream = null;
const MAX_SIZE = 1024 * 1024 * 10;
let size = (() => {
    try {
        return fs.statSync(path.resolve(__dirname, '../log.txt')).size;
    } catch (e) {
        return 0;
    }
})();
stream = fs.createWriteStream(path.resolve(__dirname, '../log.txt'), { flags: 'w' });
stream.write(`plugin start at ${new Date().toLocaleString()}\n`);
module.exports = function () {
    // return;
    const args = Array.prototype.slice.call(arguments);
    try {
        const text = (new Date().toLocaleString()) + args.map((arg) => {
            if (typeof arg === 'string') {
                return arg;
            }
            return util.inspect(arg, true, 4, false);
        }).join(' ') + '\n';
        stream.write(text);
        size += text.length;
        // if (size >= MAX_SIZE) {
        //     stream.close();
        //     fs.renameSync(path.resolve(__dirname, '../log.txt'), path.resolve(__dirname, `../log.txt.${Date.now()}`));
        //     stream = fs.createWriteStream(path.resolve(__dirname, '../log.txt'), { flags: 'a' });
        //     size = 0;
        // }
    } catch (e) {}
};
