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

// console.log(greedyMode);
var baseURLS;
var baseURL;

if(greedyMode === true) {
    baseURLS = JSON.parse(process.env.npm_package_config_baseURLS);
}
else {
    baseURL = JSON.parse(process.env.npm_package_config_baseURLS)[0];
    url = parser(baseURL, true).hostname;
}



console.log(`Start crawling from base ${baseURLS || baseURL} with batch size of ${batchSize} and with ${depth} depth`);
console.log(`Greedy mode is ${greedyMode}`);



// tmp = parser(baseURL, true)
// console.log(tmp)


var counter = 0;
var beforeTime = new Date();
var urls = new Set();

var temp_index = 0;
function cb(error, res, done) {
    // counter++;
    if (error) {
        console.log(error);
        done()
    } else {
        // console.log(res.options);
        var $ = res.$;
        console.log(res.request.uri.href + " link numbers:" + urls.size + " website crawled: " + ++temp_index + " counter: " + counter);

        if ($) {
            var tags = $("a");
            tags.not('[href^="http"],[href^="https"],[href^="mailto:"],[href^="#"]').each(function() {
                // console.log(global);
                // console.log(res.document);

                $(this).attr('href', function(index, value) {

                    // console.log(res.options.uri);
                    if (value) {
                        if (value.substr(0, 2) === "//") {
                            return "http:" + value
                        }
                        else if (value.substr(0, 1) !== "/") {
                            try {
                                // console.log("bbb", value);
                                value = window.location.pathname + value;
                            } catch (err) {
                                // console.log("ee")
                            }
                        }
                    }
                    return parser(res.options.uri).origin + value;
                });
            });
            // console.log("inja" + " " + res.body)
            // console.log($)
            var new_links = [];
            for (var a = 0; a < tags.length; a++) {
                // console.log(JSON.stringify(tags[a].attribs)+ " " + tags.length)

                if (tags[a].attribs.href) {
                    // console.log(res.request.uri.href)
                    // console.log("oon", tags[a].attribs.href)

                    if (tags[a].attribs.href.startsWith("www") || tags[a].attribs.href.startsWith("http") ||
                        tags[a].attribs.href.startsWith("https")) {
                        // console.log(res.request.uri.href)
                        // console.log("in", tags[a].attribs.href)
                        // console.log(parser(baseURL, true))

                        try {
                            // temp = [];
                            // temp.push(tags[a].attribs.href, parser(tags[a].attribs.href, true).hostname);
                            // console.log(temp)
                            // console.log(temp)
                            new_links.push(tags[a].attribs.href, parser(tags[a].attribs.href, true).hostname);
                            // console.log("asan inn??")

                            if (greedyMode === true) {
                                // console.log("inja", tags[a].attribs.href);
                                urls.add(tags[a].attribs.href)
                            }
                            else {
                                if (parser(tags[a].attribs.href, true).hostname === parser(baseURL, true).hostname) {
                                    // console.log("inja", tags[a].attribs.href);
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
            // console.log("hereee")
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
        // console.log("here", options.uri)
        if (counter < batchSize) {
            // console.log(time_int)
            // options.my_index = ++counter;
            counter++;
            // console.log(options);
            // console.log("in pre:", options.uri)
            setTimeout(done, time_int);
        }
        else {
            err = {
                op: "abort"
            };
            done(err)
            // console.log("ine?!")
            // console.log(urls);
            // console.log("depth:", depth, " counter:", counter)
            // console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds());
            // console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
        }
    },
    callback: cb
});
c.on('drain', function () {
    // console.log(urls);
    console.log("Depth of iteration:", depth);
    console.log("Number of crawled pages:", counter);
    console.log("Time of execution:", new Date() - beforeTime, "milliseconds");
    // console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds());
    // console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());
    if (batchSize > counter) {
        // console.log("in iff")
        if (depth > 0) {
            console.log(urls.size);
            depth--;

            // if (urls.size > index)
            //     c.queue(Array.from(urls)[index++]);
            c.queue(Array.from(urls));
        }
    }
});

if(greedyMode === true){
    c.queue(baseURLS)
} else {
    console.log(baseURL);
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


