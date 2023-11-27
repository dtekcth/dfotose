export function abortOnError(err, res) {
  if (err) {
    res.status(500);
    res.send(err);

    throw err;
  }
}
