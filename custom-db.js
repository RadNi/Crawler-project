const sqlite3 = require('sqlite3').verbose();

class DataBaseException extends Error{
    constructor(message, code) {
        super(message);
        this.name = message;
        this.code = code
    }

}

class CustomDataBase{
    constructor(){

        CustomDataBase.prototype.db = new sqlite3.Database('./db/test.db', (err) => {
            // throw new DataBaseException("Hello", 53);

            if (err) {
                console.log(err)
                console.error(err.message);
                throw new DataBaseException(err.message, err.errno)
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
                console.log(err)
                return console.error(err.message);
            }
            // console.log(`Rows inserted ${this.changes}`);
        });
    }
    select(host, cb) {
        let sql = `SELECT URL, Host
           FROM Webpage
           WHERE Host = ?`;

        CustomDataBase.prototype.db.all(sql, [host], (err, rows) => {
            if (err) {
                console.log(err)
                return console.error(err.message);
            }
            // console.log("innnnnn")
            // console.log(rows)
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
