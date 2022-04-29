const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  "Finds all fields for the current application context. The result is paginated."
  fields(input: FieldsQueryInput = {}): FieldInterfaceConnection!
  "Matches fields based in the provided match input for the current application context. The result is paginated."
  matchFields(input: MatchFieldsQueryInput!): FieldInterfaceConnection! @requiresAppRole
  "Finds a single select field by ID."
  selectField(input: SelectFieldQueryInput!): SelectField
  "Finds a single boolean field by ID."
  booleanField(input: BooleanFieldQueryInput!): BooleanField
}

extend type Mutation {
  "Creates a new boolean field for the current application context."
  createBooleanField(input: CreateBooleanFieldMutationInput!): BooleanField! @requiresAppRole(roles: [Owner, Administrator, Member])
  "Updates an existing boolean field with the provided input."
  updateBooleanField(input: UpdateBooleanFieldMutationInput!): BooleanField! @requiresAppRole(roles: [Owner, Administrator, Member])
  "Creates a new select field for the current application context."
  createSelectField(input: CreateSelectFieldMutationInput!): SelectField! @requiresAppRole(roles: [Owner, Administrator, Member])
  "Updates an existing select field with the provided input."
  updateSelectField(input: UpdateSelectFieldMutationInput!): SelectField! @requiresAppRole(roles: [Owner, Administrator, Member])
}

enum FieldValueTypeEnum {
  BOOLEAN
  FLOAT
  INTEGER
  STRING
}

enum FieldInterfaceSortField {
  id
  name
  label
  createdAt
  updatedAt
}

interface FieldInterface {
  "The internal field ID."
  id: String! @projection(localField: "_id")
  "The field type."
  type: String! @projection(localField: "_type")
  "The internal name of the field."
  name: String! @projection
  "The user-facing field label. This is what will appear on a form."
  label: String! @projection
  "Whether the field is globally required."
  required: Boolean! @projection
  "Whether the field is currently active."
  active: Boolean! @projection
  "The date the field was created."
  createdAt: Date! @projection
  "The date the field was updated."
  updatedAt: Date! @projection
  "An external ID + namespaces associated with this custom field."
  externalId: FieldInterfaceExternalEntityId @projection
}

type FieldValue {
  type: FieldValueTypeEnum!
  value: String!
}

type FieldInterfaceConnection {
  totalCount: Int!
  edges: [FieldInterfaceEdge]!
  pageInfo: PageInfo!
}

type FieldInterfaceEdge {
  node: FieldInterface!
  cursor: String!
}

type FieldInterfaceExternalEntityId {
  id: String!
  identifier: FieldInterfaceExternalIdentifier!
  namespace: FieldInterfaceExternalNamespace!
}

type FieldInterfaceExternalIdentifier {
  value: String!
  type: String
}

type FieldInterfaceExternalNamespace {
  provider: String
  tenant: String
  type: String!
}

type BooleanField implements FieldInterface {
  "The internal field ID."
  id: String! @projection(localField: "_id")
  "The field type."
  type: String! @projection(localField: "_type")
  "The internal name of the field."
  name: String! @projection
  "The user-facing field label. This is what will appear on a form."
  label: String! @projection
  "Whether the field is globally required."
  required: Boolean! @projection
  "Whether the field is currently active."
  active: Boolean! @projection
  "The date the field was created."
  createdAt: Date! @projection
  "The date the field was updated."
  updatedAt: Date! @projection
  "An external ID + namespaces associated with this custom field."
  externalId: FieldInterfaceExternalEntityId @projection
  "The value and type of answer when true."
  whenTrue: FieldValue! @projection
  "The value and type of answer when false."
  whenFalse: FieldValue! @projection
}

type SelectField implements FieldInterface {
  "The internal field ID."
  id: String! @projection(localField: "_id")
  "The field type."
  type: String! @projection(localField: "_type")
  "The internal name of the field."
  name: String! @projection
  "The user-facing field label. This is what will appear on a form."
  label: String! @projection
  "Whether the field is globally required."
  required: Boolean! @projection
  "Whether the field is currently active."
  active: Boolean! @projection
  "The date the field was created."
  createdAt: Date! @projection
  "The date the field was updated."
  updatedAt: Date! @projection
  "An external ID + namespaces associated with this custom field."
  externalId: FieldInterfaceExternalEntityId @projection

  "Whether the select field supports multiple answers."
  multiple: Boolean! @projection
  "The select options."
  options: [SelectFieldOption!]! @projection
}

type SelectFieldOption {
  "The select option ID. Also used as the option value."
  id: String!
  "The select option label. This is the value the user will see within the form control."
  label: String!
  "The external identifier value for this option. Only used when an external ID + namespace is associated with this field."
  externalIdentifier: String
  "Whether free-form, write-in values are supported."
  canWriteIn: Boolean
}

input CreateBooleanFieldMutationInput {
  "The internal name of the field."
  name: String!
  "The user-facing field label. This is what will appear on a form."
  label: String!
  "Whether the field is globally required."
  required: Boolean = false
  "Whether the field is currently active."
  active: Boolean = true
  "The external namespace + ID for this field."
  externalId: FieldInterfaceExternalIdMutationInput
}

input CreateSelectFieldMutationInput {
  "The internal name of the field."
  name: String!
  "The user-facing field label. This is what will appear on a form."
  label: String!
  "Whether the field is globally required."
  required: Boolean = false
  "Whether the field is currently active."
  active: Boolean = true
  "Whether the select field supports multiple answers."
  multiple: Boolean = false
  "The initial options for the select field. By default, no options are set."
  options: [CreateSelectFieldOptionInput!] = []
  "The external namespace + ID for this field."
  externalId: FieldInterfaceExternalIdMutationInput
}

input CreateSelectFieldOptionInput {
  "The select option label. This is the value the user will see within the form control."
  label: String!
  "The external identifier value for this option. Only used when an external ID + namespace is associated with this field."
  externalIdentifier: String
  "Whether free-form, write-in values are supported."
  canWriteIn: Boolean = false
}

input FieldInterfaceSortInput {
  field: FieldInterfaceSortField = id
  order: SortOrder = desc
}

input FieldsQueryInput {
  sort: FieldInterfaceSortInput = {}
  pagination: PaginationInput = {}
}

input MatchFieldsQueryInput {
  sort: FieldInterfaceSortInput = {}
  pagination: PaginationInput = {}
  field: String!
  phrase: String!
  position: MatchPosition = contains
  excludeIds: [String!] = []
}

input BooleanFieldQueryInput {
  id: String!
}

input SelectFieldQueryInput {
  id: String!
}

input FieldInterfaceExternalIdMutationInput {
  "The external identifier input."
  identifier: FieldInterfaceExternalIdentifierInput!
  "The external namespace input."
  namespace: FieldInterfaceExternalNamespaceInput!
}

input FieldInterfaceExternalIdentifierInput {
  "The external identifier value."
  value: String!
  "The (optional) external identifier type - for distinguishing between different types of IDs."
  type: String
}

input FieldInterfaceExternalNamespaceInput {
  "The (optional) namespace provider."
  provider: String
  "The (optional) namespace tenant."
  tenant: String
  "The namespace model type."
  type: String!
}

input UpdateBooleanFieldMutationInput {
  "The select field identifier to update."
  id: String!
  "The internal name of the field."
  name: String!
  "The user-facing field label. This is what will appear on a form."
  label: String!
  "Whether the field is globally required."
  required: Boolean = false
  "Whether the field is currently active."
  active: Boolean = true
  "The external namespace + ID for this field."
  externalId: FieldInterfaceExternalIdMutationInput
  "The value and type of answer when true."
  whenTrue: UpdateBooleanFieldWhenTrueMutationInput = {}
  "The value and type of answer when false."
  whenFalse: UpdateBooleanFieldWhenFalseMutationInput = {}
}

input UpdateBooleanFieldWhenTrueMutationInput {
  value: String = "true"
  type: FieldValueTypeEnum = BOOLEAN
}

input UpdateBooleanFieldWhenFalseMutationInput {
  value: String = "false"
  type: FieldValueTypeEnum = BOOLEAN
}

input UpdateSelectFieldMutationInput {
  "The select field identifier to update."
  id: String!
  "The internal name of the field."
  name: String!
  "The user-facing field label. This is what will appear on a form."
  label: String!
  "Whether the field is globally required."
  required: Boolean = false
  "Whether the field is currently active."
  active: Boolean = true
  "Whether the select field supports multiple answers."
  multiple: Boolean = false
  "The external namespace + ID for this field."
  externalId: FieldInterfaceExternalIdMutationInput
  "The options for the select field. Options with IDs will be updated (where found). Options missing IDs will be treated as new."
  options: [UpdateSelectFieldOptionInput!]!
}

input UpdateSelectFieldOptionInput {
  "The select option ID. When present, the existing option will be updated. When empty, a new option will be created/assigned to the field."
  id: String
  "The select option label. This is the value the user will see within the form control."
  label: String!
  "The external identifier value for this option. Only used when an external ID + namespace is associated with this field."
  externalIdentifier: String
  "Whether free-form, write-in values are supported."
  canWriteIn: Boolean
}

`;
