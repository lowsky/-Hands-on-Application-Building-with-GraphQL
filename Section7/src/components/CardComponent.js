import React from 'react';
import {
  Button,
  Form,
  Icon,
  Image,
  Message,
  Modal,
  Segment,
} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import styled from 'styled-components';

export class CardComponent extends React.Component {
  constructor(props) {
    super();
    this.state = {
      name: props.name,
      description: props.description,
      showModal: false,
    };
  }

  resetForm() {
    this.setState({
      conflict: false,
      error: false,
      name: this.props.name,
      description: this.props.description,
      old_name: this.props.name,
      old_description: this.props.description,
    });
  }

  componentWillReceiveProps(newProps) {
    console.log(
      'componentWillReceiveProps()',
      newProps
    );
    if (this.state.showModal) {
      this.setState({
        conflict: { newProps },
      });
    } else {
      this.setState({
        name: newProps.name,
        description: newProps.description,
      });
    }
  }

  showAndReset = () => {
    this.setState({ showModal: true });
    this.resetForm();
  };

  saveAndHide = () => {
    const {
      id,
      storeCard = () =>
        Promise.reject({
          message: 'Sorry, not implemented yet.',
        }),
    } = this.props;

    const {
      name,
      description,
      old_name,
      old_description,
    } = this.state;

    this.setLoading();

    storeCard({
      id,
      name,
      description,
      old_name,
      old_description,
    })
      .then(() => {
        this.setLoading(false);
        this.hide();
      })
      .catch(e => {
        this.setLoading(false);
        this.setState({
          error: e.message,
        });
      });
  };

  setLoading(loading = true) {
    this.setState({ loading });
  }

  hide = () => {
    this.setState({ showModal: false });
  };

  handleChange = (e, { name, value }) =>
    this.setState({ [name]: value });

  render() {
    const {
      loading = false,
      error = false,
      conflict = false,
      name,
      description,
      showModal = false,
    } = this.state;

    const whenDraggingStyle = {
      color: 'black',
      fontWeight: 'bold',
      fontStyle: 'italic',
    };
    const {
      isDragging,
      createdAt,
      updatedAt,
      updatedBy = {},
    } = this.props;
    return (
      <CardDiv onClick={() => this.showAndReset()}>
        <Modal open={showModal} onClose={this.hide}>
          <Modal.Header>Edit Card</Modal.Header>
          <Modal.Content>
            <Form
              onSubmit={() => this.saveAndHide()}
              error={!!error}
              loading={loading}
              warning={!!conflict}>
              <Message
                warning
                header="Warning! Card was concurrently modified on server."
              />
              <Message
                error
                header="Saving Card failed"
                content={error}
              />
              <Form.Input
                fluid
                label="Task Name"
                placeholder="Enter title"
                value={name}
                name="name"
                autoFocus
                onChange={this.handleChange}
                required
              />
              <ShowDiffWarning
                newValue={this.props.name}
                currentValue={name}
              />
              <Form.TextArea
                label="Task Description"
                placeholder="Add some more details about this task ..."
                value={description}
                name="description"
                onChange={this.handleChange}
              />
              <ShowDiffWarning
                newValue={this.props.description}
                currentValue={description}
              />
            </Form>
            <Segment>
              <Message>
                <p>
                  <strong>created: </strong>
                  <TimeAgo date={createdAt} />
                </p>
                <p>
                  <strong>updated: </strong>
                  <TimeAgo date={updatedAt} />
                  <strong> by: </strong>
                  {updatedBy && (
                    <Image
                      avatar
                      src={updatedBy.avatarUrl}
                    />
                  )}
                  <span>
                    {updatedBy ? updatedBy.name : '?'}
                  </span>
                </p>
              </Message>
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            {!!conflict && (
              <Button
                color="green"
                negative
                onClick={() => {
                  this.saveAndHide();
                }}
                inverted>
                <Icon name="save" /> Overwrite
              </Button>
            )}
            {!conflict && (
              <Button
                color="green"
                onClick={() => {
                  this.saveAndHide();
                }}
                inverted>
                <Icon name="save" /> Save
              </Button>
            )}
            <Button
              color="red"
              onClick={this.hide}
              inverted>
              <Icon name="cancel" /> Close/cancel
            </Button>
          </Modal.Actions>
        </Modal>
        <span
          style={isDragging ? whenDraggingStyle : {}}>
          {this.props.name}
        </span>
      </CardDiv>
    );
  }
}

CardComponent.propTypes = {
  id: PropTypes.string.isRequired,
  cardListId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  storeCard: PropTypes.func,
  isDragging: PropTypes.bool,
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
  updatedBy: PropTypes.object,
};

CardComponent.fragments = {
  card: gql`
    fragment Card_card on Card {
      id
      name
      description
      createdAt
      updatedAt
      updatedBy {
        avatarUrl
        name
        id
      }
    }
  `,
};

const CardDiv = styled.div`
  border-radius: 3px;
  margin: 0.1em 0 0 0;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
  padding: 10px;
`;

const ShowDiffWarning = ({
  newValue,
  currentValue,
}) => (
  <Message
    warning
    size="mini"
    hidden={newValue === currentValue}>
    <b>New:</b> {newValue}
  </Message>
);

ShowDiffWarning.propTypes = {
  newValue: PropTypes.string,
  currentValue: PropTypes.string,
};
