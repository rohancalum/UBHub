const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const path = require("path");
const request = require('request');
const config = require('../config.js');

router.get('/', function(req, res, next) {
    res.render('news', {username: req.session.user});
});


module.exports = router;