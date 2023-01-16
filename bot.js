const axios = require("axios");
const https = require('https'); 
const fs = require("fs");
const { client } = require("./client.js")

const bunnyAPI = async () => {
    try {
        const apiCall = await axios.get("https://api.bunnies.io/v2/loop/random/?media=gif,png")
        return apiCall.data.media.gif;
    } catch (err) {
        console.log(err)
    }
}

const tweetTheBunny = async () => {
    const bunnyLink = await bunnyAPI();
    if(!bunnyLink) return console.log("No bunny link!")

    const file = fs.createWriteStream("rabbit.gif");
    https.get(bunnyLink, function(response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", async () => {
            file.close();
            const mediaId = await client.v1.uploadMedia("./rabbit.gif")
            await client.v1.tweet("", { media_ids: mediaId })
        });
    });
}

setInterval(function() {
    var date = new Date();
    if(date.getMinutes() === 0){ 
        tweetTheBunny();
    }
}, 60000);