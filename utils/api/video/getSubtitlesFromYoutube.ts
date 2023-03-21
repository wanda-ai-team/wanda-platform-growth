async function getSubtitlesFromYoutube(youtubeURL: string) {
    return await fetch('/api/webScrapping/getSubtitlesFromYoutube?videoID=' + youtubeURL)
        .then((res) => res.json())
        .then((data) => {
            if (data.success && (data.subtitles !== '' || data.subtitles !== undefined)) {
                return { content: data.subtitles, success: true };
            } else {
                return { content: "", success: false };
            }
        }).catch((err) => {
            console.log(err);
            return { content: "Error", success: false };
        });
}

export {
    getSubtitlesFromYoutube
};