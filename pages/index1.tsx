
import styles from '@/styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import { Button, Grid, GridItem, Input, Select, Textarea } from '@chakra-ui/react'
import { ColorRing } from 'react-loader-spinner'
import TwitterThread from '@/components/text/twitterThread/twitterThread'
import { getSubtitlesFromYoutube } from '@/utils/api/video/getSubtitlesFromYoutube'
import { getTextSummary } from '@/utils/api/text/getTextSummary'
import { convertTextToThread } from '@/utils/api/text/convertTextToThread'
import { getAudioFromYoutube } from '@/utils/api/video/getAudioFromYoutube'
import { speechToText } from '@/utils/api/AIConvert/speechToText'
import { getBlogText } from '@/utils/api/text/getBlogText'

import { postTweet } from '@/utils/api/text/postTweet'
import { useSession, signOut } from "next-auth/react"
import Chat from '@/components/text/chat'
import { getAudioTranscript } from '@/utils/api/audio/getAudioTranscript'
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import { getThread } from '@/utils/api/twitter/getThread'
import { outputsWithPlatform, toneList, writingStyles } from '@/utils/globalVariables'

const input = ['URL', 'Text', 'Podcast (File)'];

export default function Home() {
  const stopB = useRef(false);
  const canStopB = useRef(false);
  const [regenerate, setRegenerate] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [twitterThread, setTwitterThread] = useState('');
  const [summary, setSummary] = useState('');
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [apiStep, setApiStep] = useState('');
  const [loadingAPICall, setLoadingAPICall] = useState(false);
  const [twitterThreadText, setTwitterThreadText] = useState(['']);
  const [twitterThreadTextPerTweet, setTwitterThreadTextPerTweet] = useState(['']);
  const [convertedText, setConvertedText] = useState('');
  const [selectedTweets, setSelectedTweets] = useState<any>([]);
  const [numberOfTweets, setNumberOfTweets] = useState(1);
  const { data: session } = useSession()
  const [threadPostResult, setThreadPostResult] = useState('');
  const [outputSelected, setOutputSelected] = useState(outputsWithPlatform[0].platform);
  const [outputSelectedO, setOutputSelectedO] = useState(outputsWithPlatform[0].outputs[0]);

  const [outputSelectedW, setOutputSelectedW] = useState(toneList[0]);
  const [outputSelectedT, setOutputSelectedT] = useState(writingStyles[0]);

  const [outputSelectedI, setOutputSelectedI] = useState(input[0]);
  const [postingThread, setPostingThread] = useState(false);
  const [wantTranscript, setWantTranscript] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
  }, []);

  async function convertSummaryS(summaryN: string, text: boolean, toneStyle: string, writingStyle: string) {
    setLoadingAPICall(true);
    setApiStep('Converting to ' + outputSelected + '\...');
    const response = await fetch("/api/llm/gpt3/textToThreadStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: summaryN,
        output: outputSelected,
        outputO: outputSelectedO,
        isText: text,
        toneStyle: toneStyle,
        writingStyle: writingStyle
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let newTweet = false;
    let index = 0;
    let tweetThread: string[] = [];


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

      if (chunkValue === '\n') {
        if (newTweet) {
          index++;
          setNumberOfTweets(index);
          newTweet = false;
        } else {
          newTweet = true;
        }
      }

      if (chunkValue === '\n\n') {
        index++;
        setNumberOfTweets(index);
      }

      if (outputSelected === 'Twitter') {
        if (!newTweet) {
          if (chunkValue !== '\n') {
            if (tweetThread[index] !== undefined) {
              tweetThread[index] = tweetThread[index] + chunkValue;
            } else {
              tweetThread[index] = chunkValue;
            }
            tweetThread[index] = tweetThread[index].replace('\n', '');
            setTwitterThreadTextPerTweet([...tweetThread]);
          }
        }
      } else {
        setConvertedText((prev) => prev + chunkValue);
      }
    }


    canStopB.current = false;
    setLoadingAPICall(false);
  }

  async function postTweet1() {
    setPostingThread(true);
    const threadResult = await postTweet(twitterThreadTextPerTweet);
    if (threadResult.success) {
      setThreadPostResult(threadResult.content);
    } else {
      setThreadPostResult('Error');
    }
    setPostingThread(false);
  }

  async function youtubeTransformText(youtubeURLN: string, transB = false) {
    if (outputSelectedI !== 'URL') {
      textToSummary(youtubeURLN);
    } else {
      if (youtubeURLN === '') return;
      if (youtubeURLN.includes("youtube")) {
        youtubeToThread(youtubeURLN, transB);
      } else {
        if (youtubeURLN.includes("spotify")) {
          getAudioTranscript("https://open.spotify.com/episode/6KSA3AdTUc3LLUocRCHCJL?si=5vw8HIzYSqKAPP6h6MRpaQ", "");
        }
        else {
          if (youtubeURLN.includes("twitter")) {
            twitterThreadToText(youtubeURLN);
          } else {
            blogToThread(youtubeURLN);
          }
        }
      }
    }
  }


  async function textToSummary(text: string) {
    setLoadingAPICall(true);
    setApiStep('Getting Medium Text...');
    await summarizeTextAndCreateThread(text, "null", text)
    setLoadingAPICall(false);
    setApiStep('');
  }

  async function youtubeToThread(youtubeURLN: string, transB = true) {
    let subtitles = await getYoutubeSubtitles(youtubeURLN);
    if (subtitles !== "") {
      let stringF = "";
      const sub = subtitles;
      sub.forEach((element: any) => {
        stringF = stringF + '[' + element.offser + 's] ' + element.text + "\n";
      });
      setTranscript(stringF);

      subtitles = subtitles.map((caption: any) => caption.text);
      subtitles = subtitles.join('');
      subtitles = subtitles.replace(/(\r\n|\n|\r)/gm, "");
      await summarizeTextAndCreateThread(subtitles, youtubeURLN, stringF);
    } else {
      setApiStep('No Subtitles Found, calling Batman to fix this, Batsignal can take some minutes ...');
      const response = await getAudioFromYoutube(youtubeURLN);
      if (response.success) {
        setApiStep('Converting Audio ...');
        if (transB) {
          setTranscript(response.content);
        }
        const responseWhisper = await speechToText(response.content);
        if (responseWhisper.success) {
          await summarizeTextAndCreateThread(responseWhisper.content, youtubeURLN, response.content,);
        }
      }
    }
    setLoadingAPICall(false);
    setApiStep('');
  }
  async function twitterThreadToText(youtubeURLN: string) {
    setLoadingAPICall(true);
    setApiStep('Getting Thread...');
    const response = await getThread(youtubeURLN);
    if (response.success) {
      const thread = response.content.flat().toString();
      setSummary(thread)
    } else {
      setTwitterThread("Error");
    }
    setLoadingAPICall(false);
    setApiStep('');
  }


  async function blogToThread(youtubeURLN: string) {
    setLoadingAPICall(true);
    setApiStep('Getting Medium Text...');
    const response = await getBlogText(youtubeURLN)
    if (response.success) {
      await summarizeTextAndCreateThread(response.content, youtubeURLN, response.content,)
    } else {
      setTwitterThread("Error");
    }
    setLoadingAPICall(false);
    setApiStep('');
  }

  async function getYoutubeSubtitles(youtubeURLN: string) {
    setApiStep('Getting Subtitles from Video...');
    setLoadingAPICall(true);
    const response = await getSubtitlesFromYoutube(youtubeURLN);
    if (response.success) {
      setTwitterThread(response !== undefined ? response.content : '');
      return response.content;
    }
    else {
      if (response.content === '') {
        return "";
      }
      else {
        setTwitterThread("Error");
        return "";
      }
    }
  }

  async function summarizeTextAndCreateThread(data: any, url: string, transc: string = "") {
    setApiStep('Formatting Text...');
    const response = await getTextSummary(data, url);
    setTranscript(transc)
    if (response.success) {
      setSummary(response.content);
    } else {
      setTwitterThread("Error");
    }

    setLoadingAPICall(false);
  }



  async function submitFile(e: React.MouseEvent<HTMLInputElement>) {
    setLoadingAPICall(true);
    setApiStep('Uploading File and Transcribing...');
    e.preventDefault();
    let formData = new FormData();
    if (inputFileRef.current === null) {
      return;
    }
    Object.values((inputFileRef.current.files as any)).forEach(file => {
      formData.append('file', (file as Blob | string));
    })
    try {

      const res = await fetch("/api/files/uploadFiles", {
        method: "POST",

        body: formData,
      });

      const body = await res.json();

      if (body.success) {
        setWantTranscript(true)
        setTranscript(body.content)
        const response = await getTextSummary(body.content, "null");
        if (response.success) {
          setSummary(response.content);
        } else {
          setTwitterThread("Error");
        }
        // Do some stuff on successfully upload
      } else {
        // Do some stuff on error
      }

    } catch (e) {
      console.log(e)
    }
    setLoadingAPICall(false);

  }



  function getTwitterThread() {
    return (
      <>
        <TwitterThread
          setNumberOfTweets={setNumberOfTweets}
          numberOfTweets={numberOfTweets}
          setTwitterThreadText={setTwitterThreadTextPerTweet}
          twitterThreadText={twitterThreadTextPerTweet}
          setSelectedTweets={setSelectedTweets}
          selectedTweets={selectedTweets} />
        {
          postingThread &&
          <div>
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="blocks-loading"
              wrapperStyle={{}}
              wrapperClass="blocks-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']} />
          </div>
        }
        {
          threadPostResult !== '' &&
          <a href={threadPostResult.includes("https://twitter.com/") ? threadPostResult : ''}>
            {threadPostResult}
          </a>
        }
        <Button style={{ backgroundColor: '#1DA1F2', marginTop: '25px' }} isDisabled={twitterThreadTextPerTweet.length <= 1} onClick={postTweet1}> Tweet Thread </Button>
      </>
    )
  }

  let handleInputChange = (e: { target: { value: any; }; }) => {
    if (outputSelected === 'twitter') {
      let newArr = [...twitterThreadText];
      newArr[0] = e.target.value;
      setTwitterThreadText([...newArr]);
    }
    else {
      setConvertedText(e.target.value)
    }
  }


  let handleInputSChange = (e: { target: { value: any; }; }) => {
    let inputValue = e.target.value
    setSummary(inputValue)
  }

  function getTextArea(valueChosen: any) {
    if (outputSelected === 'Twitter') {
      return getTwitterThread();
    }

    if (outputSelected !== '') {
      return (
        <>
          <Textarea
            style={{ height: '500px' }}
            value={valueChosen}
            onChange={handleInputChange}
            placeholder='Here is a sample placeholder'
            size='lg' />
        </>
      )
    }
  }


  return (
    <>

      {session &&
        <div className={styles.logout}>
          <button onClick={() => signOut()}>Signed in as {session.user.name}</button>
        </div>
      }


      <div className={styles.main}>
        <div className={styles.main2}>
          <h2> 1. Post Content </h2>
          <div className={styles.options}>
            <Select onChange={(e) => {
              setOutputSelectedI(e.target.value)
              setYoutubeURL('')
              setInputText('')
            }} value={outputSelectedI} >
              {input.map((value, index) => (
                <option key={index} value={value}>{value}</option>
              ))}
            </Select>
          </div>
          <div className={styles.inputs}>
            <div className={styles.links}>

              {outputSelectedI === 'URL' &&
                <>
                  <Input placeholder={outputSelectedI === 'URL' ? 'URL (works with Medium, Youtube, X)' : 'URL (works with spotify)'} value={youtubeURL} className={styles.input} onChange={(e) => {
                    setYoutubeURL(e.target.value);
                    if (e.target.value !== "") {
                      if (outputSelectedI === 'URL') {
                        youtubeTransformText(e.target.value, wantTranscript);
                      } else {
                        // getAudioTranscript(e.target.value);
                      }
                    }
                  }} />
                  {/* <Checkbox isChecked={wantTranscript} onChange={(e) => setWantTranscript(e.target.checked)}>Transcript (for video and audios)</Checkbox> */}
                </>
              }

              {outputSelectedI === 'Text' &&
                <Textarea
                  style={{ height: '10vh', width: '40vw' }}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    if (e.target.value !== "") {
                      youtubeTransformText(e.target.value)
                    }
                  }}
                  placeholder='Paste your text here'
                  size='lg' />
              }

              {outputSelectedI === 'Podcast (File)' &&
                <>
                  <input type="file" name="myfile" accept=".mp3" ref={inputFileRef} />
                  <input type="submit" value="Upload" onClick={submitFile} />
                </>
              }
              {/* <div className={styles.transcriptSummary}>
              {wantTranscript && transcript !== '' &&
                <div className={styles.texts}>
                  <p>
                  </p>
                  Transcript:
                  <p> </p>

                  <Textarea
                    style={{ height: '10vh', width: '40vw' }}
                    value={transcript}
                    onChange={(e) => { setTranscript(e.target.value); }}
                    placeholder='Here is a sample placeholder'
                    size='lg' />
                </div>
              }
              {summary !== '' &&
                <div className={styles.texts}>
                  <p>
                  </p>
                  Summary:
                  <p> </p>

                  <Textarea
                    style={{ height: '10vh', width: '40vw' }}
                    value={summary}
                    onChange={(e) => { handleInputSChange(e); }}
                    placeholder='Here is a sample placeholder'
                    size='lg' />
                </div>
              }
            </div> */}
            </div>
          </div>

          <div>
            {loadingAPICall &&
              <div className={styles.loadingIcon}>
                <p>{apiStep}</p>
                <ColorRing
                  visible={true}
                  height="80"
                  width="80"
                  ariaLabel="blocks-loading"
                  wrapperStyle={{}}
                  wrapperClass="blocks-wrapper"
                  colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']} />
              </div>
            }
          </div>

          <h2> 2. Convert </h2>

          <div className={styles.main2}>
            <div className={styles.options}>

              <span> Platform: </span>
              <Select onChange={(e) => { setOutputSelected(e.target.value); 
                setOutputSelectedO(outputsWithPlatform.filter(v => v.platform === e.target.value)[0].outputs[0]); 
                setRegenerate(false); }} value={outputSelected} >
                {outputsWithPlatform.map((output, index) => (
                  <option key={index} value={output.platform}>{output.platform}</option>
                ))}
              </Select>

              {outputSelected !== 'Transcript' && outputSelected !== 'Summary' &&
                <>
                  <span> Output: </span>
                  <Select onChange={(e) => { setOutputSelectedO(e.target.value); setRegenerate(false); }} value={outputSelectedO} >
                    {outputsWithPlatform.filter(plat => plat.platform === outputSelected)[0] !== undefined ? outputsWithPlatform.filter(plat => plat.platform === outputSelected)[0].outputs.map((output, index) => (
                      <option key={index} value={output}>{output}</option>
                    )) : <></>}
                  </Select>

                  <span> Tone Style: </span>
                  <Select onChange={(e) => { setOutputSelectedT(e.target.value); setRegenerate(false); }} value={outputSelectedT} >
                    {toneList.map((output, index) => (
                      <option key={index} value={output}>{output}</option>
                    ))}
                  </Select>

                  <span> Writing Style: </span>
                  <Select onChange={(e) => { setOutputSelectedW(e.target.value); setRegenerate(false); }} value={outputSelectedW} >
                    {writingStyles.map((output, index) => (
                      <option key={index} value={output}>{output}</option>
                    ))}
                  </Select>

                  <div className={styles.transcriptSummary}>
                    <Button isDisabled={((summary === "") || canStopB.current)} colorScheme='purple' onClick={() => {
                      setConvertedText('');
                      setTwitterThreadTextPerTweet(['']);
                      setRegenerate(true);
                      if (outputSelected === "Twitter") {
                        convertSummaryS(summary, false, outputSelectedT, outputSelectedW);
                      } else {
                        if (outputSelectedO === 'Text') {
                          convertSummaryS(inputText, true, outputSelectedT, outputSelectedW);
                        } else {
                          convertSummaryS(summary, false, outputSelectedT, outputSelectedW);
                        }
                      }
                    }}>
                      Generate to {outputSelected !== '' ? outputSelected : '...'}
                      {/* {regenerate ? 'Regenerate to' : 'Generate to'} {outputSelected !== '' ? outputSelected : '...'} */}
                    </Button>
                    <Button colorScheme='purple' isDisabled={!canStopB.current} onClick={() => stopB.current = true}> Stop Generation </Button>
                  </div>
                </>
              }
            </div>
          </div>
        </div>
        <div>
          <h2> 3. Edit & Publish {outputSelected} </h2>

          <div>
            <Grid templateColumns={`repeat(${outputSelected === 'Twitter' ? 1 : 1}, 1fr)`} gap={6}>
              <GridItem w='40vw' style={{ display: 'flex', justifyContent: 'start', flexDirection: 'column', alignItems: 'center' }} >
                {getTextArea(outputSelected === 'Summary' ? summary : outputSelected === 'Transcript' ? transcript : convertedText)}
              </GridItem>
              {/* <GridItem w='40vw' >
              <Chat selectedTweets={selectedTweets} twitterThreadText={twitterThreadTextPerTweet} setTwitterThreadTextPerTweet={setTwitterThreadTextPerTweet} />
            </GridItem> */}
            </Grid>
          </div>
        </div>
      </div>
    </>
  )
}