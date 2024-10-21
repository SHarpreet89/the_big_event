const mongoose = require('mongoose');

const devUri = 'mongodb://localhost:27017/thebigevent';
const prodUri = process.env.MONGODB_URI;

const mongoUri = process.env.NODE_ENV === 'production' ? prodUri : devUri;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

module.exports = mongoose.connection;