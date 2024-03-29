const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  segment(input: SegmentQueryInput!): Segment
  segments(input: SegmentsQueryInput = {}): SegmentConnection! @requiresAppRole
  matchSegments(input: MatchSegmentsQueryInput!): SegmentConnection! @requiresAppRole
}

extend type Mutation {
  createSegment(input: CreateSegmentMutationInput!): Segment! @requiresAppRole(roles: [Owner, Administrator, Member])
  updateSegment(input: UpdateSegmentMutationInput!): Segment! @requiresAppRole(roles: [Owner, Administrator, Member])
}

enum SegmentSortField {
  id
  name
  createdAt
  updatedAt
}

type Segment {
  id: String! @projection(localField: "_id")
  context: ApplicationContext @projection(localField: "appContextId")
  name: String! @projection
  description: String @projection
  active: Boolean @projection
  rules: [SegmentRule!]! @projection(localField: "rules")
  createdAt: Date @projection
  updatedAt: Date @projection
}

type SegmentRule {
  id: String! @projection(localField: "_id")
  conditions: [SegmentRuleCondition!]!
}

type SegmentRuleCondition {
  id: String! @projection(localField: "_id")
  field: SelectField!
  answer: SelectFieldOption!
}

type SegmentConnection @projectUsing(type: "Segment") {
  totalCount: Int!
  edges: [SegmentEdge]!
  pageInfo: PageInfo!
}

type SegmentEdge {
  node: Segment!
  cursor: String!
}

input CreateSegmentMutationInput {
  name: String!
  appContextId: ObjectID
  active: Boolean! = true
  description: String
  rules: [SegmentRuleMutationInput!]! = []
}

input SegmentRuleMutationInput {
  question: String!
  answer: String!
}

input MatchSegmentsQueryInput {
  sort: SegmentSortInput = {}
  pagination: PaginationInput = {}
  field: String!
  phrase: String!
  position: MatchPosition = contains
  excludeIds: [String!] = []
}

input SegmentQueryInput {
  id: String!
}

input SegmentsQueryInput {
  "If specified, limit results to segments with a matching context id."
  appContextId: ObjectID
  sort: SegmentSortInput = {}
  pagination: PaginationInput = {}
}

input SegmentSortInput {
  field: SegmentSortField = id
  order: SortOrder = desc
}

input UpdateSegmentPayloadInput {
  name: String!
  appContextId: ObjectID
  active: Boolean! = true
  description: String
  rules: [SegmentRuleMutationInput!]! = []
}

input UpdateSegmentMutationInput {
  id: String!
  payload: UpdateSegmentPayloadInput!
}

`;
