// require('events').EventEmitter.defaultMaxListeners = 11


const Crawler = require("crawler");
const DB = require('./custom-db');
var parser = require('url-parse');

var db = new DB();


// var baseURLS = ['http://www.google.com/','http://www.yahoo.com', 'http://www.amazon.com', 'http://www.sharif.ir/home',
//     'http://youtube.com'];
// var depth = 3;
var counter = 0;

var baseURLS = JSON.parse(process.env.npm_package_config_baseURLS);
var batchSize = process.env.npm_package_config_batchSize;
var depth = process.env.npm_package_config_depth;

console.log(`Start crawling from base ${baseURL} with batch size of ${batchSize} and with ${depth} depth`);

var urls = new Set();

var beforeTime = new Date();


var c = new Crawler({
    maxConnections : 100000,
    retries: 1,
    skipDuplicates: true,
    // preRequest: function(options, done) {
    //
    //     // console.log("This request: ", options.uri)
    //     done();
    // },
    callback : function (error, res, done) {
        if(error){
            console.log(error);
            done()
        }else {
            var $ = res.$;
            counter ++;
            // console.log(res.request.uri.href + " link numbers:" + urls.size + " website crawled: " + counter);

            if($) {
                var tags = $("a");
                // console.log("inja" + " " + res.body)
                // console.log($)
                for (var a = 0; a < tags.length; a++) {
                    // console.log(res.request.uri.href+ " " + tags.length)

                    if (tags[a].attribs.href) {
                        // console.log(res.request.uri.href)

                        if (tags[a].attribs.href.startsWith("www") || tags[a].attribs.href.startsWith("http") || tags[a].attribs.href.startsWith("https")) {
                            // console.log(res.request.uri.href)
                            urls.add(tags[a].attribs.href)
                            temp = []
                            temp.push(tags[a].attribs.href, parser(tags[a].attribs.href, true).hostname)
                            console.log(temp)
                            db.insert(temp)
                        }
                    }
                }
            }
            else {
                // console.log("hereee")
            }
            done();
        }
    }
});

c.queue(baseURLS);
// c.queue("http://www.sharif.ir/home");
c.on('drain',function(){
    depth--;
    if (depth<=0 || counter>= batchSize) {
        console.log(urls);
        console.log("size:", urls.size, " counter:", counter)
        console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds())
        console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
        // temp = []
        // for(u of urls){
        //     temp.push(u, parser(u, true).hostname)
        // }
        // console.log(temp)
        // db.parallelize(db.insert, temp)
        db.close()

    }
    else {
        console.log("Draiinnnnnnnnnnn, "+ depth);
        console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds())
        console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
        // c.queue("http://www.sharif.ir/home")
        c.queue(Array.from(urls))
    }
});



// db.parallelize(db.select, "google.com")
// db.parallelize(db.insert, ["http://pandarian.radni.ir", "radni.ir"])
// db.close()