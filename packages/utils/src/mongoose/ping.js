const mongodb = connection => connection.db.command({ ping: 1 });

module.exports = ({ connection } = {}) => () => mongodb(connection).then(() => 'MongoDB pinged successfully.');
