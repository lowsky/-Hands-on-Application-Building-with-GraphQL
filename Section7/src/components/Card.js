import React from 'react';
import PropTypes from 'prop-types';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { useDrag } from 'react-dnd';
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

export const dndItemType = 'card';

export const CardForDragging = ({ ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const [collected, ref] = useDrag({
    item: {
      id: props.id,
      type: dndItemType,
      cardListId: props.cardListId,
    },
    canDrag: () => props => !!props.cardListId,
  });

  return (
    <div ref={ref}>
      <Card {...props} />
    </div>
  );
};

CardForDragging.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  ...CardComponent.propTypes,
};

CardForDragging.fragments = {
  ...CardComponent.fragments,
};

export default CardForDragging;
