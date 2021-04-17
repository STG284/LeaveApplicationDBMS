// to enable coloured logging :

const colors = require('colors'); // to enable coloring of console outputs!

const actualError = console.error;
const actualLog = console.log;

console.error = function(...args) {
    actualError(...args.map(a => typeof a === 'string' ? a.yellow.bgRed : a));
};

console.log = function(...args) {
    actualLog(...args.map(a => typeof a === 'string' ? a.blue.bgWhite : a));
};


colors.setTheme({
  info: 'bgGreen',
  help: 'cyan',
  warn: 'yellow',
  success: 'bgBlue',
  error: 'red'
});