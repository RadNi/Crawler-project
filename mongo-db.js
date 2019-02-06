var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("mydb");
//     var query = { address: /^S/ };
//     dbo.collection("customers").find(query).toArray(function(err, result) {
//         if (err) throw err;
//         console.log(result);
//         db.close();
//     });
// });

class CustomDataBase{
    constructor(){
        CustomDataBase.prototype.db = MongoClient
    }
    insert(urls) {
        CustomDataBase.prototype.db.connect(url, function(err, db) {
            var dbo = db.db("mydb");
            if (err) throw err;
            // dbo.collection("WebPages").ensureIndex({ url: 1 }, { unique: true, background: true, dropDups: true });
            var myobj = [
                // { _id: 154, name: 'Chocolate Heaven'},
                // { _id: 155, name: 'Tasty Lemon'},
                // { _id: 157, name: 'Vanilla Dream'}
            ];
            // console.loog("yooooo")
            // console.log(urls)
            for(var i = 0 ; i < urls.length ; i+=2){
                myobj.push({
                    _id:    urls[i],
                    Host:   urls[i+1]
                })
            }
            dbo.collection("WebPage").insert(myobj, {ordered: false}, function (err, res) {
                // if (err) {
                //     console.log(err)
                // }
                // console.log(res);
                dbo.close()
            });
        });
    }
    select(host, cb) {
        CustomDataBase.prototype.db.connect(url, function(err, db) {
            var dbo = db.db("mydb");
            var query = {Host: host};
            dbo.collection("WebPage").find(query).toArray(function (err, result) {
                if (err) throw err;
                result.map((obj) => {
                    obj.URL = obj._id;
                    delete obj._id;
                });
                // console.log(result);
                cb(result);
                db.close()
            });

        });
    }
    close(){
        CustomDataBase.prototype.db.close()
    }
}


module.exports = CustomDataBase;
