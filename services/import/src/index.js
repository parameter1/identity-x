const fs = require('fs');
const { join } = require('path');
const inquirer = require('inquirer');
const { applicationService } = require('@identity-x/service-clients');
const parseCSV = require('./parse-csv');
const validate = require('./validate');
const upsert = require('./upsert');
const fixObjectIds = require('./fix-object-ids');

const { log } = console;

process.on('unhandledRejection', (e) => {
  log(e);
  throw e;
});

const findFilesIn = (path, ext = 'csv', arr = []) => {
  const pattern = new RegExp(`.${ext}$`, 'i');
  let found = arr || [];
  fs.readdirSync(path).forEach((file) => {
    const filePath = `${path}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      found = findFilesIn(filePath, ext, found);
    } else if (pattern.test(file)) {
      found.push(join(filePath));
    }
  });
  return found;
};

(async () => {
  const {
    appId,
    file,
    limit,
    errorOnBadAnswer,
    fixObjectIdValues,
  } = await inquirer.prompt([
    {
      type: 'input',
      name: 'orgId',
      message: 'What organization should be imported into?',
      default: '627aa459dfa0e102fdc93122', // SMG
    },
    {
      type: 'list',
      name: 'appId',
      message: 'What application should be imported into?',
      choices: async (ans) => {
        const apps = await applicationService.request('listForOrg', { id: ans.orgId, fields: { name: 1 } });
        return apps.map(app => ({ name: app.name, value: app._id }));
      },
      default: '629bac8439347cfce3861789', // Lab Pulse
    },
    {
      type: 'confirm',
      name: 'fixObjectIdValues',
      message: 'Should existing question/answer values be converted to ObjectIds?',
      default: false,
    },
    {
      type: 'list',
      name: 'file',
      message: 'Which file should be imported?',
      choices: () => {
        const path = join(__dirname, '../data');
        return findFilesIn(path);
      },
    },
    {
      type: 'number',
      name: 'limit',
      message: 'How many users should be created/validated at once?',
      default: 100,
    },
    {
      type: 'confirm',
      name: 'errorOnBadAnswer',
      message: 'Should record be skipped if a bad answer value is found?',
      default: true,
    },
  ]);

  if (fixObjectIdValues) {
    log(`Fixing existing ObjectId values for ${appId}...`);
    await fixObjectIds(appId, limit);
    log('Done!');
    process.exit(0);
  }

  try {
    log(`Importing records from ${file} to ${appId}!`);
    const records = await parseCSV(file);
    const validated = await validate(records, appId, limit, errorOnBadAnswer);
    await upsert(validated, appId, limit);
    log('Import complete!');
  } catch (e) {
    log('Encountered error!', e);
    process.exit(1);
  }
})().catch((e) => { throw e; });
