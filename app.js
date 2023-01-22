const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

const TrelloAutomation = require('./services/TrelloAutomation');

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.post('/prtotrello', async (req, res) => {
    var branchName = req.query.branchName;
    res.json(await TrelloAutomation.attachPullResuest(branchName));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})