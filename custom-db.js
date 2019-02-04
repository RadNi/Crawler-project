const sqlite3 = require('sqlite3').verbose();

class CustomDataBase{
    constructor(){

        CustomDataBase.prototype.db = new sqlite3.Database('./db/test.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the test database.');
        });
    }
    parallelize(func, input){
        // return CustomDataBase.prototype.db.parallelize(() => {
        //     let p = func(input);
        // });
        func(input)
    }
    insert(urls) {
        let num = Array.apply(null, {length: urls.length/2}).map(Number.call, Number);
        let placeholders = num.map((i) => '(?, ?)').join(',');
        let sql = 'INSERT OR IGNORE INTO Webpage(URL, Host) VALUES ' + placeholders;
        // console.log(sql)
        CustomDataBase.prototype.db.run(sql, urls, function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Rows inserted ${this.changes}`);
        });
    }
    select(host, cb) {
        let sql = `SELECT URL, Host
           FROM Webpage
           WHERE Host = ?`;

        CustomDataBase.prototype.db.all(sql, [host], (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            cb(rows)
        });

        // temp = rows
        // console.log(temp)
        // return CustomDataBase.prototype.db.temp
    }
    close(){
        this.db.close()
    }
}


module.exports = CustomDataBase;
