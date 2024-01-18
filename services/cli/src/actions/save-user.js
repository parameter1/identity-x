const inquirer = require('inquirer');
const { applicationService } = require('@identity-x/service-clients');

const { log } = console;

module.exports = async () => {
  const { email, applicationId } = await inquirer.prompt([
    {
      name: 'applicationId',
      message: 'Which application id?',
      type: 'input',
      default: '6449537d36197792dcb5e367',
    },
    {
      name: 'email',
      message: 'What user would you like to modify?',
      type: 'input',
      default: 'josh@parameter1.com',
    },
  ]);

  const user = await applicationService.request('user.findByEmail', {
    applicationId,
    email,
  });

  await applicationService.request('user.setLastSeen', {
    id: user._id,
  });
  log('user updated!');
};
