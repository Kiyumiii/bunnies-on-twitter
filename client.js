const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const { TwitterApi } = require("twitter-api-v2");

var client = new TwitterApi ({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_KEY,
    accessSecret: process.env.TWITTER_ACCESS_SECRET
});

module.exports = { client };