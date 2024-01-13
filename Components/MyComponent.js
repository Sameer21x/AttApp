// MyComponent.tsx
import React from 'react';
import PropTypes from 'prop-types';

const MyComponent = ({ myProp }) => {
  return (
    <div>
      <p>{myProp}</p>
    </div>
  );
};

MyComponent.propTypes = {
  myProp: PropTypes.string.isRequired,
};

export default MyComponent;
