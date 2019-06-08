import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { DragSource } from 'react-dnd';
import { CardComponent } from './CardComponent';

const EditCardMutation = gql`
  mutation updateCard(
    $id: ID!
    $name: String
    $description: String 
    #$old_name: String 
    #$old_description: String
  ) {
    updateCard(
      where: { id: $id }
      # where: {
      #   AND: [
      #     { id: $id }
      #     { name: $old_name }
      #     { description: $old_description }
      #   ]
      # }
      data: { name: $name, description: $description }
    ) {
      #count
      ...Card_card
    }
  }
  ${CardComponent.fragments.card}
`;

export const Card = props => (
  <Mutation
    mutation={EditCardMutation}
    variables={{
      ...props,
    }}>
    {mutation => (
      <CardComponent
        {...props}
        storeCard={vars =>
          mutation({
            variables: vars,
          })
        }
      />
    )}
  </Mutation>
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  cardListId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  storeCard: PropTypes.func,
};

const CardForDragging = ({
  connectDragSource,
  ...props
}) =>
  connectDragSource(
    <div>
      <Card {...props} />
    </div>
  );

CardForDragging.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  ...CardComponent.propTypes,
};

CardForDragging.fragments = {
  ...CardComponent.fragments,
};

const cardSource = {
  // the only important info:
  beginDrag: props => ({
    id: props.id,
    cardListId: props.cardListId, // for canDrag
  }),
  // only can be dragged to a different list
  canDrag: props => !!props.cardListId,
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

export const dndItemType = 'card';

export default DragSource(
  dndItemType,
  cardSource,
  collect
)(CardForDragging);
