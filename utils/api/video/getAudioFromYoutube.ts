async function getAudioFromYoutube(youtubeURL: any) {
  return await fetch('/api/webScrapping/getAudioFromYoutube?videoID=' + youtubeURL)
    .then((res) => res.json())
    .then((data) => {
      if (data.success === false) {
        return { content: "Error", success: false };
      }
      else {
        return { content: data.content, success: true };

      }
    }).catch((err) => {
      console.log(err);
      return { content: "Error", success: false };
    });
}

export {
  getAudioFromYoutube
};