const axios = require("axios");
const fs = require("fs");
const { client } = require("./client.js");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
 
const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

const bunnyAPI = async () => {
    try {
        const apiCall = await axios.get("https://api.bunnies.io/v2/loop/random/?media=gif")
        return apiCall.data.media.gif;
    } catch (err) {
        console.log(err);
    }
} 

const tweetTheBunny = async () => {
    const bunnyLink = await bunnyAPI();
    if(!bunnyLink) return console.log("No bunny link!");
    
    await downloadImage(bunnyLink, "./rabbit.gif");
    gifSize = fileSize("./rabbit.gif");

    if (gifSize >= 15728640 ) {
        await ffmpeg
            .input('./rabbit.gif')
            .noAudio()
            .videoCodec("libx264")
            .output(`./rabbit.mp4`)
            .preset('divx')
            .on("end", async () => {
                console.log("Went well")
                let mediaId = await client.v1.uploadMedia("./rabbit.mp4", { longVideo: true });
                client.v1.tweet("", { media_ids: mediaId });
            })
            .on("error", (e) => console.log(e))
            .run();

            console.log(mediaId);
    } else {
        let mediaId = await client.v1.uploadMedia("./rabbit.gif");
        client.v1.tweet("", { media_ids: mediaId });
    }
}


setInterval(function() {
    var date = new Date();
    if(date.getMinutes() === 0){ 
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
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}

function fileSize(path) {
    let stats = fs.statSync(path);
    return stats.size;
}