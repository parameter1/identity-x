const validator = require('validator');
const { applicationService, localeService } = require('@identity-x/service-clients');
const { normalizeEmail } = require('@identity-x/utils');
// const { eachLimit } = require('async');
const eachLimit = require('async/eachLimit');

const { log } = console;
const regionMap = new Map();
const countryMap = new Map();
const fieldMap = new Map();
const answerMap = new Map();
const oldAnswerMap = new Map([
  // Field: Technologies
  ['Analyzers & Reagents', ['Molecular Diagnostics', 'Immunoassay', 'Clinical Chemistry']],
  ['Chromatography', ['Emerging Technologies']],
  ['Digital Pathology', ['Pathology and Histology']],
  ['Histology', ['Pathology and Histology']],
  ['Lab Automation Software', ['Lab Software']],
  ['Lab Automation', ['Automation']],
  ['Laboratory Information Systems (LIS)', ['Lab Software']],
  ['Microscopy & Imaging', ['Pathology and Histology']],
  ['Molecular Diagnostics', ['Molecular Diagnostics', 'Sequencing', 'Liquid Biopsy', 'Genomics']], // re-route unchanged @todo
  ['Sequencing', ['Molecular Diagnostics', 'Sequencing', 'Liquid Biopsy', 'Genomics']], // re-route unchanged @todo

  // Field: Specialities
  ['Autoimmune Testing', ['Autoimmune']],
  ['Cancer Diagnostics', ['Cancer']],
  ['Clinical Pathology', []], // remove
  ['CNS Testing', []], // remove
  ['Companion Diagnostics', []], // remove
  ['Disease Patterns and Trends', []], // remove
  ['Economics & Lab Management', []], // remove
  ['Emergency Medicine', ['Emergency medicine']],
  ['Genomics', []], // remove
  ['Microbiology/Infectious Diseases', ['Infectious disease/microbiology']],
  ['New Viral Threats', ['COVID-19/new disease threats']],
  ['Precision Medicine', []], // remove
  ['Routine Testing', ['Routine testing']],
  ['Sexually transmitted diseases', []], // remove
  ['Substance Abuse Testing', ['Drugs of Abuse/Toxicology']],
  ['Urgent Care', ['Urgent care']],

  // Field: Profession
  ['Accessioner', []],
  ['Association Professional', []],
  ['Administrator', []],
  ['CMO', []],
  ['Distributor', []],
  ['Educator', []],
  ['Engineer', []],
  ['Equipment Service', []],
  ['Histotechnologist', ['histotechnologist']],
  ['IT Support', []],
  ['Lab Director/Manager', ['Lab director']],
  ['Lab manager', []],
  ['Lab Technician', ['Lab technician']],
  ['Laboratory manager', []],
  ['Nursing', []],
  ['Pathologist', ['pathologist']],
  ['Pathology Resident', []],
  ['Phlebotomist', []],
  ['System Administrator', []],
  ['Systems Analyst', []],
  ['Student', []],
  ['Vendor', []],

  // Field: Org Type
  ['Academic Institution', ['Academic institution']],
  ['CLIA lab', ['CLIA laboratory']],
  ['Consulting firm', ['Contract research organization']],
  ['Group purchasing org', []], // remove
  ['Other', []], // remove
  ['Pharmaceutical', ['Diagnostic company/test developer/manufacturer']],
  ['Staffing/Service', ['Diagnostic company/test developer/manufacturer']],
  ['Staffing/Services', ['Diagnostic company/test developer/manufacturer']],
  ['Vendor', ['Diagnostic company/test developer/manufacturer']],
]);
const badAnswers = [];

const getRegionCode = async (name, countryCode) => {
  if (regionMap.has(name)) return regionMap.get(name);

  const code = await localeService.request('region.getCode', { name, countryCode });
  // log('getRegionCode', { name, countryCode, code });
  if (code) {
    regionMap.set(name, code);
    return code;
  }
  // log('resp', code);
  throw new Error(`unknown region name "${name}"`);
};

const getCountryCode = async (name) => {
  if (countryMap.has(name)) return countryMap.get(name);
  const code = await localeService.request('country.getCode', { name });
  // log('getCountryCode', { name, code });
  if (code) {
    countryMap.set(name, code);
    return code;
  }
  throw new Error(`Unknown country name: "${name}"`);
};

const mapBooleanAnswers = async (data) => {
  const keys = Object.keys(data)
    .filter(key => /^Custom:/i.test(key))
    .filter(key => fieldMap.get(key).type === 'boolean');
  return keys.map((key) => {
    const k = fieldMap.get(key);
    const value = data[key] === 'TRUE';
    return { _id: k.id, value };
  }).filter(v => v);
};

const mapSelectAnswers = async (data, error = false) => {
  const keys = Object.keys(data)
    .filter(key => /^Custom:/i.test(key))
    .filter(key => data[key])
    .filter(key => fieldMap.get(key).type === 'select');
  return keys.map((key) => {
    const k = fieldMap.get(key);
    const answers = `${data[key]}`.split('|');
    const values = answers.reduce((arr, v) => {
      const value = `${v}`.trim();
      if (oldAnswerMap.has(value)) {
        return [...arr, ...oldAnswerMap.get(value).map(a => answerMap.get(a))];
      }
      if (!answerMap.has(value)) {
        badAnswers[key] = badAnswers[key] || new Set();
        badAnswers[key].add(value);
        if (error) throw new Error(`Unable to find mapped answer for "${value}"!`);
        return arr;
      }
      return [...arr, answerMap.get(value)];
    }, []);
    return { _id: k.id, values };
  }).filter(v => v);
};

module.exports = async (records = [], applicationId, limit = 10, errorOnBadAnswer = false) => {
  const valid = [];
  const answers = await applicationService.request('field.listForApp', { id: applicationId, sort: { _id: 1 } });
  answers.edges.forEach(({ node }) => {
    // eslint-disable-next-line no-underscore-dangle
    fieldMap.set(`Custom: ${node.name}`, { id: node._id, type: node._type });
    if (node.options) {
      node.options.forEach((option) => {
        answerMap.set(option.label, option._id);
      });
    }
  });

  log('Validating', records.length, applicationId);

  await eachLimit(records, limit, async (record) => {
    const isInternal = /[a-f0-9]{24,}/i.test(record._id);
    try {
      const filtered = Object.keys(record).reduce((obj, key) => ({
        ...obj,
        ...(record[key] && /^Custom:/.test(key) === false && { [key]: record[key] }),
        // Fix bad data
        ...(record.countryName === 'United States' && { countryName: 'United States of America' }),
        ...(record.countryName === 'Russia' && { countryName: 'Russian Federation' }),
        ...(record.countryName === 'Iran' && { countryName: 'Iran, Islamic Republic of' }),
        ...(record.countryName === 'Vietnam' && { countryName: 'Viet Nam' }),
        ...(record.countryName === 'Korea, Republic of' && { countryName: 'South Korea' }),
        ...(record.countryName === 'Macedonia' && { countryName: 'North Macedonia, Republic of' }),
        ...(record.countryName === 'Rwandese Republic' && { countryName: 'Rwanda' }),
        // Regions
        ...(record.regionName === 'Toscana' && { countryName: 'Italy' }),
        ...(record.regionName === 'Mexico City' && { regionName: undefined }),
        ...(record.regionName === 'DC' && { regionName: 'District of Columbia' }),
        // Canada, eh
        ...(record.countryName === 'Canada' && {
          ...(record.regionName === 'AB' && { regionName: 'Alberta' }),
          ...(record.regionName === 'BC' && { regionName: 'British Columbia' }),
          ...(record.regionName === 'manitoba' && { regionName: 'Manitoba' }),
          ...(record.regionName === 'NS' && { regionName: 'Nova Scotia' }),
          ...(record.regionName === 'Qc' && { regionName: 'Quebec' }),
          ...(record.regionName === 'Newfoundland' && { regionName: 'Newfoundland and Labrador' }),
          ...(record.regionName === 'ONTARIO' && { regionName: 'Ontario' }),
        }),

        // Bad data
        ...(['AF5B5252903A4', 'CD79C0974D719', 'Choose One'].includes(record.countryName) && {
          countryName: undefined,
        }),
        ...(['AF5B5252903A4', 'CD79C0974D719', 'Choose One'].includes(record.regionName) && {
          regionName: undefined,
        }),
      }), {});
      const { countryName } = filtered;
      const countryCode = countryName ? await getCountryCode(countryName) : undefined;
      const validCC = ['US', 'MX', 'CA'].includes(countryCode);
      const { _id } = filtered;
      if (!isInternal) delete filtered._id;
      const email = normalizeEmail(filtered.email);
      const [, domain] = email.split('@');
      const externalId = Buffer.from(_id).toString('base64');
      const normalized = {
        ...filtered,
        ...(!isInternal && {
          externalId: {
            // @todo Use util?
            _id: `backoffice.smg.member*${externalId}~base64`,
            identifier: { value: externalId, type: 'base64' },
            namespace: { provider: 'backoffice', tenant: 'smg', type: 'member' },
          },
        }),
        email: normalizeEmail(filtered.email),
        domain,
        verified: false,
        receiveEmail: filtered.receiveEmail === 'TRUE',
        // country is valid/not typo'd
        ...(countryName && { countryCode }),
        // region/state codes are set properly
        ...(filtered.regionName && validCC && {
          regionCode: await getRegionCode(filtered.regionName, countryCode),
        }),
        // values for custom questions map to valid answers
        customBooleanFieldAnswers: await mapBooleanAnswers(record),
        customSelectFieldAnswers: await mapSelectAnswers(record, errorOnBadAnswer),
      };
      if (!validator.isEmail(normalized.email)) throw new Error(`${normalized.email} is not a valid email address.`);
      // log(normalized);
      valid.push(normalized);
    } catch (e) {
      log('record failed', e);
      // throw e;
    }
  });

  log(badAnswers);

  return valid;
};
