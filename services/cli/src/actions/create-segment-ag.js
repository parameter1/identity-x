const { applicationService } = require('@identity-x/service-clients');
const { eachSeries } = require('async');

const { log } = console;
const defaults = { appContextId: '64496069361977a149b5e3a2', rules: [] };

module.exports = async () => {
  const ps = [
    { ...defaults, name: 'Poultry Health Genetics' },
    { ...defaults, name: 'Poultry Equipment House' },
    { ...defaults, name: 'Poultry Equipment Processing' },
    { ...defaults, name: 'Poultry Biosecurity & Pest Control' },
    { ...defaults, name: 'Poultry Equipment Hatchery' },
    { ...defaults, name: 'Poultry Egg Production' },
  ];
  const questionIds = ['64416bd1361977719ab5ded5', '6441672d72aad16b3b150eff'];
  const personasToAssign = {
    '64416cef36197795ecb5dee7_644168066ffc39365bcf0e78': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc397182cf0e84': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc392f45cf0e83': [
      ps[0],
      ps[1],
      ps[2],
      ps[3],
    ],
    '64416cef36197795ecb5dee7_644168066ffc39ccd0cf0e82': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc3918e1cf0e81': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc39daa4cf0e7f': [
      ps[0],
      ps[1],
      ps[2],
      ps[3],
    ],
    '64416cef36197795ecb5dee7_644168066ffc392a2dcf0e7d': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc394979cf0e77': [ps[0], ps[1]],
    '64416cef36197795ecb5dee7_644168066ffc390607cf0e7e': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc395956cf0e7a': [
      ps[0],
      ps[1],
      ps[2],
      ps[3],
    ],
    '64416cef36197795ecb5dee7_644168066ffc39607bcf0e7c': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc390a21cf0e79': [ps[0], ps[1], ps[3]],
    '64416cef36197795ecb5dee7_644168066ffc39214acf0e7b': [ps[0], ps[1], ps[3]],
    '64416cef3619770f03b5dee5_644168066ffc39365bcf0e78': [ps[0], ps[1], ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc397182cf0e84': [ps[0], ps[1], ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc392f45cf0e83': [
      ps[0],
      ps[1],
      ps[4],
      ps[5],
    ],
    '64416cef3619770f03b5dee5_644168066ffc39ccd0cf0e82': [
      ps[0],
      ps[1],
      ps[4],
      ps[5],
    ],
    '64416cef3619770f03b5dee5_644168066ffc3918e1cf0e81': [
      ps[0],
      ps[1],
      ps[4],
      ps[5],
    ],
    '64416cef3619770f03b5dee5_644168066ffc395618cf0e80': [ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc39daa4cf0e7f': [
      ps[0],
      ps[1],
      ps[4],
      ps[5],
    ],
    '64416cef3619770f03b5dee5_644168066ffc392a2dcf0e7d': [ps[0], ps[1], ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc394979cf0e77': [ps[0], ps[1]],
    '64416cef3619770f03b5dee5_644168066ffc390607cf0e7e': [ps[0], ps[1], ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc395956cf0e7a': [ps[0], ps[1], ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc39607bcf0e7c': [ps[0], ps[1], ps[5]],
    '64416cef3619770f03b5dee5_644168066ffc390a21cf0e79': [
      ps[0],
      ps[1],
      ps[4],
      ps[5],
    ],
    '64416cef3619770f03b5dee5_644168066ffc39214acf0e7b': [
      ps[0],
      ps[1],
      ps[4],
      ps[5],
    ],
    '64416cef361977988db5dee2_644168066ffc39365bcf0e78': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc397182cf0e84': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc392f45cf0e83': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc39ccd0cf0e82': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc3918e1cf0e81': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc39daa4cf0e7f': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc392a2dcf0e7d': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc390607cf0e7e': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc395956cf0e7a': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc39607bcf0e7c': [ps[0]],
    '64416cef361977988db5dee2_644168066ffc39214acf0e7b': [ps[0]],
    '64416cef36197752a2b5dedb_644168066ffc39365bcf0e78': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc397182cf0e84': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc392f45cf0e83': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc39ccd0cf0e82': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc3918e1cf0e81': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc395618cf0e80': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc39daa4cf0e7f': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc392a2dcf0e7d': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc390607cf0e7e': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc395956cf0e7a': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc39607bcf0e7c': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc390a21cf0e79': [ps[5]],
    '64416cef36197752a2b5dedb_644168066ffc39214acf0e7b': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc39365bcf0e78': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc397182cf0e84': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc392f45cf0e83': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc39ccd0cf0e82': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc3918e1cf0e81': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc395618cf0e80': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc39daa4cf0e7f': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc392a2dcf0e7d': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc390607cf0e7e': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc395956cf0e7a': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc39607bcf0e7c': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc390a21cf0e79': [ps[5]],
    '64416cef3619778f7ab5dedc_644168066ffc39214acf0e7b': [ps[5]],
    '64416cef3619777490b5dedd_644168066ffc39365bcf0e78': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc397182cf0e84': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc392f45cf0e83': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc39ccd0cf0e82': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc3918e1cf0e81': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc39daa4cf0e7f': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc392a2dcf0e7d': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc390607cf0e7e': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc395956cf0e7a': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc39607bcf0e7c': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc390a21cf0e79': [ps[0], ps[3]],
    '64416cef3619777490b5dedd_644168066ffc39214acf0e7b': [ps[0], ps[3]],
    '64416cef3619776c87b5dee3_644168066ffc39365bcf0e78': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc397182cf0e84': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc392f45cf0e83': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc39ccd0cf0e82': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc3918e1cf0e81': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc39daa4cf0e7f': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc392a2dcf0e7d': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc390607cf0e7e': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc395956cf0e7a': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc39607bcf0e7c': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc390a21cf0e79': [ps[0]],
    '64416cef3619776c87b5dee3_644168066ffc39214acf0e7b': [ps[0]],
    '64416cef36197729f7b5dee4_644168066ffc39365bcf0e78': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc397182cf0e84': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc392f45cf0e83': [ps[2], ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc39ccd0cf0e82': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc3918e1cf0e81': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc39daa4cf0e7f': [ps[2], ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc392a2dcf0e7d': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc390607cf0e7e': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc395956cf0e7a': [ps[2], ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc39607bcf0e7c': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc390a21cf0e79': [ps[3]],
    '64416cef36197729f7b5dee4_644168066ffc39214acf0e7b': [ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc39365bcf0e78': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc397182cf0e84': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc392f45cf0e83': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc39ccd0cf0e82': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc3918e1cf0e81': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc39daa4cf0e7f': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc392a2dcf0e7d': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc394979cf0e77': [ps[0], ps[1]],
    '64416cef36197742c1b5dee6_644168066ffc390607cf0e7e': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc395956cf0e7a': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc39607bcf0e7c': [ps[0], ps[1], ps[3]],
    '64416cef36197742c1b5dee6_644168066ffc390a21cf0e79': [ps[0], ps[1], ps[3]],
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
