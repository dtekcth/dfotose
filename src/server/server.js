import express from 'express'
import mongoose from 'mongoose'

// Routes
// import fooRoutes from './routes/foo';

// mongoose.connect('mongodb://localhost/dfotose');
//

var app = express();
app.use('/', express.static(__dirname + '/public'));

// app.use(fooRoutes);
app.get('/foo', (req, res) => {
  res.send('meh meh');
});

app.listen(4000, () => {
  console.log('Listening :4000');
});
