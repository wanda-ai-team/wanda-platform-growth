
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
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
const outputsWithPlatform = [
  { platform: 'Twitter', outputs: ['Thread'] },
  { platform: 'Instagram', outputs: ['Carousel', 'Post'] },
  { platform: 'Linkedin', outputs: ['Post'] },
  { platform: 'Blog', outputs: ['Post', 'Article'] },
  // { platform: 'Transcript', outputs: ['Transcript'] }
];

const input = ['URL', 'Text'];

export default function Home() {
  const [mediumUrl, setMediumUrl] = useState('');
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
  const [outputSelected, setOutputSelected] = useState("");
  const [outputSelectedO, setOutputSelectedO] = useState("");
  const [outputSelectedI, setOutputSelectedI] = useState(input[0]);
  const [postingThread, setPostingThread] = useState(false);
  const [wantTranscript, setWantTranscript] = useState(false);

  async function convertSummary(summaryN: string) {
    setLoadingAPICall(true);
    setApiStep('Converting to ' + outputSelected + '\...');
    const reponseConvert = await convertTextToThread(summaryN, outputSelected);
    if (reponseConvert.success) {
      if (outputSelected === 'Twitter') {
        setNumberOfTweets(reponseConvert.content.split("\n\n").length);
        setTwitterThreadText(reponseConvert.content);
        setTwitterThreadTextPerTweet(reponseConvert.content.split("\n\n"));
        const tweets = new Array(reponseConvert.content.split("\n\n").length).fill(false);
        setSelectedTweets(tweets);
      } else {
        setConvertedText(reponseConvert.content)
      }
    }
    else {
      setTwitterThread("Error");
    }
    setApiStep('');
    setLoadingAPICall(false);
  }

  async function convertSummaryS(summaryN: string, text: boolean) {
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
          blogToThread(youtubeURLN);
        }
      }
    }
  }


  async function textToSummary(text: string) {
    setLoadingAPICall(true);
    setApiStep('Getting Medium Text...');
    await summarizeTextAndCreateThread(text, "null")
    setLoadingAPICall(false);
    setApiStep('');
  }

  async function youtubeToThread(youtubeURLN: string, transB = false) {
    console.log(transB)
    const subtitles = await getYoutubeSubtitles(youtubeURLN);
    if (subtitles !== "") {
      if (transB) {
        console.log("transB")
        console.log(transB)
        setTranscript(subtitles);
      }
      await summarizeTextAndCreateThread(subtitles, youtubeURLN);
    }
    else {
      setApiStep('No Subtitles Found, calling Batman to fix this, Batsignal can take some minutes ...');
      const response = await getAudioFromYoutube(youtubeURLN);
      if (response.success) {
        setApiStep('Converting Audio ...');
        if (transB) {
          setTranscript(response.content);
        }
        const responseWhisper = await speechToText(response.content);
        if (responseWhisper.success) {
          await summarizeTextAndCreateThread(responseWhisper.content, youtubeURLN);
        }
      }
    }
    setLoadingAPICall(false);
    setApiStep('');
  }


  async function blogToThread(youtubeURLN: string) {
    setLoadingAPICall(true);
    setApiStep('Getting Medium Text...');
    const response = await getBlogText(youtubeURLN)
    if (response.success) {
      await summarizeTextAndCreateThread(response.content, youtubeURLN)
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

  async function summarizeTextAndCreateThread(data: any, url: string) {
    setApiStep('Formatting Text...');
    const response = await getTextSummary(data, url);
    setTranscript(data)
    if (response.success) {
      setSummary(response.content);
    } else {
      setTwitterThread("Error");
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
          <a href={threadPostResult}>
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


  return (
    <>
      {session &&
        <div className={styles.logout}>
          <button onClick={() => signOut()}>Signed in as {session.user.name}</button>
        </div>
      }


      <div className={styles.main}>
        <h2> 1. Post Content </h2>
        <div className={styles.options}>
          <Select onChange={(e) => setOutputSelectedI(e.target.value)} value={outputSelectedI} >
            {input.map((value, index) => (
              <option key={index} value={value}>{value}</option>
            ))}
          </Select>
        </div>
        <div className={styles.inputs}>
          <div className={styles.links}>

            {outputSelectedI !== 'Text' &&
              <>
                <Input placeholder={outputSelectedI === 'URL' ? 'URL (works with Medium and Youtube)' : 'URL (works with spotify)'} value={youtubeURL} className={styles.input} onChange={(e) => {
                  setYoutubeURL(e.target.value);
                  if (e.target.value !== "") {
                    if (outputSelectedI === 'URL') {
                      console.log(wantTranscript)
                      youtubeTransformText(e.target.value, wantTranscript);
                    } else {
                      // getAudioTranscript(e.target.value);
                    }
                  }
                }} />
                <Checkbox isChecked={wantTranscript} onChange={(e) => setWantTranscript(e.target.checked)}>Transcript (for video and audios)</Checkbox>
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

            <div className={styles.transcriptSummary}>

              {wantTranscript &&

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
            </div>
          </div>
        </div>

        <div>
          {loadingAPICall &&
            <div >
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
        <div>
          <div className={styles.options}>


            <Select placeholder='Select Platform' onChange={(e) => setOutputSelected(e.target.value)} value={outputSelected} >
              {outputsWithPlatform.map((output, index) => (
                <option key={index} value={output.platform}>{output.platform}</option>
              ))}
            </Select>

            <Select placeholder='Select Output' onChange={(e) => setOutputSelectedO(e.target.value)} value={outputSelectedO} >
              {outputsWithPlatform.filter(plat => plat.platform === outputSelected)[0] !== undefined ? outputsWithPlatform.filter(plat => plat.platform === outputSelected)[0].outputs.map((output, index) => (
                <option key={index} value={output}>{output}</option>
              )) : <></>}
            </Select>
            <Button isDisabled={(youtubeURL.length <= 0 || outputSelected === "" || outputSelectedO === "")} colorScheme='purple' onClick={() => {
              if (outputSelected === 'Twitter') {
                convertSummaryS(summary, false)
              } else {
                if (outputSelectedO === 'Text') {
                  convertSummaryS(inputText, true)
                } else {
                  convertSummaryS(summary, false)
                }
              }
            }}>Convert to {outputSelected}</Button>

          </div>
        </div>

        <h2> 3. Edit & Publish Thread </h2>
        <div>
          {selectedTweets}

          <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            <GridItem w='40vw' style={{ display: 'flex', justifyContent: 'start', flexDirection: 'column', alignItems: 'center' }} >
              {outputSelected === 'Twitter' ?
                getTwitterThread()
                :
                outputSelected !== '' &&
                <Textarea
                  style={{ height: '90%' }}
                  value={convertedText}
                  onChange={handleInputChange}
                  placeholder='Here is a sample placeholder'
                  size='lg' />
              }
            </GridItem>

            <GridItem w='40vw' >
              <Chat selectedTweets={selectedTweets} twitterThreadText={twitterThreadTextPerTweet} setTwitterThreadTextPerTweet={setTwitterThreadTextPerTweet} />
            </GridItem>

          </Grid>

        </div>

      </div>
    </>
  )
}
