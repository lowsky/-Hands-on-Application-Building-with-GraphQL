import React, { Component } from 'react';

import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import AuthForm from './AuthForm';
import PropTypes from 'prop-types';

class LoginFormComponent extends Component {
  state = { errors: [] };

  onSubmit(formData) {
    const { mutate, successfulLogin } = this.props;

    try {
      mutate({
        variables: formData,
      })
        .then(({ data }) => {
          const {
            login: { token },
          } = data;

          successfulLogin(token);
        })

        .catch(res => {
          const errors = res.graphQLErrors.map(
            error => error.message
          );

          console.error('login failed', res);

          this.setState({ errors });
        });
    } catch (ex) {
      const errors = [
        `Login unsuccessful! Details: ${ex.message}`,
      ];

      this.setState({ errors });
    }
  }

  render() {
    return (
      <div>
        <h1>Login</h1>
        <AuthForm
          onSubmit={formData =>
            this.onSubmit(formData)
          }
          errors={this.state.errors}
        />
      </div>
    );
  }
}

LoginFormComponent.propTypes = {
  successfulLogin: PropTypes.func,
  mutate: PropTypes.func,
};

const LOGIN_MUTATION = gql`
  mutation LoginMutation(
    $email: String!
    $password: String!
  ) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const LoginForm = ({ successfulLogin }) => (
  <Mutation mutation={LOGIN_MUTATION}>
    {mutate => {
      return (
        <LoginFormComponent
          mutate={mutate}
          successfulLogin={successfulLogin}
        />
      );
    }}
  </Mutation>
);

LoginForm.propTypes = {
  successfulLogin: PropTypes.func,
};
