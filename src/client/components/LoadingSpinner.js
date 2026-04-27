import React from 'react';

export default ({visible}) => {
  const spinner = (
    <div className="loading-spinner">
      <h1>LADDAR</h1>
      <div className="spinner wave">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
  
  return visible ? spinner : null;
};
