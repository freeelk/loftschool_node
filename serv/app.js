const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

app.use(bodyParser.text());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../dist')));
app.use('/', require('./routes/index'));

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({error: err.message});
});

const sequelize = require('./db-connection');
sequelize.sync();

const server = app.listen(process.env.PORT || 3000, function () {
  console.log('Сервер запущен на порте: ' + server.address().port);
});

const io = require('socket.io').listen(server);
const chat = require('./chat');
chat(io);
