const express = require('express');
const router = express.Router();
const sendError = require('../services/SendError');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '/../public/');

router.post('/', async function (req, res) {
    if (req.busboy) {
        req.busboy.on('file', (_, file, info) => {
            const filename = info.filename;
            console.log(`Upload of '${filename}' started`);
     
            const fstream = fs.createWriteStream(path.join(uploadPath, filename));
            file.pipe(fstream);
     
            fstream.on('close', () => {
                console.log(`Upload of '${filename}' finished`);
                res.json({ success: true, msg: `File ${filename} uploaded successfully.`})
            });
            fstream.on('error', (err) => {
                sendError(res, err);
            })
        });
        req.pipe(req.busboy);
    } else {
        sendError(res, "Not valid content type, require form data.");
    }
});

module.exports = router