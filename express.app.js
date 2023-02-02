require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const trelloRouter = require('./routers/trello');
const githubRouter = require('./routers/github');

app.use(express.json())

app.use((req, res, next) => {
    if (!req.header("x-api-key")) {
        return res.status(401).json({ error: 'No credentials sent!' });
    }
    if (req.header("x-api-key") !== process.env.M2M_314_AUTOMATION_SECRET) {
        return res.status(401).json({ error: 'Credentials incorrect!' });
    }
    next();
});

app.use('/trello', trelloRouter);
app.use('/github', githubRouter);

app.listen(port, () => {
    console.log(`314 automation add service is running, port: ${port}.`)
});