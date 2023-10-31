import { toast } from "react-toastify";
import { getSubtitlesFromYoutube } from "@/utils/api/video/getSubtitlesFromYoutube";
import toastDisplay from "../toast";
import { getAudioFromYoutube } from "@/utils/api/video/getAudioFromYoutube";
import { POSTApiCall } from "@/utils/api/commonAPICall";

export async function urlToText(url: string, transB = false, outputSelectedI = "url", setTranscript: ((arg0: string) => void), setLoadingAPICall: ((arg0: boolean) => void)) {

  if (url === "") return;
  if (url.includes("youtube")) {
    youtubeToThread(url, transB, setTranscript, setLoadingAPICall);
  }
}

export async function getLemurInsights(url: string) {
  const response = await POSTApiCall("/api/integrations/llm/assemblyAI/getLemurInsights", {
    url: url
  })
  return response;
}

export async function urlToTranscript(url: string, speakers: boolean, key_phrases: boolean, summary: boolean, sentiment_analysis: boolean, iab_categories: boolean, messageToast: string) {
  let URLF = url;
  toastDisplay(messageToast, true);

  const decoder = new TextDecoder();
  const response = await fetch("/api/integrations/llm/assemblyAI/getTranscript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: URLF,
      speakers: speakers,
      key_phrases: key_phrases,
      summary: summary,
      sentiment_analysis: sentiment_analysis,
      iab_categories: iab_categories,
    }),
  })


  let old = await response.json();
  let test: any = {};

  if (old) {
    do {
      console.log("waiting")
      console.log(old.transcriptId)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      test = await POSTApiCall("/api/integrations/llm/assemblyAI/getTranscriptCompleted", {
        transcriptId: old.transcriptId
      })
      console.log(test.processing)
    } while (test.processing)
  }
  return test;
  // if (response === undefined) return;
  // const reader = response?.body?.getReader();
  // let trans = "";
  // while (!done) {
  //   if (reader === undefined) return;
  //   const { value, done: doneReading } = await reader?.read();

  //   done = doneReading;
  //   if (value && decoder.decode(value) !== "processing") {

  //     const data = decoder.decode(value);
  //     // Do something with data
  //     trans += data;
  //   };

  // }

  // setTranscript(trans)
  // toastDisplay('Transcript done, summarizing...', true);

  // setLoadingAPICall(false);

  // console.log('Uploaded successfully!');

}
async function youtubeToThread(url: string, transB = true, setTranscript: ((arg0: string) => void), setLoadingAPICall: ((arg0: boolean) => void)) {
  let subtitles = await getYoutubeSubtitles(url, setLoadingAPICall);
  if (subtitles === "") {
    let stringF = "";
    const sub = subtitles;
    sub.forEach((element: any) => {
      stringF = stringF + '[' + element.offser + 's] ' + element.text + "\n";
    });
    setTranscript(stringF);
    toastDisplay("Transcript done", true)

    subtitles = subtitles.map((caption: any) => caption.text);
    subtitles = subtitles.join('');
    subtitles = subtitles.replace(/(\r\n|\n|\r)/gm, "");
    //   await summarizeTextAndCreateThread(subtitles, youtubeURLN, stringF);
  } else {
    const response = await getAudioFromYoutube(url);
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