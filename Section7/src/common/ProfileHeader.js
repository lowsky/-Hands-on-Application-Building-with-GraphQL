import React from 'react';

import gql from 'graphql-tag';
import {
  Container,
  Icon,
  Image,
  Loader,
} from 'semantic-ui-react';

import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';

const ProfileHeaderContainer = ({ children }) => (
  <Container
    fluid
    textAlign="right"
    style={{
      color: 'white',
      padding: '1em',
      background: 'lightgrey',
    }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        placeContent: 'space-between',
      }}>
      <div style={{ flexGrow: 1, textAlign: 'start' }}>
        <Link to="/">
          <span>Home</span>
        </Link>
      </div>
      {children}
    </div>
  </Container>
);

export const ProfileHeader = () => (
  // { options: { fetchPolicy: 'network-only' } }
  <Query
    query={gql`
      {
        me {
          email
          id
          name
          avatarUrl
        }
      }
    `}>
    {({ loading, error, data }) => {
      if (loading) {
        return (
          <ProfileHeaderContainer>
            <Loader active />
            Loading user...
          </ProfileHeaderContainer>
        );
      }

      if (error) {
        return (
          <ProfileHeaderContainer>
            <Link to="/login">
              <Icon size="big" name="sign in" />
              Log in
            </Link>
          </ProfileHeaderContainer>
        );
      }

      const {
        me: { avatarUrl, name },
      } = data;

      return (
        <ProfileHeaderContainer>
          <span>{name} </span>
          {avatarUrl && (
            <Image src={avatarUrl} avatar spaced />
          )}

          <Link to="/logout">
            <Icon name="log out" />
            Logout
          </Link>
        </ProfileHeaderContainer>
      );
    }}
  </Query>
);
