const { applicationService } = require('@identity-x/service-clients');
const { eachSeries } = require('async');

const { log } = console;

module.exports = async () => {
  const ps = [
    { name: 'Pet Ingredients', rules: [] },
    { name: 'Pet Equipment Processing', rules: [] },
    { name: 'Pet Equipment Packaging', rules: [] },
    { name: 'Pet Materials Packaging', rules: [] },
    { name: 'Pet Services and Testing', rules: [] },
  ];
  const questionIds = ['643401767694b72e949334d8', '6434009be5f1a5a77760fd37'];
  const personasToAssign = {
    '643401ede5f1a5743060fd3a_643401403e817779dfdc7f07': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a5743060fd3a_643401403e817754d9dc7f06': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a5743060fd3a_643401403e81776a1adc7f05': [ps[0], ps[1], ps[3]],
    '643401ede5f1a5743060fd3a_643401403e8177752cdc7f02': [ps[0], ps[1], ps[3], ps[4]],
    '643401ede5f1a5743060fd3a_643401403e8177d086dc7efc': [ps[4]],
    '643401ede5f1a5743060fd3a_643401403e81776341dc7f03': [ps[0], ps[1], ps[2], ps[3]],
    '643401ede5f1a5743060fd3a_643401403e81776901dc7efd': [ps[2], ps[3], ps[4]],
    '643401ede5f1a5743060fd3a_643401403e81772341dc7f01': [ps[0], ps[1], ps[4]],
    '643401ede5f1a532ef60fd3b_643401403e817779dfdc7f07': [ps[0]],
    '643401ede5f1a532ef60fd3b_643401403e817754d9dc7f06': [ps[0]],
    '643401ede5f1a532ef60fd3b_643401403e81776a1adc7f05': [ps[0]],
    '643401ede5f1a532ef60fd3b_643401403e8177752cdc7f02': [ps[0]],
    '643401ede5f1a532ef60fd3b_643401403e81776341dc7f03': [ps[0]],
    '643401ede5f1a532ef60fd3b_643401403e81773e4fdc7eff': [ps[0]],
    '643401ede5f1a532ef60fd3b_643401403e81772341dc7f01': [ps[0]],
    '643401ede5f1a58be360fd42_643401403e817779dfdc7f07': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a58be360fd42_643401403e817754d9dc7f06': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a58be360fd42_643401403e81776a1adc7f05': [ps[0], ps[1], ps[3]],
    '643401ede5f1a58be360fd42_643401403e8177752cdc7f02': [ps[0], ps[1], ps[3], ps[4]],
    '643401ede5f1a58be360fd42_643401403e81770701dc7f04': [ps[2]],
    '643401ede5f1a58be360fd42_643401403e8177d086dc7efc': [ps[4]],
    '643401ede5f1a58be360fd42_643401403e81776341dc7f03': [ps[0], ps[1], ps[2], ps[3]],
    '643401ede5f1a58be360fd42_643401403e81776901dc7efd': [ps[2], ps[3], ps[4]],
    '643401ede5f1a58be360fd42_643401403e81773e4fdc7eff': [ps[0], ps[4]],
    '643401ede5f1a58be360fd42_643401403e81772341dc7f01': [ps[0], ps[1], ps[4]],
    '643401ede5f1a53d0060fd41_643401403e817779dfdc7f07': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a53d0060fd41_643401403e817754d9dc7f06': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a53d0060fd41_643401403e81776a1adc7f05': [ps[0], ps[1], ps[3]],
    '643401ede5f1a53d0060fd41_643401403e8177752cdc7f02': [ps[0], ps[1], ps[3], ps[4]],
    '643401ede5f1a53d0060fd41_643401403e81770701dc7f04': [ps[2], ps[3]],
    '643401ede5f1a53d0060fd41_643401403e8177d086dc7efc': [ps[4]],
    '643401ede5f1a53d0060fd41_643401403e81776341dc7f03': [ps[0], ps[1], ps[2], ps[3]],
    '643401ede5f1a53d0060fd41_643401403e81776901dc7efd': [ps[2], ps[3], ps[4]],
    '643401ede5f1a53d0060fd41_643401403e81773e4fdc7eff': [ps[0], ps[4]],
    '643401ede5f1a53d0060fd41_643401403e81772341dc7f01': [ps[0], ps[1], ps[4]],
    '643401ede5f1a52c6260fd3e_643401403e817779dfdc7f07': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a52c6260fd3e_643401403e817754d9dc7f06': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a52c6260fd3e_643401403e81776a1adc7f05': [ps[0], ps[1], ps[3]],
    '643401ede5f1a52c6260fd3e_643401403e8177752cdc7f02': [ps[0], ps[1], ps[3], ps[4]],
    '643401ede5f1a52c6260fd3e_643401403e81770701dc7f04': [ps[2], ps[3]],
    '643401ede5f1a52c6260fd3e_643401403e81776341dc7f03': [ps[0], ps[1], ps[2], ps[3]],
    '643401ede5f1a52c6260fd3e_643401403e81776901dc7efd': [ps[2], ps[3], ps[4]],
    '643401ede5f1a52c6260fd3e_643401403e81773e4fdc7eff': [ps[0], ps[4]],
    '643401ede5f1a52c6260fd3e_643401403e81772341dc7f01': [ps[0], ps[1], ps[4]],
    '643401ede5f1a561a560fd3d_643401403e817779dfdc7f07': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a561a560fd3d_643401403e817754d9dc7f06': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643401ede5f1a561a560fd3d_643401403e81776a1adc7f05': [ps[0], ps[1], ps[3]],
    '643401ede5f1a561a560fd3d_643401403e8177752cdc7f02': [ps[0], ps[1], ps[3], ps[4]],
    '643401ede5f1a561a560fd3d_643401403e81770701dc7f04': [ps[2], ps[3]],
    '643401ede5f1a561a560fd3d_643401403e81776341dc7f03': [ps[0], ps[1], ps[2], ps[3]],
    '643401ede5f1a561a560fd3d_643401403e81776901dc7efd': [ps[2], ps[3], ps[4]],
    '643401ede5f1a561a560fd3d_643401403e81773e4fdc7eff': [ps[0], ps[4]],
    '643401ede5f1a561a560fd3d_643401403e81772341dc7f01': [ps[0], ps[1], ps[4]],
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
    console.log(segment, r);
  });

  log('All segments created!');
};
