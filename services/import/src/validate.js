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
  ['', []], // remove empty values
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
  ['Practice Management Software', ['Practice management software']],
  ['3D Imaging', ['3D Imaging/3D Printing']],
  ['Artificial Intelligence', ['Artificial Intelligence/Computer-aided detection or diagnosis']],
  ['Computer-aided detection', []],
  ['Interventional Radiology', []],
  ['PACS/Teleradiology', ['PACS/Teleradiology/Enterprise Imaging']],
  ['Virtual Colonoscopy', []],
  ['Digital radiography', ['Digital Radiography']],
  ['Information Systems', ['RIS/Information Systems']],
  ['&   printing systems', ['Film & Film Printing Systems']],
  ['Artificial Intelligence/  or diagnosis', ['Artificial Intelligence/Computer-aided detection or diagnosis']],

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
  ['Information systems subspecialty', ['Imaging Informatics']],
  ['PACS', []],
  ['Practice management news - subspecialty', ['Practice Management']],

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
  // ['Educator', []],
  ['Engineer', []],
  ['Equipment Service', []],
  ['Histotechnologist', ['histotechnologist']],
  ['IT Support', ['IT Professional']],
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
  // ['Student', []],
  ['Vendor', []],
  ['NULL', []],
  ['Oral', ['Oral & Maxillofacial Surgeon']],
  ['MIS Director', []],
  ['PACS/RIS Manager', []],

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

const getRegionCode = async ({ name, countryCode }) => {
  if (regionMap.has(name)) return regionMap.get(name);

  const code = await localeService.request('region.getCode', { name, countryCode });
  // log('getRegionCode', { name, countryCode, code });
  if (code) {
    regionMap.set(name, code);
    return code;
  }
  const retry = await localeService.request('region.getCode', {
    name: name.toLowerCase().split('').map((char, index) => (index ? char : char.toUpperCase())).join(''),
    countryCode,
  });
  if (retry) {
    regionMap.set(name, retry);
    return retry;
  }
  // log('resp', code);
  throw new Error(`unknown region name "${name}" for ${countryCode}`);
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
    .filter(key => fieldMap.has(key) && fieldMap.get(key).type === 'boolean');
  return keys.map((key) => {
    const k = fieldMap.get(key);
    const value = ['TRUE', '1'].includes(data[key]);
    return { _id: k.id, value };
  }).filter(v => v);
};

const mapSelectAnswers = async (data, error = false) => {
  const keys = Object.keys(data)
    .filter(key => /^Custom:/i.test(key))
    .filter(key => data[key])
    .filter(key => fieldMap.has(key) && fieldMap.get(key).type === 'select');
  return keys.map((key) => {
    const k = fieldMap.get(key);
    const answers = `${data[key]}`.split('|');
    const values = answers.reduce((arr, v) => {
      const value = `${v}`.trim();
      if (oldAnswerMap.has(value)) {
        return [...arr, ...oldAnswerMap.get(value).map(a => answerMap.get(a))];
      }
      if (!answerMap.has(value)) {
        badAnswers[key] = badAnswers[key] || new Map();
        const bc = badAnswers[key].has(value) ? badAnswers[key].get(value) : 0;
        badAnswers[key].set(value, bc + 1);
        if (error) throw new Error(`Unable to find mapped answer "${value}" for "${key}"!`);
        return arr;
      }
      return [...arr, answerMap.get(value)];
    }, []);
    return { _id: k.id, values };
  }).filter(v => v);
};

module.exports = async (records = [], applicationId, limit = 10, errorOnBadAnswer = false) => {
  const valid = [];
  const answers = await applicationService.request('field.listForApp', { id: applicationId, sort: { _id: 1 }, pagination: { limit: 100 } });
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
    const regionNameTrimmed = record.regionName.trim();
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
        ...(record.countryName === 'St.Lucia' && { countryName: 'Saint Lucia' }),
        ...(record.countryName === 'British Virgin Islands' && { countryName: 'Virgin Islands, British' }),
        ...([
          'Ivory Coast',
          'Côte d’Ivoire',
        ].includes(record.countryName) && { countryName: 'Cote D\'Ivoire' }),
        ...(record.countryName === 'Palestine' && { countryName: 'Palestinian Territory, Occupied' }),
        ...(record.countryName === 'Turks & Caicos Islands' && { countryName: 'Turks and Caicos Islands' }),
        // USSR name
        ...(record.countryName === 'Byelorussian' && { countryName: 'Belarus' }),
        ...(record.countryName === 'Kiribati Republic' && { countryName: 'Kiribati' }),
        // Ruled by the kingdom of Denmark
        ...(record.countryName === 'Faeroe Islands' && { countryName: 'Denmark' }),
        ...(record.countryName === 'Congo, Dem. Rep. of' && { countryName: 'Congo, the Democratic Republic of the' }),
        ...(record.countryName === 'Saint Pierre et Miquelon' && { countryName: 'Saint Pierre and Miquelon' }),
        ...(record.countryName === 'Togolese Republic' && { countryName: 'Togo' }),
        ...(record.countryName === 'Cocos Islands' && { countryName: 'Cocos (Keeling) Islands' }),
        ...([
          'St. Kitts and Nevis',
          'St.Kitts and Nevis',
        ].includes(record.countryName) && { countryName: 'Saint Kitts and Nevis' }),
        ...(record.countryName === 'Laos' && { countryName: 'Lao People\'s Democratic Republic' }),
        ...(record.countryName === 'Sao Tome e Principe' && { countryName: 'Sao Tome and Principe' }),
        ...(record.countryName === 'East Timor' && { countryName: 'Timor-Leste' }),
        ...(record.countryName === 'Hong Kong SAR China' && { countryName: 'Hong Kong' }),
        ...(record.countryName === 'Falkland Islands' && { countryName: 'Falkland Islands (Malvinas)' }),
        ...(record.countryName === 'Western Samoa' && { countryName: 'Samoa' }),


        // Regions
        ...(regionNameTrimmed === 'Toscana' && { countryName: 'Italy' }),
        ...(regionNameTrimmed === 'Distrito Federal' && {
          countryName: 'Mexico',
          regionName: 'Ciudad de México',
        }),
        ...(regionNameTrimmed === 'Quebec' && { countryName: 'Canada', regionName: 'Quebec' }),
        ...(regionNameTrimmed === 'London, City of' && { regionName: undefined }),
        ...(regionNameTrimmed === 'Mexico City' && record.countryName !== 'Mexico' && {
          regionName: undefined,
        }),
        ...(regionNameTrimmed === 'dc' && { regionName: 'District of Columbia' }),
        // This covers all US shortcodes
        ...(US[regionNameTrimmed] && { regionName: US[regionNameTrimmed].name }),
        ...(regionNameTrimmed === 'west virginia' && { regionName: 'West Virginia' }),
        ...(regionNameTrimmed === 'new york' && { regionName: 'New York' }),

        ...(record.countryName === 'Mexico' && {
          ...([
            'Garza García NL',
            'Nuevo Leon',
            'NUEVO LEON',
            'nuevo leon',
            'Nuevo leon',
            'Nuevo Le�n',
            'NUEVO LEÓN',
            'nuevo león',
            'Monterrey',
            'MONTERREY',
            'monterrey',
            'San nicolas de los garza',
          ].includes(regionNameTrimmed) && { regionName: 'Nuevo León' }),
          ...([
            'Mexico',
            'Estado de Mexico',
            'La Paz. Edo. de Mexico',
            'Estado de M�xic',
            'Estado de M�xico',
            'MEXICO',
            'estado de mexico',
            'Atizapan',
            'mexico',
            'Coacalco, Edo de México',
            'ESTADO DE MÉXICO',
            'Estado de M?xico',
            'ESTADO DE MEXICO',
            'edo. mexico',
            'La Paz',
            'Estado de México',
            'Zumpango',
            'toluca',
            'TOLUCA',
          ].includes(regionNameTrimmed) && { regionName: 'México' }),
          // Apparently in 2016 this got changed to Ciudad de México from Distrito Federal
          ...([
            'Ciudad de mexico',
            'ciudad de mexico',
            'Ciudad De Mexico',
            'Ciudad de Mexico',
            'CIUDAD DE MEXICO',
            'Alvaro Obregon',
            'IZTAPALAPA.',
            'Distrito Federal',
            'D:F.',
            'MEXICO D.F.',
            'Cuauhtémoc',
            'Cuauhtemoc',
            'CDMX',
            'Cdmx',
            'DF',
            'Mexico D. F.',
            'D.F.',
            'Delegación Tlalpan',
            'd.f',
            'México D.F.',
            'df',
            'Tlalpan',
            'DISTRITO FEDERAL',
            'MEXICO CITY',
            'Distrito federal',
            'Mexico City',
            'd.f.',
            'Mexico city',
            'mexico city',
            'distrtito federal',
            'distrito federal',
            'D. F.',
            'cdmx',
            'M�xico, Distrito Federal',
            'CDMX',
            'M�xico D.F.',
            'D.F',
            'Federal District of Mexico',
          ].includes(regionNameTrimmed) && { regionName: 'Ciudad de México' }),
          ...([
            'Michoacan',
            'Michoacan de Ocampo',
            'MICHOACAN',
            'Michoacán',
            'Morelia',
            'Mich',
            'michoacán',
            'Mi hoacan',
          ].includes(regionNameTrimmed) && { regionName: 'Michoacán de Ocampo' }),
          ...([
            'Queretaro de Arteaga',
            'Queretaro',
            'Quer�taro',
            'QUERETARO',
            'Juriquilla',
          ].includes(regionNameTrimmed) && { regionName: 'Querétaro' }),
          ...([
            'Yucatan',
            'Merida',
            'MERIDA, YUCATA',
            'Merida, yucatan',
            'MERIDA, YUCATAN',
            'Cancún',
          ].includes(regionNameTrimmed) && { regionName: 'Yucatán' }),
          ...([
            'Veracruz-Llave',
            'Veracruz',
            'veracruz',
            'VERACRUZ',
            'Ver.',
            'BOCA DEL RIO',
          ].includes(regionNameTrimmed) && { regionName: 'Veracruz de Ignacio de la Llave' }),
          ...([
            'jalisco',
            'JALISCO',
            'JAL',
            'guadalajara',
            'ZAPOPAN',
            'Guadalajara',
          ].includes(regionNameTrimmed) && { regionName: 'Jalisco' }),
          ...([
            'SONORA',
            'HERMOSILLO',
            'SON',
            'Hermosillo',
          ].includes(regionNameTrimmed) && { regionName: 'Sonora' }),
          ...(regionNameTrimmed === 'chihuahua' && { regionName: 'Chihuahua' }),
          ...([
            'San Luis Potosi',
            'san luis potosi',
            'sanluispotosi',
            'SAN LUIS POTOSI',
          ].includes(regionNameTrimmed) && { regionName: 'San Luis Potosí' }),
          ...([
            'CHIAPAS',
            'HUIXTLA CHIAPAS MEXICO.',
          ].includes(regionNameTrimmed) && { regionName: 'Chiapas' }),
          ...(regionNameTrimmed === 'OAXACA' && { regionName: 'Oaxaca' }),
          ...([
            'guanajuato',
            'gto',
            'Gto',
          ].includes(regionNameTrimmed) && { regionName: 'Guanajuato' }),
          ...([
            'GUERRERO',
            'Acapulco',
            'Gro.',
          ].includes(regionNameTrimmed) && { regionName: 'Guerrero' }),
          // Appears this is the capital of the Hidalgo state in Mexico
          ...(regionNameTrimmed === 'Pachuca' && { regionName: 'Hidalgo' }),
          ...(['CULIACAN', 'SI'].includes(regionNameTrimmed) && { regionName: 'Sinaloa' }),
          // Common practice to refer to the city based on who it was named after
          // Juarez is in the state of Chihuahua
          ...([
            'Benito Juarez',
            'benito juarez',
            'Benito Juárez',
            'CD. JUAREZ',
          ].includes(regionNameTrimmed) && { regionName: 'Chihuahua' }),
          // San Andres Cholula is in Puebla Mexio which is the state
          ...([
            'sn andres cholula',
            'PUEBLA',
            'ZacatlánPue.',
          ].includes(regionNameTrimmed) && { regionName: 'Puebla' }),
          // Mexicalu B.C. Mexico B.C. is Baja California
          ...([
            'Mexicalu B.C. Mexico',
            'baja california',
            'Mexicali',
            'BAJA CALIFORNIA',
            'TIJUANA',
            'Ensenada México',
            'baja cal.',
            'Baja Calif',
            'BC',
            'BAJA CALIFORNIA SUR',
          ].includes(regionNameTrimmed) && { regionName: 'Baja California' }),
          ...([
            'Coahuila',
            'coahuila',
            'COAHUILA',
            'Torreón',
            'COahuila',
            'Torreon',
            'Monclova',
          ].includes(regionNameTrimmed) && { regionName: 'Coahuila de Zaragoza' }),
          ...(regionNameTrimmed === 'QUINTANA ROO' && { regionName: 'Quintana Roo' }),
          ...([
            'tams',
            'tam',
            'Tam',
            'matamoros',
            'TAMPICO',
          ].includes(regionNameTrimmed) && { regionName: 'Tamaulipas' }),
        }),
        // Occassionally the Canadians don't see to want to put they're from Canada
        ...(regionNameTrimmed === 'Alberta' && { countryName: 'Canada' }),
        ...(regionNameTrimmed === 'NL' && { regionName: 'Newfoundland and Labrador', countryName: 'Canada' }),
        ...(regionNameTrimmed === 'Ontario' && { countryName: 'Canada' }),

        // Canada, eh?
        ...(record.countryName === 'Canada' && {
          ...(regionNameTrimmed === 'AB' && { regionName: 'Alberta' }),
          ...(regionNameTrimmed === 'ab' && { regionName: 'Alberta' }),
          ...(regionNameTrimmed === 'alberta' && { regionName: 'Alberta' }),
          ...(regionNameTrimmed === 'BC' && { regionName: 'British Columbia' }),
          ...(regionNameTrimmed === 'bc' && { regionName: 'British Columbia' }),
          ...(regionNameTrimmed === 'BC - British Columbia' && { regionName: 'British Columbia' }),
          ...(regionNameTrimmed === 'B.C.' && { regionName: 'British Columbia' }),
          ...(regionNameTrimmed === 'b.c.' && { regionName: 'British Columbia' }),
          ...(regionNameTrimmed === 'manitoba' && { regionName: 'Manitoba' }),
          ...(regionNameTrimmed === 'NS' && { regionName: 'Nova Scotia' }),
          ...(regionNameTrimmed === 'Qc' && { regionName: 'Quebec' }),
          ...(regionNameTrimmed === 'qc' && { regionName: 'Quebec' }),
          ...(regionNameTrimmed === 'quebec' && { regionName: 'Quebec' }),
          ...(regionNameTrimmed === 'quebec' && { regionName: 'Québec' }),
          ...(regionNameTrimmed === 'Newfoundland' && { regionName: 'Newfoundland and Labrador' }),
          ...(regionNameTrimmed === 'NL' && { regionName: 'Newfoundland and Labrador' }),
          ...(regionNameTrimmed === 'ONTARIO' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'ontario' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'Ontario' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'on' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'ON' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'ont' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'Ont' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'otario' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'On' && { regionName: 'Ontario' }),
          ...(regionNameTrimmed === 'Yukon Territory', { regionName: 'Yukon' }),
          ...(regionNameTrimmed === 'sk', { regionName: 'Saskatchewan' }),
          ...(regionNameTrimmed === 'New-Brunswick' && { regionName: 'New Brunswick' }),
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
          'French Antilles',
          // Someone's name is in the wrong field
          'Diego Garcia',
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
          'Mb',
          'Armed Forces Europe, Midd',
          'Armed Forces Europe, Middle East, & Canada',
          'Armed Forces Pacific',
          'Armed Forces Americas',
          '4186511',
          // Could be a city/state in the U.S., Mexico or Yemen
          'San',
          // In Brazil
          'Sao Paulo',
          // In India
          'Tamil Nadu',
          '53280',
          // I don't want to know
          '________',
          // Appears to be a town in the U.K
          'Slough',
          '6441093412',
          '5515054100',
          // Is a country
          'GUATEMALA',
          '7291619463',
          '123',
          '52-55-4390-4729',
          // In Ethiopia
          'Adis Abeba',
          '*',
          // In Colombia
          'Narino',
          // In India
          'kerala',
          '4448129446',
          // In Chile
          'Araucania',
          // In Indonesia
          'Jakarta Raya',
          // Potentially somewhere in Mexico but unsure where
          'SOLTERO(A)',
          // In Slovenia
          'Maribor',
          // In Iran
          'Lorestan',
          'Kordestan',
          // In Philippines
          'Quezon City',
          '* Other',
          'N/A',
          'Selecciona un estado',
          'na',
          'Non us',
          'Centre',
          // In China
          'Shanghai',
          // In Netherlands
          'Noord-Holland',
          'N / A (N / A)',
          'i',
          'no',
          'T\'ai-wan',
        ].includes(regionNameTrimmed) && {
          regionName: undefined,
        }),
      }), {});
      const { countryName } = filtered;
      const countryCode = countryName ? await getCountryCode(countryName) : undefined;
      const validCC = ['US', 'MX', 'CA'].includes(countryCode);
      if (!filtered._id) throw new Error('Missing `_id` column, verify CSV!');
      const { _id } = filtered;
      if (!isInternal) delete filtered._id;
      // Strip trailing periods if applicable
      const email = normalizeEmail(filtered.email).replace(/\.+$/, '');
      const [, domain] = email.split('@');
      const externalId = Buffer.from(_id).toString('base64');
      const normalized = {
        // Null out nullish values
        ...(Object.keys(filtered).reduce((obj, key) => {
          const v = filtered[key];
          return { ...obj, [key]: ['null', 'NULL', '\''].includes(v) ? null : v };
        }, {})),
        ...(!isInternal && {
          externalId: {
            // @todo Use util?
            _id: `backoffice.smg.member*${externalId}~base64`,
            identifier: { value: externalId, type: 'base64' },
            namespace: { provider: 'backoffice', tenant: 'smg', type: 'member' },
          },
        }),
        email,
        domain,
        verified: false,
        receiveEmail: filtered.receiveEmail === 'TRUE',
        // country is valid/not typo'd
        ...(countryName && { countryCode }),
        // region/state codes are set properly
        ...(filtered.regionName && validCC && {
          regionCode: await getRegionCode({ name: filtered.regionName, countryCode }),
        }),
        // values for custom questions map to valid answers
        customBooleanFieldAnswers: await mapBooleanAnswers(record),
        customSelectFieldAnswers: await mapSelectAnswers(record, errorOnBadAnswer),
      };
      if (!validator.isEmail(normalized.email)) throw new Error(`${normalized.email} is not a valid email address.`);

      // Manually remove extra data
      delete normalized.last_email_opened;
      delete normalized.date_of_last_session;

      const allowedFields = [
        'email',
        'domain',
        'verified',
        'receiveEmail',
        'givenName',
        'familyName',
        'organization',
        'organizationTitle',
        'city',
        'regionCode',
        'regionName',
        'postalCode',
        'phone',
        'countryName',
        'countryCode',
        'customSelectFieldAnswers',
        'customBooleanFieldAnswers',
        'externalId',
        ...fieldMap.keys(),
      ];

      const extraFields = Object.keys(normalized).reduce((arr, key) => ([
        ...arr,
        ...(allowedFields.includes(key) ? [] : [key]),
      ]), []);

      if (extraFields.length) throw new Error(`Unexpected extra fields: ${extraFields}`);

      valid.push(normalized);
    } catch (e) {
      log('record failed', record.email, e);
      // throw e;
    }
  });

  log(badAnswers);

  return valid;
};
