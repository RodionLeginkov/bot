const express = require('express');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const config = require('./config').app;
const ping = require('./routes/ping');

const app = express();

app.use(bodyParser.json());

require('./jobs').start();

app.use(requestIp.mw());
app.use('/', ping);
app.listen(config.port);
module.exports = app;
