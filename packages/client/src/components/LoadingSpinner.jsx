export default ({ visible }) => {
  const spinner = (
    <div className="loading-spinner">
      <h1>LADDAR</h1>
    </div>
  );

  return visible ? spinner : null;
};
