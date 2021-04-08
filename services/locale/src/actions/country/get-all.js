const countries = require('i18n-iso-countries');
const getEmoji = require('./utils/get-emoji');
const sortByName = require('../../utils/sort-by-name');

const { isArray } = Array;

module.exports = ({
  lang = 'en',
  prioritize = ['US', 'CA'],
  withFlag = true,
}) => {
  // Must clone this data, otherwise deleting keys will remain sticky.
  const data = { ...countries.getNames(lang) };

  const top = (isArray(prioritize) && prioritize.length ? prioritize : [])
    .filter((code) => code)
    .map((code) => code.toUpperCase())
    .reduce((o, code) => {
      const value = data[code];
      if (value) {
        delete data[code];
        return { ...o, [code]: value };
      }
      return o;
    }, {});

  const sorted = Object.keys(data)
    .map((code) => ({ code, name: data[code] }))
    .sort(sortByName)
    .reduce((o, { code, name }) => ({ ...o, [code]: name }), {});

  const ordered = { ...top, ...sorted };
  return Object.keys(ordered).map((code) => {
    const obj = { code, name: ordered[code] };
    if (!withFlag) return obj;
    obj.flag = getEmoji(code);
    return obj;
  });
};
