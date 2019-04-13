const redis = require("redis");
const { promisify } = require("util");

// Client talks to Redis
const client = redis.createClient(
    // this will listen to Heroku's Redis port - for deploying
    process.env.REDIS_URL || {
        // listen on our localhost - for testing locally
        host: "localhost",
        port: 6379
    }
);

client.on("error", function(err) {
    console.log(err);
});

exports.get = promisify(client.get).bind(client);
exports.setex = promisify(client.setex).bind(client);
exports.del = promisify(client.del).bind(client);
