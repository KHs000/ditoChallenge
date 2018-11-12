const request = require("request");

module.exports = (app, db) => {
    // Insert array of events at database. Individual event objects must be at json format as it follows:
    // {
    //     event: "some_event", 
    //     timestamp: "2016-09-22T13:57:31.2311892-04:00"
    // }
    app.post("/pushEvents", (req, res) => {
        const sql    = "INSERT INTO events (event, timestamp) VALUES ?";
        const params = req.body.map(event => [event.event.toLowerCase(), event.timestamp]);

        db.query(sql, [params], (err, result) => {
            if (err) {
                res.send(err);
                throw err;
            }

            res.send(`Inserted ${result.affectedRows} lines`);
        });
    });

    // Search the events database for the given event name (2 characters minimal)
    // Post body: { word: <needle goes here> }
    app.post("/autoComplete", (req, res) => {
        const needle = req.body.word;

        if (needle.length < 2) { res.send([]) }
        else {
            const sql = `SELECT event, timestamp FROM events WHERE event LIKE '${needle.toLowerCase()}%'`;

            db.query(sql, (err, result) => {
                if (err) {
                    res.send(err);
                    throw err;
                }

                res.send({ linesFound: result.length, data: result });
            });
        }
    });

    // Return the parsed timeline from the events listed at the endpoint
    app.get("/timeline", (req, res) => {
        request("https://storage.googleapis.com/dito-questions/events.json", { json: true }, (err, response, body) => {

            timeline = [];
            
            let eventTemplate = {
                timestamp: "string",
                revenue: 0.0,
                transaction_id: "string",
                store_name: "string",
                products: []
            };

            let productTemplate = {
                name: "string",
                price: 0.0
            }

            let eventsMap = new Map();
            body.events.forEach(event => {
                const id = this.filterCustomData(event.custom_data, "transaction_id");
                
                if (eventsMap.has(id)) {
                    let eventsArr = eventsMap.get(id);
                    eventsArr.push(event);
                    eventsMap.set(id, eventsArr);
                } else eventsMap.set(id, [event]);
            });

            promises = [];
            eventsMap.forEach(events => 
                promises.push(this.buildTimelineEventTemplate(timeline, events, eventTemplate, productTemplate))
            );

            Promise.all(promises).then(_ => {
                timeline.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : ((b.timestamp < a.timestamp) ? -1 : 0));
                res.send(timeline);
            });
        });
    });

    app.get("/populateDatabase", (req, res) => {
        const lines = 1000;

        const eventsTypes = ["buy", "sell", "swap", "retail", "swamp", "return", "reject", "busy"];
        const events = [];
        for (i = 0 ; i < lines ; i++) {
            events[i] = {
                event: eventsTypes[this.getRandomInt(eventsTypes.length)],
                timestamp: `2018-${this.getRandomInt(12) + 1}-${this.getRandomInt(30) + 1}T${this.getRandomInt(24)}:${this.getRandomInt(60)}:${this.getRandomInt(60)}.${this.getRandomInt(9999999)}-04:00`
            };
        }

        const sql    = "INSERT INTO events (event, timestamp) VALUES ?";
        const params = events.map(event => [event.event.toLowerCase(), event.timestamp]);

        db.query(sql, [params], (err, result) => {
            if (err) {
                res.send(err);
                throw err;
            }

            res.send(`Inserted ${result.affectedRows} lines`);
        });
    });

    this.filterCustomData = (custom_data, keyString) => {
        return custom_data
            .filter(data => data.key === keyString)
            .shift()
            .value;
    };

    this.buildTimelineEventTemplate = (timeline, events, eventTemplate, productTemplate) => {
        return new Promise((resolve, reject) => {
            try {
                eventTemplate.products = [];

                events.forEach(event => {
                    switch (event.event) {
                        case "comprou":
                            eventTemplate.timestamp      = event.timestamp;
                            eventTemplate.revenue        = event.revenue;
                            eventTemplate.transaction_id = this.filterCustomData(event.custom_data, "transaction_id");
                            eventTemplate.store_name     = this.filterCustomData(event.custom_data, "store_name");
                            break;
                        case "comprou-produto":
                            productTemplate.name  = this.filterCustomData(event.custom_data, "product_name");
                            productTemplate.price = this.filterCustomData(event.custom_data, "product_price");
                            eventTemplate.products.push(Object.assign({}, productTemplate));
                            break;
                    }
                });

                timeline.push(Object.assign({}, eventTemplate));
                resolve(true);
            } catch (err) { reject(err) }
        });
    }

    this.getRandomInt = max => Math.floor(Math.random() * Math.floor(max));
};
