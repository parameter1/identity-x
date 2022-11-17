const csv2json = require('csv2json');
const fs = require('fs');

module.exports = filename => new Promise(async (resolve, reject) => {
  const strings = [];
  fs.createReadStream(filename)
    .pipe(csv2json({}))
    .on('data', e => strings.push(e.toString()))
    .on('error', reject)
    .on('end', () => resolve(JSON.parse(strings.join(''))));
});
