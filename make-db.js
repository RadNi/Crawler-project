const DB = require('./custom-db');

var db = new DB();



db.db.run('CREATE TABLE IF NOT EXISTS Webpage (URL TEXT PRIMARY KEY , Host TEXT);', (err) => {
    if (err) {
        console.log('ERROR!', err)
    }
    else {
        console.log("Table created successfully")
    }
});
