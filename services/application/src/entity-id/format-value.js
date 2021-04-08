module.exports = (v) => {
  if (!v) return null;
  const str = `${v}`.trim();
  if (!str || str === '_') return null;
  if (/[.*~]/.test(v)) throw new Error('An invalid namespace character was encountered.');
  return v;
};
