const { createError } = require('micro');
const { createRequiredParamError, createParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;

const { Application } = require('../../mongodb/models');
const BooleanField = require('../../mongodb/models/field/boolean');
const SelectField = require('../../mongodb/models/field/select');
const prepareExternalId = require('./utils/prepare-external-id');

const updateSelect = async ({
  id,
  application,
  payload,
} = {}) => {
  const select = await SelectField.findByIdForApp(id, application._id);
  if (!select) throw createError(404, `No select field was found for '${id}'`);

  const {
    name,
    label,
    multiple,
    required,
    active,
    externalId: eid,
    options,
    groups,
  } = payload;

  const optionsWithIds = options.filter(option => option.id);
  const currentOptionIds = select.options.map(option => `${option._id}`);
  optionsWithIds.forEach((option) => {
    if (!currentOptionIds.includes(option.id)) throw createError(404, `No select option found for ${option.id} in question ${id}`);
  });

  const externalId = prepareExternalId(eid);

  select.set({
    name,
    label,
    multiple,
    required,
    active,
    externalId,
    options: options.sort((a, b) => a.index - b.index).map(option => ({
      ...option,
      ...(option.id && { _id: option.id }),
      externalIdentifier: externalId ? option.externalIdentifier : null,
    })),
    groups: groups.sort((a, b) => a.index - b.index).map(group => ({
      ...group,
      ...(group.id && { _id: group.id }),
    })),
  });

  await select.save();
  return select;
};
const updateBoolean = async ({
  id,
  application,
  payload,
} = {}) => {
  const boolean = await BooleanField.findByIdForApp(id, application._id);
  if (!boolean) throw createError(404, `No boolean field was found for '${id}'`);

  const {
    name,
    label,
    required,
    active,
    externalId: eid,
    whenTrue,
    whenFalse,
  } = payload;

  const externalId = prepareExternalId(eid);

  boolean.set({
    name,
    label,
    required,
    active,
    externalId,
  });

  // types must be set before values so the internal cast function sees the new type before
  // converting the value.
  boolean.set('whenTrue.type', whenTrue.type);
  boolean.set('whenTrue.value', whenTrue.value);
  boolean.set('whenFalse.type', whenFalse.type);
  boolean.set('whenFalse.value', whenFalse.value);

  await boolean.save();
  return boolean;
};

module.exports = async ({
  id,
  type,
  applicationId,
  payload = {},
} = {}) => {
  if (!id) throw createRequiredParamError('id');
  const supportedTypes = ['select', 'boolean'];
  if (!supportedTypes.includes(type)) throw createParamError('type', type, supportedTypes);
  if (!applicationId) throw createRequiredParamError('applicationId');

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  // for now, only select field types are supported.
  try {
    switch (type) {
      case 'boolean':
        return updateBoolean({ id, application, payload });
      default:
        return updateSelect({ id, application, payload });
    }
  } catch (e) {
    throw handleError(createError, e);
  }
};
