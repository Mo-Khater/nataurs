const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.database.replace(
  'password',
  process.env.databasepassword,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('successful connected to data base');
  });

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`listen to port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

