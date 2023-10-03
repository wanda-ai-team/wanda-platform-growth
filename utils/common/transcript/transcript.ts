import { toast } from "react-toastify";
import { getSubtitlesFromYoutube } from "@/utils/api/video/getSubtitlesFromYoutube";
import toastDisplay from "../toast";
import { getAudioFromYoutube } from "@/utils/api/video/getAudioFromYoutube";

export default async function urlToText(url: string, transB = false, outputSelectedI = "url", setTranscript: ((arg0: string) => void), setLoadingAPICall: ((arg0: boolean) => void)) {

    if (url === "") return;
    if (url.includes("youtube")) {
        youtubeToThread(url, transB, setTranscript, setLoadingAPICall);
    }
}

async function youtubeToThread(url: string, transB = true, setTranscript: ((arg0: string) => void), setLoadingAPICall: ((arg0: boolean) => void)) {
    let subtitles = await getYoutubeSubtitles(url, setLoadingAPICall);
    if (subtitles === "") {
      let stringF = "";
      const sub = subtitles;
      sub.forEach((element: any) => {
        stringF = stringF + '[' + element.offser + 's] ' + element.text + "\n";
      });
      console.log(stringF)
      setTranscript(stringF);
      toastDisplay("Transcript done", true)

      subtitles = subtitles.map((caption: any) => caption.text);
      subtitles = subtitles.join('');
      subtitles = subtitles.replace(/(\r\n|\n|\r)/gm, "");
    //   await summarizeTextAndCreateThread(subtitles, youtubeURLN, stringF);
    } else {
      const response = await getAudioFromYoutube(url);
      console.log(response)
      if (response.success) {
        if (transB) {
          setTranscript(response.content);

          toastDisplay("Transcript done", true)
        }
        // const responseWhisper = await speechToText(response.content);
        // if (responseWhisper.success) {
        //   await summarizeTextAndCreateThread(
        //     responseWhisper.content,
        //     youtubeURLN,
        //     responseWhisper.content
        //   );
        // }
      }
    }
    setLoadingAPICall(false);
  }

  async function getYoutubeSubtitles(youtubeURLN: string, setLoadingAPICall: ((arg0: boolean) => void)) {
    setLoadingAPICall(true);
    const response = await getSubtitlesFromYoutube(youtubeURLN);
    if (response.success) {
      return response.content;
    } else {
      return "";
    }
  }