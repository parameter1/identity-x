import gql from 'graphql-tag';

export default gql`
  fragment AppUserListFragment on AppUser {
    id
    email
    domain
    name
    givenName
    familyName
    accessLevels {
      id
      name
    }
    teams {
      id
      name
    }
    street
    addressExtra
    mobileNumber
    phoneNumber
    city
    countryCode
    country {
      id
      name
      flag
    }
    regionCode
    region {
      id
      name
    }
    postalCode
    organization
    organizationTitle
    verified
    lastLoggedIn
    receiveEmail
    regionalConsentAnswers {
      id
      given
      policy {
        id
        name
      }
    }
    forceProfileReVerification
    mustReVerifyProfile
    profileLastVerifiedAt
  }
`;
