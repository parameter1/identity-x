const inquirer = require('inquirer');
const { applicationService, membershipService, organizationService } = require('@identity-x/service-clients');

const { log } = console;

module.exports = async () => {
  const {
    email,
    applicationId,
  } = await inquirer.prompt([
    {
      name: 'organizationId',
      message: 'Which organization?',
      type: 'list',
      default: '63e974eb0d243edfbe501e80', // WATT
      choices: async () => {
        log('Loading organizations...');
        const memberships = await membershipService.request('listForUser', { email: 'josh@parameter1.com' });
        const organizations = await Promise.all(memberships.map(
          ({ organizationId }) => organizationService.request('findById', { id: organizationId, fields: ['name'] }),
        ));
        return organizations.map(org => ({ name: org.name, value: `${org._id}` }));
      },
    },
    {
      name: 'applicationId',
      message: 'Which application id?',
      type: 'list',
      default: '6449537d36197792dcb5e367', // All Websites
      choices: async (ans) => {
        const opts = await applicationService.request('listForOrg', { id: ans.organizationId });
        return opts.map(app => ({ name: app.name, value: `${app._id}` }));
      },
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
