import { MutableRefObject, SetStateAction } from "react";

export default async function streamResponse(data: ReadableStream<Uint8Array>, setConvertedText: { (value: SetStateAction<string>): void; (arg0: string): void; }, canStopB: MutableRefObject<boolean>, stopB: MutableRefObject<boolean>, setNumberOfTweets: { (value: SetStateAction<number>): void; (arg0: number): void; }, selectedPlatform: string, setTwitterThreadTextPerTweet: { (value: SetStateAction<string[]>): void; (arg0: string[]): void; }) {
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let newTweet = false;
    let index = 0;
    let tweetThread: string[] = [];
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
  
          console.log("chunkValue")
          console.log(chunkValue)
          if (/\n/.exec(chunkValue)) {
            if (chunkValue === "\n" || chunkValue === "\n\n") {
              if(chunkValue === "\n" && newTweet === false){
                newTweet = true;
              }else{
                console.log("chunkValue333")
                index++;
                setNumberOfTweets(index);
                newTweet = false;
              }

              if(chunkValue === "\n\n"){
                index++;
                setNumberOfTweets(index);

                newTweet = false;
              }
            } 
            
            // else {
            //   if (chunkValue.length > 5) {
            //     chunkValue.split(/\n/).map((value, index) => {
            //       console.log("value")
            //       console.log(value)
            //       if (value !== "") {
            //         tweetThread[index] = value;
            //         setTwitterThreadTextPerTweet([...tweetThread]);
            //         console.log("1")
            //         console.log(chunkValue.split(/\n/).length)
            //         console.log(index)
            //         index++;
            //         setNumberOfTweets(index);
            //       }
            //     });
            //   }
            // }
            // Do something, the string contains a line break
          } else {
            if (tweetThread[index] !== undefined) {
              tweetThread[index] = tweetThread[index] + chunkValue;
            } else {
              tweetThread[index] = chunkValue;
            }
            tweetThread[index] = tweetThread[index].replace("\n", "");
            setTwitterThreadTextPerTweet([...tweetThread]);
          }
        } else {
          setConvertedText((prev) => prev + chunkValue);
        }
      }

    canStopB.current = false;
}
