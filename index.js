const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectdb } = require('./lib/database');

const app = express();

const port = Number(
    process.env.SERVER_PORT ||
    process.env.PORT ||
    8000
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function start() {
    try {
        await connectdb();

        const pairRouter = require('./Nox');
        app.use('/', pairRouter);

        app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 SCANTY MD BOT running on 0.0.0.0:${port}`);
        });

    } catch (error) {
        console.error('❌ Startup failed:', error);
        process.exit(1);
    }
}

start();

module.exports = app;
