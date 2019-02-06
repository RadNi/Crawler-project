// require('events').EventEmitter.defaultMaxListeners = 11


const Crawler = require("crawler");
const DB = require('./mongo-db');
const parser = require('url-parse');
const lodash = require('lodash');

var db = new DB();

var batchSize = process.env.npm_package_config_batchSize;
var depth = process.env.npm_package_config_depth;
var maxcon = process.env.npm_package_config_maxcon;
var retries = process.env.npm_package_config_retries;
var timeout = process.env.npm_package_config_timeout;
var time_int = process.env.npm_package_config_time;
var greedyMode = process.env.npm_package_config_greedymode === "true";


var baseURLS;
var baseURL;

if(greedyMode === true) {
    baseURLS = JSON.parse(process.env.npm_package_config_baseURLS);
}
else {
    baseURL = JSON.parse(process.env.npm_package_config_baseURLS)[0];
    url = parser(baseURL, true).hostname;
    var temp_base = parser(baseURL).hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
}



console.log(`Start crawling from base ${baseURLS || baseURL} with batch size of ${batchSize} and with ${depth} depth`);
console.log(`Greedy mode is ${greedyMode}`);




var counter = 0;
var beforeTime = new Date();
var urls = new Set();

var temp_index = 0;
var temp_depth = 1;
function cb(error, res, done) {
    if (error) {
        console.log(error);
        done()
    } else {
        var current_base = parser(res.request.uri.href, true).hostname.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];

        var $ = res.$;
        console.log(res.request.uri.href + " link numbers:" + urls.size + " website crawled: " + ++temp_index + " counter: " + counter);
        if(greedyMode === false) {
            if (current_base !== temp_base) {
                console.log("Redirect link :(", parser(res.request.uri.href).hostname, parser(baseURL).hostname)
            }
        }
        if ($) {
            var tags = $("a");
            tags.not('[href^="http"],[href^="https"],[href^="mailto:"],[href^="#"]').each(function() {

                $(this).attr('href', function(index, value) {
                    if (value) {
                        if (value.substr(0, 2) === "//") {
                            return "http:" + value
                        }
                        else if (value.substr(0, 1) === "/") {
                            return parser(res.options.uri).origin + value
                        }

                        else if (value.substr(0, 1) === ".") {
                            return parser(res.options.uri).pathname + value
                        }
                        else {
                            return parser(res.options.uri).origin + "/" +value;
                        }
                    } else {
                        // console.log("what the hell", index)
                    }
                });
            });
            var new_links = [];
            for (var a = 0; a < tags.length; a++) {

                if (tags[a].attribs.href) {

                    if (tags[a].attribs.href.startsWith("www") || tags[a].attribs.href.startsWith("http") ||
                        tags[a].attribs.href.startsWith("https")) {

                        try {
                            new_links.push(tags[a].attribs.href, parser(tags[a].attribs.href, true).hostname);

                            if (greedyMode === true) {
                                urls.add(tags[a].attribs.href)
                            }
                            else {
                                if (current_base === temp_base) {
                                    urls.add(tags[a].attribs.href)
                                }
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }

                    }
                }
            }
            db.insert(new_links)
        }
        else{
            // console.log("Nooooo")
        }
        done();
    }
}
var c = new Crawler({
    maxConnections: maxcon,
    retries: retries,
    skipDuplicates: true,
    timeout: timeout,
    preRequest: function (options, done) {
        if (counter < batchSize) {
            counter++;
            setTimeout(done, time_int);
        }
        else {
            err = {
                op: "abort"
            };
            done(err)
        }
    },
    callback: cb
});
c.on('drain', function () {
    // console.log(urls);
    console.log("Depth of iteration:", depth);
    console.log("Number of crawled pages:", counter);
    console.log("Time of execution:", new Date() - beforeTime, "milliseconds");
    if (batchSize > counter) {
        if (depth >= temp_depth) {
            console.log(urls.size);
            temp_depth++;
            c.queue(Array.from(urls));
        }
    }
});

if(greedyMode === true){
    c.queue(baseURLS)
} else {
    console.log(baseURL);
    db.insert([baseURL, parser(baseURL).hostname])
    c.queue(baseURL);
    db.select(url, function (rows) {
        var temp = [];
        for (var i = 0; i < rows.length; i++)
            temp.push(rows[i].URL)

        if (temp.length >= batchSize)
            temp = lodash.sampleSize(temp, batchSize);

        urls.add(baseURL);
        urls.add(temp);
        c.queue(Array.from(urls));
    });
}


