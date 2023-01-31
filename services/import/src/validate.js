const validator = require('validator');
const { ObjectId } = require('@parameter1/mongodb');
const { applicationService, localeService } = require('@identity-x/service-clients');
const { normalizeEmail } = require('@identity-x/utils');
// const { eachLimit } = require('async');
const eachLimit = require('async/eachLimit');
const { US } = require('../../../services/locale/src/regions');

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
  ['Regeneration/remineralization', ['Remineralization']],
  ['SDF', ['Fluoride/SDF']],
  ['Digital Imaging Systems', ['Digital Imaging systems']],
  ['Root canal', []],
  ['Practice Management Software', []],

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
  ['CEO', ['Chief Executive Officer']], // IdX alt
  ['CFO', ['Chief Financial Officer']], // IdX alt
  ['CMO', []],
  ['chief marketing officer', ['Chief Marketing Officer']], // IdX alt
  ['chief medical officer', ['Chief Medical Officer']], // IdX alt
  ['Distributor', []],
  ['Educator', []],
  ['Engineer', []],
  ['Equipment Service', []],
  ['Histotechnologist', ['histotechnologist']],
  ['IT Support', []],
  ['Lab Director/Manager', ['Lab director']],
  ['Lab manager', []],
  ['Lab Technician', ['Lab technician']],
  ['Laboratory director', ['Lab director']], // IdX alt
  ['Laboratory manager', []],
  ['laboratory supervisor', ['Lab supervisor']], // IdX alt
  ['Nursing', []],
  ['Pathologist', ['pathologist']],
  ['Pathology Resident', []],
  ['Phlebotomist', []],
  ['System Administrator', []],
  ['Systems Analyst', []],
  ['Student', []],
  ['Vendor', []],
  ['NULL', []],
  ['Oral', []],

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
  const answers = await applicationService.request('field.listForApp', { id: applicationId, sort: { _id: 1 }, pagination: { limit: 20 } });
  answers.edges.forEach(({ node }) => {
    // eslint-disable-next-line no-underscore-dangle
    fieldMap.set(`Custom: ${node.name}`, { id: new ObjectId(node._id), type: node._type });
    if (node.options) {
      node.options.forEach((option) => {
        answerMap.set(option.label, new ObjectId(option._id));
      });
    }
  });

  log('Validating', records.length, applicationId);

  await eachLimit(records, limit, async (record) => {
    const isInternal = /[a-f0-9]{24,}/i.test(record._id);
    try {
      const filtered = Object.keys(record).reduce((obj, key) => ({
        ...obj,
        ...(record[key] && /^Custom:/.test(key) === false && !['countryName', 'regionName'].includes(key) && { [key]: record[key] }),
        ...(record[key] && /^Custom:/.test(key) === false && ['countryName', 'regionName'].includes(key) && { [key]: record[key].trim() }),
        // Fix bad data
        ...(record.countryName === 'United States' && { countryName: 'United States of America' }),
        ...(record.countryName === 'Russia' && { countryName: 'Russian Federation' }),
        ...(record.countryName === 'Iran' && { countryName: 'Iran, Islamic Republic of' }),
        ...(record.countryName === 'Vietnam' && { countryName: 'Viet Nam' }),
        ...(record.countryName === 'Korea, Republic of' && { countryName: 'South Korea' }),
        ...(record.countryName === 'Macedonia' && { countryName: 'North Macedonia, Republic of' }),
        ...(record.countryName === 'Rwandese Republic' && { countryName: 'Rwanda' }),
        ...(record.countryName === 'Palestinian Territory' && { countryName: 'Palestinian Territory, Occupied' }),
        ...(record.countryName === 'Libyan Arab Jamahiriya' && { countryName: 'Libya' }),
        ...(['Serbia and Montenegro', 'Yugoslavia'].includes(record.countryName) && { countryName: 'Serbia' }),
        ...(record.countryName === 'Irish Republic' && { countryName: 'Ireland' }),
        ...(record.countryName === 'Syria' && { countryName: 'Syrian Arab Republic' }),
        ...(record.countryName === 'Republic of Maldova' && { countryName: 'Moldova, Republic of' }),
        ...(record.countryName === 'Tanzania' && { countryName: 'Tanzania, United Republic of' }),
        ...(record.countryName === 'US Virgin Islands' && { countryName: 'Virgin Islands, U.S.' }),
        ...(record.countryName === 'Micronesia' && { countryName: 'Micronesia, Federated States of' }),
        ...(record.countryName === 'St. Vincent' && { countryName: 'Saint Vincent and the Grenadines' }),
        ...(record.countryName === 'Brunei Darusalaam' && { countryName: 'Brunei Darussalam' }),
        // Regions
        ...(record.regionName === 'Toscana' && { countryName: 'Italy' }),
        ...(record.regionName === 'Mexico City' && { regionName: undefined }),
        // This covers all US shortcodes
        ...(US[record.regionName] && { regionName: US[record.regionName].name }),
        ...(record.regionName === 'Nuevo Leon' && { regionName: 'Nuevo León' }),
        ...(record.regionName === 'NUEVO LEON' && { regionName: 'Nuevo León' }),
        // Garza García NL, NL = Nuevo León
        ...(record.regionName === 'Garza García NL' && { regionName: 'Nuevo León' }),
        ...(['Mexico', 'Estado de Mexico'].includes(record.regionName) && { regionName: 'México' }),
        ...(['Ciudad de Mexico', 'CIUDAD DE MEXICO'].includes(record.regionName) && { regionName: 'Ciudad de México' }),
        ...(['Michoacan', 'Michoacan de Ocampo'].includes(record.regionName) && { regionName: 'Michoacán de Ocampo' }),
        ...(record.regionName === 'Queretaro de Arteaga' && { regionName: 'Querétaro' }),
        ...(record.regionName === 'Yucatan' && { regionName: 'Yucatán' }),
        ...(record.regionName === 'Veracruz-Llave' && { regionName: 'Veracruz de Ignacio de la Llave' }),
        ...(['jalisco', 'JALISCO'].includes(record.regionName) && { regionName: 'Jalisco' }),
        ...(record.regionName === 'SONORA' && { regionName: 'Sonora' }),
        ...(record.regionName === 'chihuahua' && { regionName: 'Chihuahua' }),
        ...(record.regionName === 'San Luis Potosi' && { regionName: 'San Luis Potosí' }),
        ...(record.regionName === 'CHIAPAS' && { regionName: 'Chiapas' }),
        // San Andres Cholula is in Puebla Mexio which is the state
        ...(record.regionName === 'sn andres cholula' && { regionName: 'Puebla' }),
        // Mexicalu B.C. Mexico B.C. is Baja California
        ...(record.regionName === 'Mexicalu B.C. Mexico' && { regionName: 'Baja California' }),
        ...(record.regionName === 'Coahuila' && { regionName: 'Coahuila de Zaragoza' }),
        ...(record.regionName === 'COAHUILA' && { regionName: 'Coahuila de Zaragoza' }),
        // Occassionally the Canadians don't see to want to put they're from Canada
        ...(record.regionName === 'Alberta' && { countryName: 'Canada' }),
        ...(record.regionName === 'NL' && { regionName: 'Newfoundland and Labrador', countryName: 'Canada' }),
        ...(record.regionName === 'Ontario' && { countryName: 'Canada' }),

        // Canada, eh?
        ...(record.countryName === 'Canada' && {
          ...(record.regionName === 'AB' && { regionName: 'Alberta' }),
          ...(record.regionName === 'ab' && { regionName: 'Alberta' }),
          ...(record.regionName === 'alberta' && { regionName: 'Alberta' }),
          ...(record.regionName === 'BC' && { regionName: 'British Columbia' }),
          ...(record.regionName === 'bc' && { regionName: 'British Columbia' }),
          ...(record.regionName === 'BC - British Columbia' && { regionName: 'British Columbia' }),
          ...(record.regionName === 'B.C.' && { regionName: 'British Columbia' }),
          ...(record.regionName === 'b.c.' && { regionName: 'British Columbia' }),
          ...(record.regionName === 'manitoba' && { regionName: 'Manitoba' }),
          ...(record.regionName === 'NS' && { regionName: 'Nova Scotia' }),
          ...(record.regionName === 'Qc' && { regionName: 'Quebec' }),
          ...(record.regionName === 'qc' && { regionName: 'Quebec' }),
          ...(record.regionName === 'quebec' && { regionName: 'Quebec' }),
          ...(record.regionName === 'quebec' && { regionName: 'Québec' }),
          ...(record.regionName === 'Newfoundland' && { regionName: 'Newfoundland and Labrador' }),
          ...(record.regionName === 'NL' && { regionName: 'Newfoundland and Labrador' }),
          ...(record.regionName === 'ONTARIO' && { regionName: 'Ontario' }),
          ...(record.regionName === 'ontario' && { regionName: 'Ontario' }),
          ...(record.regionName === 'Ontario' && { regionName: 'Ontario' }),
          ...(record.regionName === 'on' && { regionName: 'Ontario' }),
          ...(record.regionName === 'ON' && { regionName: 'Ontario' }),
          ...(record.regionName === 'ont' && { regionName: 'Ontario' }),
          ...(record.regionName === 'Ont' && { regionName: 'Ontario' }),
          ...(record.regionName === 'otario' && { regionName: 'Ontario' }),
          ...(record.regionName === 'On' && { regionName: 'Ontario' }),
          ...(record.regionName === 'Yukon Territory', { regionName: 'Yukon' }),
          ...(record.regionName === 'sk', { regionName: 'Saskatchewan' }),
          ...(record.regionName === 'New-Brunswick' && { regionName: 'New Brunswick' }),
        }
        ),

        // Bad data
        ...([
          'AF5B5252903A4',
          'CD79C0974D719',
          '318A46E89ABC3',
          '759194E4E8096',
          'E8C7BDA5E5AD8',
          'F8E618435CD4D',
          'Choose One',
          'NULL',
          '\'null\'',
          'Europe',
          'Anonymous Proxy',
          'Asia/Pacific Region',
          'Satellite Provider',
          // Dissolved in 2010
          'Netherlands Antilles',
        ].includes(record.countryName) && {
          countryName: undefined,
        }),
        ...([
          'AF5B5252903A4',
          'CD79C0974D719',
          'Choose One',
          'NULL',
          '\'null\'',
          'null',
          'Distrito Federal',
          'Mb',
          'Armed Forces Europe, Midd',
          'Armed Forces Europe, Middle East, & Canada',
        ].includes(record.regionName) && {
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
