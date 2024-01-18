const { applicationService } = require('@identity-x/service-clients');
const { eachSeries } = require('async');

const { log } = console;

module.exports = async () => {
  log('building segments...');
  const segments = await applicationService.request('segment.find', {
    query: { active: true },
  });
  await eachSeries(segments, async (segment) => {
    log(`Generating segment membership for ${segment.applicationId}/${segment.name}.`);
    await applicationService.request('segment.generateMembership', segment);
  });
};
