const express = require('express');
const https = require('https')
const app = express();
const fs = require('fs');


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

if (process.env.NODE_ENV === 'production') {
    const privateKey = fs.readFileSync('../certs/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('../certs/cert.pem', 'utf8');
    const ca = fs.readFileSync('../certs/chain.pem', 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(3443, () => {
        console.log('314 automation api service running on https port.');
    });
} else {
    app.listen(3000, () => {
        console.log(`314 automation api service is running on http port.`)
    });
}
