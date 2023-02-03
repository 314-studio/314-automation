const express = require('express');
const router = express.Router();
const sendError = require('../services/SendError');
const TrelloAutomation = require('../services/TrelloAutomation');

// get card with card custom id
router.get('/cardCustomId/:cardCustomId', async function (req, res) {
    res.json(await TrelloAutomation.getCardWithCustomId(req.params.cardCustomId)
        .catch(err => sendError(res, err)));
});

// attach url to trello card attchments with card custom id. return card
router.post('/card/:cardId/attachments', async function (req, res) {
    res.json(await TrelloAutomation.attachUrl(req.params.cardId, req.query.url).
        catch(err => sendError(res, err)));
});

// move card to list with list name
router.post('/card/:cardId/lists', async function (req, res) {
    res.json(await TrelloAutomation.moveCardToList(req.params.cardId, req.query.listName)
        .catch(err => sendError(res, err)));
});

module.exports = router;