// require('events').EventEmitter.defaultMaxListeners = 11


const Crawler = require("crawler");
const DB = require('./custom-db');
const parser = require('url-parse');
const lodash = require('lodash');

var db = new DB();



db.db.run('CREATE TABLE IF NOT EXISTS Webpage (URL TEXT PRIMARY KEY , Host TEXT);', (err) => {
    if (err) {
        console.log('ERROR!', err)
    }
    else {
        console.log("Table created successfully")
    }
})




// db.parallelize(db.select, "google.com")
// db.parallelize(db.insert, ["http://pandarian.radni.ir", "radni.ir"])
// db.close()

