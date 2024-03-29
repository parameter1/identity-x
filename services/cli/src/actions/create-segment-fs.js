const { applicationService } = require('@identity-x/service-clients');
const { eachSeries } = require('async');

const { log } = console;
const defaults = { appContextId: '644960504a7ef94021814608', rules: [] };

module.exports = async () => {
  const ps = [
    { ...defaults, name: 'FS - Feed Ingredients' },
    { ...defaults, name: 'FS - Animal Nutrition and Additive Products' },
    { ...defaults, name: 'FS - Formulation Software' },
    { ...defaults, name: 'FS - Batching and Automation Systems' },
    { ...defaults, name: 'FS - Testing and Analysis' },
    { ...defaults, name: 'FS - Operations' },
    { ...defaults, name: 'FS - Manufacturing Equipment' },
    { ...defaults, name: 'FS - Feed Transportation Equipment' },
    { ...defaults, name: 'FS - Facility Design & Construction' },
    { ...defaults, name: 'FS - Conveying & Material Handling' },
  ];
  const questionIds = ['64301b173e81776bd5dc7cd8', '642f689c5377824a6c1b851f'];
  const personasToAssign = {
    '644180ae0f24db5d496c553c_64417f486ffc39de5bcf0ebb': [ps[2], ps[3], ps[4], ps[5]],
    '644180ae0f24db5d496c553c_642f69874566b9a20334e1cb': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[6],
      ps[8],
    ],
    '644180ae0f24db5d496c553c_642f69874566b9440934e1ca': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[5], ps[6],
      ps[7], ps[8],
    ],
    '644180ae0f24db5d496c553c_642f69874566b9532c34e1c9': [ps[0], ps[1], ps[4]],
    '644180ae0f24db5d496c553c_64417f486ffc391f97cf0ebe': [ps[3], ps[4], ps[5], ps[6], ps[7], ps[8]],
    '644180ae0f24db5d496c553c_64417f486ffc395d09cf0ebf': [ps[3], ps[4], ps[5], ps[6], ps[8]],
    '644180ae0f24db5d496c553c_642f69874566b93e3834e1c6': [
      ps[0], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '644180ae0f24db5d496c553c_642f69874566b96d1a34e1c3': [ps[0], ps[1], ps[2]],
    '644180ae0f24db5d496c553c_642f69874566b9c61f34e1c4': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '644180ae0f24db5d496c553c_64417f486ffc39eab7cf0ebd': [ps[4], ps[8]],
    '644180ae0f24db5d496c553c_642f69874566b97bc834e1c2': [ps[0], ps[1], ps[4]],
    '644180ae0f24db5d496c553c_64417f486ffc39a69bcf0ebc': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6],
    ],
    '644180ae0f24db5d496c553c_64417f486ffc39fd5ecf0ec0': [ps[1], ps[4]],
    '644180ae0f24db7aa66c553a_642f69874566b9a20334e1cb': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_642f69874566b9440934e1ca': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_642f69874566b9532c34e1c9': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_642f69874566b93e3834e1c6': [ps[0]],
    '644180ae0f24db7aa66c553a_642f69874566b96d1a34e1c3': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_642f69874566b9c61f34e1c4': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_642f69874566b97bc834e1c2': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_64417f486ffc39a69bcf0ebc': [ps[0], ps[1]],
    '644180ae0f24db7aa66c553a_64417f486ffc39fd5ecf0ec0': [ps[1]],
    '64301b773e8177096cdc7cdb_64417f486ffc39de5bcf0ebb': [ps[2]],
    '64301b773e8177096cdc7cdb_642f69874566b9a20334e1cb': [ps[0], ps[1], ps[2]],
    '64301b773e8177096cdc7cdb_642f69874566b9440934e1ca': [ps[0], ps[1], ps[2]],
    '64301b773e8177096cdc7cdb_642f69874566b9532c34e1c9': [ps[0], ps[1]],
    '64301b773e8177096cdc7cdb_642f69874566b93e3834e1c6': [ps[0]],
    '64301b773e8177096cdc7cdb_642f69874566b96d1a34e1c3': [ps[0], ps[1], ps[2]],
    '64301b773e8177096cdc7cdb_642f69874566b9c61f34e1c4': [ps[0], ps[1], ps[2]],
    '64301b773e8177096cdc7cdb_642f69874566b97bc834e1c2': [ps[0], ps[1]],
    '64301b773e8177096cdc7cdb_64417f486ffc39fd5ecf0ec0': [ps[0], ps[1]],
    '64301b773e817754f6dc7cd9_64417f486ffc39de5bcf0ebb': [ps[4]],
    '64301b773e817754f6dc7cd9_642f69874566b9a20334e1cb': [ps[0], ps[1], ps[4], ps[6]],
    '64301b773e817754f6dc7cd9_642f69874566b9440934e1ca': [ps[0], ps[1], ps[6]],
    '64301b773e817754f6dc7cd9_642f69874566b9532c34e1c9': [ps[0], ps[1], ps[4]],
    '64301b773e817754f6dc7cd9_64417f486ffc391f97cf0ebe': [ps[4], ps[6]],
    '64301b773e817754f6dc7cd9_64417f486ffc395d09cf0ebf': [ps[4], ps[6]],
    '64301b773e817754f6dc7cd9_642f69874566b93e3834e1c6': [ps[0], ps[4], ps[6]],
    '64301b773e817754f6dc7cd9_642f69874566b96d1a34e1c3': [ps[0], ps[1]],
    '64301b773e817754f6dc7cd9_642f69874566b9c61f34e1c4': [ps[0], ps[1], ps[4], ps[6]],
    '64301b773e817754f6dc7cd9_64417f486ffc39eab7cf0ebd': [ps[4]],
    '64301b773e817754f6dc7cd9_642f69874566b97bc834e1c2': [ps[0], ps[1], ps[4]],
    '64301b773e817754f6dc7cd9_64417f486ffc39a69bcf0ebc': [ps[0], ps[1], ps[4], ps[6]],
    '64301b773e817754f6dc7cd9_64417f486ffc39fd5ecf0ec0': [ps[1], ps[4]],
    '64301b773e8177782ddc7cdd_642f69874566b9a20334e1cb': [ps[1]],
    '64301b773e8177782ddc7cdd_642f69874566b9440934e1ca': [ps[1]],
    '64301b773e8177782ddc7cdd_642f69874566b9532c34e1c9': [ps[1]],
    '64301b773e8177782ddc7cdd_642f69874566b96d1a34e1c3': [ps[1]],
    '64301b773e8177782ddc7cdd_642f69874566b9c61f34e1c4': [ps[1]],
    '64301b773e8177782ddc7cdd_642f69874566b97bc834e1c2': [ps[1]],
    '64301b773e8177782ddc7cdd_64417f486ffc39a69bcf0ebc': [ps[1]],
    '64301b773e8177782ddc7cdd_64417f486ffc39fd5ecf0ec0': [ps[1]],
    '64301b773e8177d05ddc7cdc_642f69874566b9a20334e1cb': [ps[1]],
    '64301b773e8177d05ddc7cdc_642f69874566b9440934e1ca': [ps[1]],
    '64301b773e8177d05ddc7cdc_642f69874566b9532c34e1c9': [ps[1]],
    '64301b773e8177d05ddc7cdc_642f69874566b96d1a34e1c3': [ps[1]],
    '64301b773e8177d05ddc7cdc_642f69874566b9c61f34e1c4': [ps[1]],
    '64301b773e8177d05ddc7cdc_642f69874566b97bc834e1c2': [ps[1]],
    '64301b773e8177d05ddc7cdc_64417f486ffc39a69bcf0ebc': [ps[1]],
    '64301b773e8177d05ddc7cdc_64417f486ffc39fd5ecf0ec0': [ps[1]],
    '64301b773e817753f7dc7cdf_64417f486ffc39de5bcf0ebb': [ps[4], ps[5]],
    '64301b773e817753f7dc7cdf_642f69874566b9a20334e1cb': [ps[0], ps[1], ps[4]],
    '64301b773e817753f7dc7cdf_642f69874566b9440934e1ca': [ps[0], ps[1], ps[5]],
    '64301b773e817753f7dc7cdf_642f69874566b9532c34e1c9': [ps[0], ps[1], ps[4]],
    '64301b773e817753f7dc7cdf_64417f486ffc391f97cf0ebe': [ps[4], ps[5]],
    '64301b773e817753f7dc7cdf_64417f486ffc395d09cf0ebf': [ps[4], ps[5], ps[9]],
    '64301b773e817753f7dc7cdf_642f69874566b93e3834e1c6': [ps[0], ps[4], ps[5], ps[9]],
    '64301b773e817753f7dc7cdf_642f69874566b96d1a34e1c3': [ps[0], ps[1]],
    '64301b773e817753f7dc7cdf_642f69874566b9c61f34e1c4': [ps[0], ps[1], ps[4], ps[5]],
    '64301b773e817753f7dc7cdf_64417f486ffc39eab7cf0ebd': [ps[4]],
    '64301b773e817753f7dc7cdf_642f69874566b97bc834e1c2': [ps[0], ps[1], ps[4]],
    '64301b773e817753f7dc7cdf_64417f486ffc39fd5ecf0ec0': [ps[1], ps[4]],
    '64301b773e817704ecdc7ce2_64417f486ffc39de5bcf0ebb': [ps[2], ps[3], ps[4], ps[5]],
    '64301b773e817704ecdc7ce2_642f69874566b9a20334e1cb': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[6],
      ps[8],
    ],
    '64301b773e817704ecdc7ce2_642f69874566b9440934e1ca': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '64301b773e817704ecdc7ce2_642f69874566b9532c34e1c9': [ps[0], ps[1], ps[4]],
    '64301b773e817704ecdc7ce2_64417f486ffc391f97cf0ebe': [ps[3], ps[4], ps[5], ps[6], ps[7], ps[8]],
    '64301b773e817704ecdc7ce2_64417f486ffc395d09cf0ebf': [ps[3], ps[4], ps[5], ps[6], ps[8], ps[9]],
    '64301b773e817704ecdc7ce2_642f69874566b93e3834e1c6': [
      ps[0], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8], ps[9],
    ],
    '64301b773e817704ecdc7ce2_642f69874566b96d1a34e1c3': [ps[0], ps[1], ps[2]],
    '64301b773e817704ecdc7ce2_642f69874566b9c61f34e1c4': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '64301b773e817704ecdc7ce2_64417f486ffc39eab7cf0ebd': [ps[4], ps[8]],
    '64301b773e817704ecdc7ce2_642f69874566b97bc834e1c2': [ps[0], ps[1]],
    '64301b773e817704ecdc7ce2_64417f486ffc39a69bcf0ebc': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6],
    ],
    '64301b773e817704ecdc7ce2_64417f486ffc39fd5ecf0ec0': [ps[1], ps[4]],
    '64301b773e8177eb00dc7ce1_64417f486ffc39de5bcf0ebb': [ps[2], ps[3], ps[4], ps[5]],
    '64301b773e8177eb00dc7ce1_642f69874566b9a20334e1cb': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[6],
      ps[8],
    ],
    '64301b773e8177eb00dc7ce1_642f69874566b9440934e1ca': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[5], ps[6],
      ps[7], ps[8],
    ],
    '64301b773e8177eb00dc7ce1_642f69874566b9532c34e1c9': [ps[0], ps[1], ps[4]],
    '64301b773e8177eb00dc7ce1_64417f486ffc391f97cf0ebe': [ps[3], ps[4], ps[5], ps[6], ps[7], ps[8]],
    '64301b773e8177eb00dc7ce1_64417f486ffc395d09cf0ebf': [ps[3], ps[4], ps[5], ps[6], ps[8]],
    '64301b773e8177eb00dc7ce1_642f69874566b93e3834e1c6': [
      ps[0], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '64301b773e8177eb00dc7ce1_642f69874566b96d1a34e1c3': [ps[0], ps[1], ps[2]],
    '64301b773e8177eb00dc7ce1_642f69874566b9c61f34e1c4': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '64301b773e8177eb00dc7ce1_64417f486ffc39eab7cf0ebd': [ps[4], ps[8]],
    '64301b773e8177eb00dc7ce1_642f69874566b97bc834e1c2': [ps[0], ps[1], ps[4]],
    '64301b773e8177eb00dc7ce1_64417f486ffc39a69bcf0ebc': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6],
    ],
    '64301b773e8177eb00dc7ce1_64417f486ffc39fd5ecf0ec0': [ps[1], ps[4]],
    '644180ae0f24db41ea6c5537_642f69874566b9a20334e1cb': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_642f69874566b9440934e1ca': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_642f69874566b9532c34e1c9': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_642f69874566b93e3834e1c6': [ps[0]],
    '644180ae0f24db41ea6c5537_642f69874566b96d1a34e1c3': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_642f69874566b9c61f34e1c4': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_642f69874566b97bc834e1c2': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_64417f486ffc39a69bcf0ebc': [ps[0], ps[1]],
    '644180ae0f24db41ea6c5537_64417f486ffc39fd5ecf0ec0': [ps[1]],
    '644180ae0f24db34be6c553b_642f69874566b9a20334e1cb': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_642f69874566b9440934e1ca': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_642f69874566b9532c34e1c9': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_642f69874566b93e3834e1c6': [ps[0]],
    '644180ae0f24db34be6c553b_642f69874566b96d1a34e1c3': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_642f69874566b9c61f34e1c4': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_642f69874566b97bc834e1c2': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_64417f486ffc39a69bcf0ebc': [ps[0], ps[1]],
    '644180ae0f24db34be6c553b_64417f486ffc39fd5ecf0ec0': [ps[1]],
    '64301b773e8177d4a0dc7cde_64417f486ffc39de5bcf0ebb': [ps[2], ps[3], ps[4], ps[5]],
    '64301b773e8177d4a0dc7cde_642f69874566b9a20334e1cb': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[6],
      ps[8],
    ],
    '64301b773e8177d4a0dc7cde_642f69874566b9440934e1ca': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[5], ps[6],
      ps[7], ps[8],
    ],
    '64301b773e8177d4a0dc7cde_642f69874566b9532c34e1c9': [ps[0], ps[1], ps[4]],
    '64301b773e8177d4a0dc7cde_64417f486ffc395d09cf0ebf': [ps[3], ps[4], ps[5], ps[6], ps[8], ps[9]],
    '64301b773e8177d4a0dc7cde_642f69874566b93e3834e1c6': [
      ps[0], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8], ps[9],
    ],
    '64301b773e8177d4a0dc7cde_642f69874566b96d1a34e1c3': [ps[0], ps[1], ps[2]],
    '64301b773e8177d4a0dc7cde_642f69874566b9c61f34e1c4': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6], ps[7],
      ps[8],
    ],
    '64301b773e8177d4a0dc7cde_64417f486ffc39eab7cf0ebd': [ps[4], ps[8]],
    '64301b773e8177d4a0dc7cde_642f69874566b97bc834e1c2': [ps[0], ps[1], ps[4]],
    '64301b773e8177d4a0dc7cde_64417f486ffc39a69bcf0ebc': [
      ps[0], ps[1],
      ps[2], ps[3],
      ps[4], ps[5],
      ps[6],
    ],
    '64301b773e8177d4a0dc7cde_64417f486ffc39fd5ecf0ec0': [ps[1], ps[4]],
  };

  [...Object.entries(personasToAssign)].forEach(([key, personas]) => {
    const answerIds = key.split('_');
    personas.forEach((persona) => {
      persona.rules.push({
        conditions: [
          { field: questionIds[0], answer: answerIds[0] },
          { field: questionIds[1], answer: answerIds[1] },
        ],
      });
    });
  });

  await eachSeries(ps, async (segment) => {
    const r = await applicationService.request('segment.create', {
      applicationId: '6449537d36197792dcb5e367',
      payload: segment,
    });
    log(segment, r);
  });

  log('All segments created!');
};
