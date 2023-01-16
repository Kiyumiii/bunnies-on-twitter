const axios = require("axios");
const fs = require("fs");

const { client } = require("./utils/client.js");
const logger = require("./utils/logger.js");

const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const ffmpeg = require("fluent-ffmpeg")()
    .setFfprobePath(ffprobe.path)
    .setFfmpegPath(ffmpegInstaller.path);

const bunnyAPI = async () => {
    try {
        const apiCall = await axios.get("https://api.bunnies.io/v2/loop/random/?media=gif")
        await logger.info("Successful API call ✔️")
        return apiCall.data.media.gif;
    } catch (err) {
        logger.error(err);
    }
}

const tweetTheBunny = async () => {
    const bunnyLink = await bunnyAPI();
    if (!bunnyLink) return console.log("No bunny link!");

    await downloadImage(bunnyLink, "./rabbit.gif");
    gifSize = fileSize("./rabbit.gif");

    //If the size of the gif is too big
    if (gifSize >= 15728640) {
        ffmpeg
            .input('./rabbit.gif')
            .noAudio()
            .videoCodec("libx264")
            .output(`./rabbit.mp4`)
            .preset('divx')
            .on("end", async () => {
                logger.info("Successful video generation ✔️")
                let mediaId = await client.v1.uploadMedia("./rabbit.mp4", { longVideo: true });
                logger.info("Successfully uploaded on Twitter services ✔️")
                await client.v1.tweet("", { media_ids: mediaId });
                logger.success("Tweet sent! 🐰")
            })
            .on("error", (e) => logger.error(e))
            .run();

        console.log(mediaId);
    } else {
        let mediaId = await client.v1.uploadMedia("./rabbit.gif");
        logger.info("Successfully uploaded on Twitter services ✔️")
        await client.v1.tweet("", { media_ids: mediaId });
        logger.success("Tweet sent! 🐰")
    }
}

setInterval(function() {
    var date = new Date();
    if (date.getMinutes() === 0) {
        tweetTheBunny();
    }
}, 60000);

async function downloadImage(imgUrl, filepath) {
    const response = await axios({
        url: imgUrl,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', () => {
                console.error(reject);
                reject;
            })
            .once('close', () => {
                logger.info("Successful GIF download ✔️")
                resolve(filepath)
            });
    });
}

function fileSize(path) {
    let stats = fs.statSync(path);
    return stats.size;
}

logger.info("I am on! 🐰")