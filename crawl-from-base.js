// require('events').EventEmitter.defaultMaxListeners = 11


const Crawler = require("crawler");
const DB = require('./custom-db');
const parser = require('url-parse');
const lodash = require('lodash');

var db = new DB();
var baseURL = JSON.parse(process.env.npm_package_config_baseURLS);
var batchSize = process.env.npm_package_config_batchSize;
var depth = process.env.npm_package_config_depth;

console.log(`Start crawling from base ${baseURL} with batch size of ${batchSize} and with ${depth} depth`);



url = parser(baseURL, true).hostname;
console.log(url);
// tmp = parser(baseURL, true)
// console.log(tmp)

db.select(url, function (rows) {
    var temp = [];
    var counter = 0;
    // console.log(rows)
    for (var i = 0; i < rows.length; i++)
        temp.push(rows[i].URL)

    if (temp.length >= batchSize)
        temp = lodash.sampleSize(temp, batchSize);

    // console.log(temp);
    urls = new Set(temp);

    // var urls = new Set();


    var beforeTime = new Date();


    var c = new Crawler({
        maxConnections: 100000,
        retries: 0,
        skipDuplicates: true,
        preRequest: function(options, done) {
            // console.log("here", counter)
            counter ++;
            if(counter < batchSize) {
                done();
            }
            else {
                // console.log("ine?!")
                // console.log(urls);
                // console.log("depth:", depth, " counter:", counter)
                // console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds());
                // console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
            }
        },
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
                done()
            } else {
                var $ = res.$;
                // console.log(res.request.uri.href + " link numbers:" + urls.size + " website crawled: " + counter);

                if ($) {
                    var tags = $("a");
                    // console.log("inja" + " " + res.body)
                    // console.log($)
                    for (var a = 0; a < tags.length; a++) {
                        // console.log(res.request.uri.href+ " " + tags.length)

                        if (tags[a].attribs.href) {
                            // console.log(res.request.uri.href)

                            if (tags[a].attribs.href.startsWith("www") || tags[a].attribs.href.startsWith("http") || tags[a].attribs.href.startsWith("https")) {
                                // console.log(res.request.uri.href)
                                // console.log("in", tags[a].attribs.href)
                                // console.log(parser(baseURL, true))
                                try {
                                    if (parser(tags[a].attribs.href, true).hostname === parser(baseURL, true).hostname) {
                                        // console.log("befor:", urls.size);
                                        urls.add(tags[a].attribs.href)
                                        // console.log("after:", urls.size);
                                    } else {
                                        // console.log(parser(tags[a].attribs.href, true).hostname, baseURL)
                                    }
                                    temp = []
                                    temp.push(tags[a].attribs.href, parser(tags[a].attribs.href, true).hostname)
                                    // console.log(temp)
                                    db.insert(temp)
                                }
                                catch (err){
                                    console.log(err)
                                }
                            }
                        }
                    }
                }
                else{
                    // console.log("hereee")
                }
                done();
            }
        }
    });

    c.queue(Array.from(urls));
    c.on('drain', function () {
        console.log(urls);
        console.log("depth:", depth, " counter:", counter)
        console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds());
        console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
        if(counter > 0){
            // console.log("in iff")
            if(depth > 0) {
                console.log(urls.size)
                depth--;
                c.queue(Array.from(urls));
            }
        }
    });
});




// db.parallelize(db.select, "google.com")
// db.parallelize(db.insert, ["http://pandarian.radni.ir", "radni.ir"])
// db.close()

