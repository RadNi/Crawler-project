var Crawler = require("crawler");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var urls = {}
var counter = 10
var c = new Crawler({
    maxConnections : 10,
    retries: 2,
    skipDuplicates: true,
    preRequest: function(options, done) {
        // 'options' here is not the 'options' you pass to 'c.queue', instead, it's the options that is going to be passed to 'request' module
        if(urls[options.uri]) {
            // console.log(options);
            urls[options.uri] = false;
            counter--;
            console.log("This request changed state to false: ", options.uri)
        }
        // when done is called, the request will start
        done();
    },
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
            done()
        }else {
            var $ = res.$;
            // console.log(res.request.uri)
//	    console.log(res.body)
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
//            console.log(res)
//             urls.push({
//                 key: $(res.request.uri),
//                 value: false
//             });
          //  urls[$(res.request.uri.href)] = true
//            const dom = new JSDOM(res.body);
            //console.log(dom.window.document.getElementsByTagName("a"));
            //console.log($("title").text());

            //console.log(res.body)
//	    for( a in dom.window.document.getElementsByTagName("a")) {
//	        console.log(a)
//	    }
//	    console.log($("a")[0].attribs.href);
            if($) {
                var tags = $("a");
                for (var a = 0; a < tags.length; a++) {
                    //console.log(tags[a]["attribs"].href)
                    // console.log(tags[a])
                    // console.log(tags[a].attribs.href)
                    if (tags[a].attribs.href) {
                        if (tags[a].attribs.href.startsWith("www") || tags[a].attribs.href.startsWith("http") || tags[a].attribs.href.startsWith("https")) {
                            // urls.push({
                            //     key: tags[a].attribs.href,
                            //     value: true
                            // });
                            // if(!urls[tags[a].attribs.href])
                                urls[tags[a].attribs.href] = true
                        }
                    }
                    //console.log($("a")[a].attr("href"))
                }
            }
//	    console.log($(document).attr("href"))
//	    $("a").forEach(function(entry) {
// 	   	 console.log(entry);
//	    });
//             console.log(urls);
            if(counter > 0){
                console.log("here" + counter)
                for(var u = 0 ; u < urls.length;u ++){
                    console.log(urls[u])
                    if(urls[u]) {
                        console.log(c.queue(urls[u]))
                        console.log(urls[u])
                        urls[u] = false
                        break
                    }
                    else {
                        console.log("inja ", u)
                    }
                }
            }
            done();
          //  console.log(urls)
        }
    }
});
 
// Queue just one URL, with default callback
c.queue('http://www.amazon.com');


setTimeout(function() {
	console.log("hello")
}, 1000)


// Queue a list of URLs
c.queue(['http://www.google.com/','http://www.yahoo.com']);

c.on('drain',function(){
    console.log(urls)
});
 
 //Queue URLs with custom callbacks & parameters
//c.queue([{
//    uri: 'http://parishackers.org/',
//    jQuery: false,
 
   // The global callback won't be called
//    callback: function (error, res, done) {
//        if(error){
//            console.log(error);
//        }else{
//            console.log('Grabbed', res.body.length, 'bytes');
//        }
//        done();
//    }
//}]);
 
// Queue some HTML code directly without grabbing (mostly for tests)
//c.queue([{
//    html: '<p>This is a <strong>test</strong></p>'
//}]);
