import gql from 'graphql-tag';

export default gql`
  fragment CohortListFragment on Cohort {
    id
    name
    active
    description
  }
`;
