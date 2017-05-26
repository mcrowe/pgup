#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const pgp = require("pg-promise");
if (process.argv.length < 3) {
    console.log('Usage: pgup [connection_string]');
    process.exit(1);
}
const PORT = process.env.PORT || 3876;
const DATABASE_URL = process.argv[2];
const db = pgp()(DATABASE_URL);
console.log('Connected to database at: ' + DATABASE_URL);
const app = express();
// Basic request logging
app.use(morgan('tiny'));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Enable CORS on all resources
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.post('/query', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { sql } = req.body;
    try {
        const data = yield db.any(req.body.sql);
        res.status(200).json({ error: null, data: data });
    }
    catch (e) {
        console.error(`Error running sql '${sql}': '${e}'`);
        res.status(500).json({ error: e.message, data: null });
    }
}));
app.listen(PORT, () => {
    console.log(`Ready and listening on port ${PORT}`);
});
