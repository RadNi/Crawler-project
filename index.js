// require('events').EventEmitter.defaultMaxListeners = 11


var Crawler = require("crawler");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;

var baseURLS = ['http://www.google.com/','http://www.yahoo.com', 'http://www.amazon.com', 'http://www.sharif.ir/home'];
var depth = 4
var counter = 0

var urls = new Set()

var beforeTime = new Date()


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
            console.log(res.request.uri.href + " link numbers:" + urls.size + " website crawled: " + counter);

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
                        }
                    }
                }
            }
            else {
                console.log("hereee")
            }
            done();
        }
    }
});

c.queue(baseURLS);
// c.queue("http://www.sharif.ir/home");
c.on('drain',function(){
    depth--;
    if (depth<=0) {
        console.log(urls);
        console.log("size:", urls.size, " counter:", counter)
        console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds())
        console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())


    }
    else {
        console.log("Draiinnnnnnnnnnn, "+ depth);
        console.log(beforeTime.getHours() + ":" + beforeTime.getMinutes() + ":" + beforeTime.getSeconds())
        console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds())
        // c.queue("http://www.sharif.ir/home")
        c.queue(Array.from(urls))
    }
});

