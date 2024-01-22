import gql from 'graphql-tag';

export default gql`
  fragment SegmentListFragment on Segment {
    id
    name
    active
    description
    rules {
      id
      conditions {
        id
        field {
          id
          name
        }
        answer {
          id
          label
        }
      }
    }
  }
`;
