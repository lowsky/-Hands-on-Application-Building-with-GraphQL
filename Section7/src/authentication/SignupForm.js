import React, { Component } from 'react';

import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import AuthForm from './AuthForm';
import PropTypes from 'prop-types';

class SignUpFormComponent extends Component {
  state = { errors: [] };

  onSubmit({ name, email, password, avatarUrl }) {
    const { mutate, successfulSignup } = this.props;

    mutate({
      variables: {
        name,
        email,
        password,
        avatarUrl,
      },
    })
      .then(() => {
        successfulSignup();
      })
      .catch(res => {
        const errors = res.graphQLErrors.map(
          error => error.message
        );
        this.setState({ errors });
      });
  }

  render() {
    return (
      <div>
        <h1>Sign Up</h1>
        <AuthForm
          signUp
          onSubmit={formData =>
            this.onSubmit(formData)
          }
          errors={this.state.errors}
        />
      </div>
    );
  }
}

const SIGNUP_MUTATION = gql`
  mutation SignupMutation(
    $email: String!
    $password: String!
    $name: String!
    $avatarUrl: String
  ) {
    signup(
      email: $email
      password: $password
      name: $name
      avatarUrl: $avatarUrl
    ) {
      token
    }
  }
`;

export const SignupForm = ({ successfulLogin }) => (
  <Mutation mutation={SIGNUP_MUTATION}>
    {mutate => {
      return (
        <SignUpFormComponent
          mutate={mutate}
          successfulLogin={successfulLogin}
        />
      );
    }}
  </Mutation>
);

SignupForm.propTypes = {
  successfulLogin: PropTypes.func,
};
