const { applicationService } = require('@identity-x/service-clients');
const { eachSeries } = require('async');

const { log } = console;
const defaults = { appContextId: '644960484a7ef9f2d2814607', rules: [] };

module.exports = async () => {
  const ps = [
    { ...defaults, name: 'FG - Operations - Convey Handling - Aeration Dry' },
    { ...defaults, name: 'FG - Mfg Equip - Batching CRM Automation Software' },
    { ...defaults, name: 'FG - Facility Design & Construction' },
    { ...defaults, name: 'FG - Testing and Analysis' },
    { ...defaults, name: 'FG - Feed Transportation Equipment' },
  ];
  const questionIds = ['643404c587747e1f4434a8c8', '6430a9a27694b7652a933308'];
  const personasToAssign = {
    '643405a83e8177091cdc7f15_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e8177091cdc7f15_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e8177091cdc7f15_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e8177091cdc7f15_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81777bd8dc7f14_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81777bd8dc7f14_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81777bd8dc7f14_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e81777bd8dc7f14_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81773876dc7f16_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81773876dc7f16_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81773876dc7f16_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e81773876dc7f16_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81770ec7dc7f0b_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81770ec7dc7f0b_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81770ec7dc7f0b_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e81770ec7dc7f0b_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81772ceedc7f17_6430aa6653778299501b85c1': [ps[0], ps[2], ps[3], ps[4]],
    '643405a83e81772ceedc7f17_6430aa6653778251051b85c0': [ps[0], ps[2], ps[3], ps[4]],
    '643405a83e81772ceedc7f17_6430aa66537782178d1b85bf': [ps[3]],
    '643405a83e81772ceedc7f17_6430aa665377823c961b85be': [ps[0], ps[2], ps[3], ps[4]],
    '643405a83e81772253dc7f0a_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81772253dc7f0a_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81772253dc7f0a_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e81772253dc7f0a_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81775863dc7f13_6430aa6653778299501b85c1': [ps[0], ps[1]],
    '643405a83e81775863dc7f13_6430aa6653778251051b85c0': [ps[0], ps[1]],
    '643405a83e81775863dc7f13_6430aa66537782178d1b85bf': [ps[1]],
    '643405a83e81775863dc7f13_6430aa665377823c961b85be': [ps[0], ps[1]],
    '643405a83e81775a33dc7f12_6430aa6653778299501b85c1': [ps[0], ps[1]],
    '643405a83e81775a33dc7f12_6430aa6653778251051b85c0': [ps[0], ps[1]],
    '643405a83e81775a33dc7f12_6430aa66537782178d1b85bf': [ps[1]],
    '643405a83e81775a33dc7f12_6430aa665377823c961b85be': [ps[0], ps[1]],
    '643405a83e8177fa68dc7f0f_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e8177fa68dc7f0f_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e8177fa68dc7f0f_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e8177fa68dc7f0f_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e817783a6dc7f10_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e817783a6dc7f10_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e817783a6dc7f10_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e817783a6dc7f10_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81776603dc7f11_6430aa6653778299501b85c1': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81776603dc7f11_6430aa6653778251051b85c0': [ps[0], ps[1], ps[2], ps[3], ps[4]],
    '643405a83e81776603dc7f11_6430aa66537782178d1b85bf': [ps[1], ps[3]],
    '643405a83e81776603dc7f11_6430aa665377823c961b85be': [ps[0], ps[1], ps[2], ps[3], ps[4]],
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
