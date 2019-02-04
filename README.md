# Crawler-project
A simple crawler based on NodeJS

##Installation

`npm update`

`npm run database_init`

##Available Configs
    {
        baseURLS: Array of base URLS
        batchSize: Maximum number of requests
        depth: Maximum depth for iteration through links
        time: Time period befor sending request (milliseconds)
        retries: Retries for every request if failed
        timeout: Time period to consider failure (milliseconds)
        maxcon: Maximum number of parallel connections
    }
    
Setting new configs:

    npm config set crawler-project:baseURLS [\"http://google.com\",\"http://en.wikipedia.org\"]
    npm config set crawler-project:batchSize 1000
    npm config set crawler-project:depth 10
    npm config set crawler-project:time 5000
    npm config set crawler-project:retries 3
    npm config set crawler-project:timeout 5000
    npm config set crawler-project:maxcon 10

###Usage

For greedy crawling use:

`npm run greedy`

Starting from the base points to crawl specific hostname:

`npm run base`

