/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
/* http link */
import { createHttpLink } from 'apollo-link-http';
/* ws link */
import { WebSocketLink } from 'apollo-link-ws';

import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink, split } from 'apollo-link';

import { ApolloNetworkStatusProvider } from 'react-apollo-network-status';

import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

/**/

import {
  Switch,
  Route,
  BrowserRouter,
} from 'react-router-dom';

import './App.css';

import { CoolBoard } from './components/CoolBoard';
import { Boards } from './components/Boards';
import { LoginForm } from './authentication/LoginForm';
import { SignupForm } from './authentication/SignupForm';
import { FullVerticalContainer } from './common/FullVerticalContainer';
import { ProfileHeader } from './common/ProfileHeader';
import { GeneralErrorHandler } from './common/GeneralErrorHandler';

// Create a Http link
let httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});

const middlewareAuthLink = new ApolloLink(
  (operation, forward) => {
    const token = localStorage.getItem('token');

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
    return forward(operation);
  }
);

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: `Bearer ${localStorage.getItem(
        'token'
      )}`,
    },
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const returnTrueIfSubscription = ({ query }) => {
  const { kind, operation } = getMainDefinition(query);
  return (
    kind === 'OperationDefinition' &&
    operation === 'subscription'
  );
};

// split based on operation type
const link = split(
  returnTrueIfSubscription,
  wsLink,
  middlewareAuthLink.concat(httpLink)
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <ApolloProvider client={client}>
            <ApolloNetworkStatusProvider>
              <FullVerticalContainer>
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => (
                      <React.Fragment>
                        <ProfileHeader />
                        <GeneralErrorHandler />
                        <Boards />
                      </React.Fragment>
                    )}
                  />

                  <Route
                    exact
                    path="/board/:id"
                    render={({ match }) => (
                      <React.Fragment>
                        <ProfileHeader />
                        <GeneralErrorHandler />
                        <DndProvider
                          backend={HTML5Backend}>
                          <CoolBoard
                            boardId={match.params.id}
                          />
                        </DndProvider>
                      </React.Fragment>
                    )}
                  />

                  <Route
                    exact
                    path="/login"
                    render={({ history }) => (
                      <LoginForm
                        successfulLogin={token => {
                          localStorage.setItem(
                            'token',
                            token
                          );
                          client
                            .resetStore()
                            .then(() => {
                              history.push(`/`);
                            });
                        }}
                      />
                    )}
                  />

                  <Route
                    exact
                    path="/signup"
                    render={({ history }) => (
                      <SignupForm
                        successfulSignup={() => {
                          history.push('/login');
                        }}
                      />
                    )}
                  />

                  <Route
                    exact
                    path="/logout"
                    render={({ history }) => {
                      localStorage.removeItem('token');
                      client.resetStore().then(() => {
                        history.push(`/`);
                      });
                      return (
                        <p>
                          Please wait, logging out ...
                        </p>
                      );
                    }}
                  />
                </Switch>
              </FullVerticalContainer>
            </ApolloNetworkStatusProvider>
          </ApolloProvider>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
