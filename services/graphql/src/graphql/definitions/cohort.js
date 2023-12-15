const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  cohort(input: CohortQueryInput!): Cohort
  cohorts(input: CohortsQueryInput = {}): CohortConnection! @requiresAppRole
  matchCohorts(input: MatchCohortsQueryInput!): CohortConnection! @requiresAppRole
}

extend type Mutation {
  createCohort(input: CreateCohortMutationInput!): Cohort! @requiresAppRole(roles: [Owner, Administrator, Member])
  updateCohort(input: UpdateCohortMutationInput!): Cohort! @requiresAppRole(roles: [Owner, Administrator, Member])
}

enum CohortSortField {
  id
  name
  createdAt
  updatedAt
}

type Cohort {
  id: String! @projection(localField: "_id")
  name: String! @projection
  description: String @projection
  active: Boolean @projection
  # deprecated
  rules: [CohortRule!]! @projection(localField: "rules")
  photoURL: String @projection
  createdAt: Date @projection
  updatedAt: Date @projection
}

type CohortRule {
  id: String! @projection(localField: "_id")
  question: SelectField!
  answer: SelectFieldOption!
}

type CohortConnection @projectUsing(type: "Cohort") {
  totalCount: Int!
  edges: [CohortEdge]!
  pageInfo: PageInfo!
}

type CohortEdge {
  node: Cohort!
  cursor: String!
}

input CreateCohortMutationInput {
  name: String!
  active: Boolean! = true
  description: String
  rules: [CohortRuleMutationInput!]! = []
}

input CohortRuleMutationInput {
  question: String!
  answer: String!
}

input MatchCohortsQueryInput {
  sort: CohortSortInput = {}
  pagination: PaginationInput = {}
  field: String!
  phrase: String!
  position: MatchPosition = contains
  excludeIds: [String!] = []
}

input CohortQueryInput {
  id: String!
}

input CohortsQueryInput {
  sort: CohortSortInput = {}
  pagination: PaginationInput = {}
}

input CohortSortInput {
  field: CohortSortField = id
  order: SortOrder = desc
}

input UpdateCohortPayloadInput {
  name: String!
  active: Boolean! = true
  description: String
  rules: [CohortRuleMutationInput!]! = []
}

input UpdateCohortMutationInput {
  id: String!
  payload: UpdateCohortPayloadInput!
}

`;
