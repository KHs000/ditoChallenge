const express     = require("express");
const bodyParser  = require("body-parser");
const mysql       = require("mysql");
const configFile  = require("./config/local");

const app = express();

const port = 9090;

const db = mysql.createConnection({
    host: configFile.host,
    user: configFile.user,
    password: configFile.pass,
    database: configFile.db
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to DB.");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    require('./app/routes')(app, db);
    app.listen(port, _ => console.log(`Alive @ ${port}`));
});
