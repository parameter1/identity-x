const { gql } = require('apollo-server-express');

module.exports = gql`

extend type Query {
  organization(input: OrganizationQueryInput!): Organization! @requiresOrgRole
  activeOrganization: Organization! @requiresOrgRole
  organizationUsers: [OrganizationMembership] @requiresOrgRole
  organizationInvitations: [OrganizationInvitation] @requiresOrgRole
  organizationApplications(input: OrganizationApplicationsQueryInput = {}): [Application] @requiresOrgRole
}

extend type Mutation {
  createOrganization(input: CreateOrganizationMutationInput!): Organization! @requiresAuth
  updateOrganization(input: UpdateOrganizationMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
  setOrganizationName(input: SetOrganizationNameMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
  setOrganizationDescription(input: SetOrganizationDescriptionMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
  setOrganizationPhotoURL(input: SetOrganizationPhotoURLMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])

  setOrganizationCompanyInfo(input: SetOrganizationCompanyInfoMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])

  addOrganizationRegionalConsentPolicy(input: AddOrganizationRegionalConsentPolicyMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
  removeOrganizationRegionalConsentPolicy(input: RemoveOrganizationRegionalConsentPolicyMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
  updateOrganizationRegionalConsentPolicy(input: UpdateOrganizationRegionalConsentPolicyMutationInput!): Organization! @requiresOrgRole(roles: [Owner, Administrator])
}

enum RegionalConsentPolicyStatus {
  all
  enabled
  disabled
}

type Organization {
  id: String! @projection(localField: "_id")
  name: String! @projection
  description: String @projection
  photoURL: String @projection
  consentPolicy: String @projection
  emailConsentRequest: String @projection

  company: OrganizationCompany @projection
  regionalConsentPolicies(input: OrganizationRegionalConsentPoliciesInput = {}): [OrganizationRegionalConsentPolicy!]! @projection

  applications: [Application!]! @projection(localField: "_id")
}

type OrganizationCompany {
  id: String!
  name: String
  streetAddress: String
  city: String
  regionName: String
  postalCode: String
  phoneNumber: String
  supportEmail: String
}

type OrganizationMembership {
  id: String!
  user: User!
  organization: Organization!
  role: OrganizationRole!
  createdAt: Date
}

type OrganizationInvitation {
  id: String!
  user: User!
  organization: Organization!
  role: OrganizationRole!
  invitedBy: User!
  createdAt: Date
}

type OrganizationRegionalConsentPolicy {
  id: String!
  name: String!
  countries: [LocaleCountry!]!
  enabled: Boolean!
  message: String
  required: Boolean!
}

input OrganizationQueryInput {
  id: String!
}

input OrganizationCompanyPayloadInput {
  name: String
  streetAddress: String
  city: String
  regionName: String
  postalCode: String
  phoneNumber: String
  supportEmail: String
}

input CreateOrganizationMutationInput {
  name: String!
  description: String
  company: OrganizationCompanyPayloadInput
}

input SetOrganizationDescriptionMutationInput {
  value: String!
}

input SetOrganizationPhotoURLMutationInput {
  id: String!
  value: String!
}

input SetOrganizationNameMutationInput {
  value: String!
}

input OrganizationApplicationsQueryInput {
  sort: ApplicationSortInput = { field: name, order: asc }
}

input SetOrganizationCompanyInfoMutationInput {
  company: OrganizationCompanyPayloadInput
}

input UpdateOrganizationPayloadInput {
  name: String!
  description: String
  consentPolicy: String
  emailConsentRequest: String
}

input UpdateOrganizationMutationInput {
  id: String!
  payload: UpdateOrganizationPayloadInput!
}

input OrganizationRegionalConsentPolicyPayloadInput {
  name: String!
  countryCodes: [String!]!
  enabled: Boolean
  message: String!
  required: Boolean
}

input AddOrganizationRegionalConsentPolicyMutationInput {
  payload: OrganizationRegionalConsentPolicyPayloadInput!
}

input UpdateOrganizationRegionalConsentPolicyMutationInput {
  policyId: String!
  payload: OrganizationRegionalConsentPolicyPayloadInput!
}

input RemoveOrganizationRegionalConsentPolicyMutationInput {
  policyId: String!
}

input OrganizationRegionalConsentPoliciesInput {
  status: RegionalConsentPolicyStatus = all
}

`;
