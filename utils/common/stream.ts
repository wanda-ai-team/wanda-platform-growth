import { MutableRefObject, SetStateAction } from "react";

export default async function streamResponse(data: ReadableStream<Uint8Array>, setConvertedText: { (value: SetStateAction<string>): void; (arg0: string): void; }, canStopB: MutableRefObject<boolean>, stopB: MutableRefObject<boolean>, setNumberOfTweets: { (value: SetStateAction<number>): void; (arg0: number): void; }, selectedPlatform: string, setTwitterThreadTextPerTweet: { (value: SetStateAction<string[]>): void; (arg0: string[]): void; }) {
  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let newTweet = false;
  let index = 0;
  let tweetThread: string[] = [];
  let prevStored = "";
  setConvertedText("");

  while (!done) {
    canStopB.current = true;
    if (stopB.current) {
      stopB.current = false;
      canStopB.current = false;
      break;
    }
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    if (selectedPlatform === "Twitter") {
      const numberVales = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      const numberValesT = ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10."];
      if (numberVales.includes(chunkValue) || numberValesT.some(v => chunkValue.includes(v))) {
        if (numberVales.includes(chunkValue)) {
          if (chunkValue !== "1") {
            newTweet = true;
          }
          prevStored = chunkValue;
        } else {
          if (numberValesT.some(v => chunkValue.includes(v))) {
            if (!chunkValue.includes("1.")) {
              index++;
              setNumberOfTweets(index);
            }
            if (chunkValue !== undefined) {
              tweetThread[index] = chunkValue;
            }
            setTwitterThreadTextPerTweet([...tweetThread]);
          }
        }
      } else {
        if ((newTweet && chunkValue.includes("."))) {
          index++;
          setNumberOfTweets(index);
          if (chunkValue !== undefined) {
            tweetThread[index] = prevStored + chunkValue;
          }
          setTwitterThreadTextPerTweet([...tweetThread]);
        } else {
          if (chunkValue !== undefined) {
            tweetThread[index] = prevStored + (tweetThread[index] !== undefined ? tweetThread[index] : "") + chunkValue;
          }
          setTwitterThreadTextPerTweet([...tweetThread]);
        }
        
        prevStored = "";
        newTweet = false;
      }
    } else {
      setConvertedText((prev) => prev + chunkValue);
    }
  }

  canStopB.current = false;
}
