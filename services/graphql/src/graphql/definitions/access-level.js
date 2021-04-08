const { gql } = require('apollo-server-express');

module.exports = gql`

extend type Query {
  accessLevel(input: AccessLevelQueryInput!): AccessLevel # must be public
  accessLevels(input: AccessLevelsQueryInput = {}): AccessLevelConnection! @requiresApp # must be public
  matchAccessLevels(input: MatchAccessLevelsQueryInput!): AccessLevelConnection @requiresAppRole
}

extend type Mutation {
  createAccessLevel(input: CreateAccessLevelMutationInput!): AccessLevel! @requiresAppRole(roles: [Owner, Administrator, Member])
  updateAccessLevel(input: UpdateAccessLevelMutationInput!): AccessLevel! @requiresAppRole(roles: [Owner, Administrator, Member])
}

enum AccessLevelSortField {
  id
  name
  createdAt
  updatedAt
}

type AccessLevel {
  id: String! @projection(localField: "_id")
  name: String! @projection
  description: String @projection
  createdAt: Date @projection
  updatedAt: Date @projection
  messages: AccessLevelMessages @projection
}

type AccessLevelConnection @projectUsing(type: "AccessLevel") {
  totalCount: Int!
  edges: [AccessLevelEdge]!
  pageInfo: PageInfo!
}

type AccessLevelEdge {
  node: AccessLevel!
  cursor: String!
}

type AccessLevelMessages {
  loggedInNoAccess: String
  loggedOutNoAccess: String
}

input AccessLevelQueryInput {
  id: String!
}

input AccessLevelsQueryInput {
  sort: AccessLevelSortInput = {}
  pagination: PaginationInput = {}
}

input AccessLevelSortInput {
  field: AccessLevelSortField = id
  order: SortOrder = desc
}

input CreateAccessLevelMutationInput {
  name: String!
  description: String
  messages: AccessLevelMessagesInput
}

input MatchAccessLevelsQueryInput {
  sort: AccessLevelSortInput = {}
  pagination: PaginationInput = {}
  field: String!
  phrase: String!
  position: MatchPosition = contains
  excludeIds: [String!] = []
}

input UpdateAccessLevelMutationInput {
  id: String!
  payload: UpdateAccessLevelPayloadInput!
}

input UpdateAccessLevelPayloadInput {
  name: String!
  description: String
  messages: AccessLevelMessagesInput
}

input AccessLevelMessagesInput {
  loggedInNoAccess: String
  loggedOutNoAccess: String
}

`;
