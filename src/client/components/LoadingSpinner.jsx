import React from 'react';
import Spinner from 'react-spinkit';

export default ({visible}) => {
  const spinner = (
    <div className="loading-spinner">
      <h1>LADDAR</h1>
      <Spinner name="wave" />
    </div>
  );
  
  return visible ? spinner : null;
};
