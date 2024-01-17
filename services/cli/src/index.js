const inquirer = require('inquirer');
const actions = require('./actions/index.js');

const immediatelyThrow = e => setImmediate(() => { throw e; });

process.on('unhandledRejection', immediatelyThrow);

(async () => {
  const { action } = await inquirer.prompt([
    {
      name: 'action',
      message: 'What action would you like to run?',
      type: 'list',
      choices: Object.keys(actions),
    },
  ]);

  await actions[action]();
})().catch(immediatelyThrow);
