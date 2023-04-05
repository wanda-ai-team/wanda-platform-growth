
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
import { convertTextToImage } from '@/utils/api/image/convertTextToImage'

import { TwitterApi } from 'twitter-api-v2';
import { changeTwitterThread } from '@/utils/api/text/changeTwitterThread'
import { postTweet } from '@/utils/api/text/postTweet'
import { useSession, signIn, signOut } from "next-auth/react"
import Chat from '@/components/text/chat'

const outputs = ['Twitter', 'Instagram', 'Linkedin', 'Blog', 'Test'];

export default function Home() {
  const [mediumUrl, setMediumUrl] = useState('');
  const [youtubeURL, setYoutubeURL] = useState('');
  const [twitterThread, setTwitterThread] = useState('');
  const [summary, setSummary] = useState('');
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
  const [postingThread, setPostingThread] = useState(false);

  async function convertSummary(summaryN: string) {
    console.log('convertSummary');
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

  async function convertSummaryS(summaryN: string) {

    const response = await fetch("/api/llm/gpt3/textToThreadStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: summaryN,
        output: outputSelected,
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

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setConvertedText((prev) => prev + chunkValue);
    }



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

  async function youtubeTransformText(youtubeURLN: string) {
    if (youtubeURLN === '') return;
    if (youtubeURLN.includes("youtube")) {
      youtubeToThread(youtubeURLN);
    } else {
      blogToThread(youtubeURLN);
    }
  }

  async function youtubeToThread(youtubeURLN: string) {
    const subtitles = await getYoutubeSubtitles(youtubeURLN);
    if (subtitles !== "") {
      await summarizeTextAndCreateThread(subtitles, youtubeURLN);
    }
    else {
      setApiStep('No Subtitles Found, calling Batman to fix this, Batsignal can take some minutes ...');
      const response = await getAudioFromYoutube(youtubeURLN);
      if (response.success) {
        setApiStep('Converting Audio ...');
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
    let newArr = [...twitterThreadText];
    newArr[0] = e.target.value;
    setTwitterThreadText([...newArr]);
  }


  return (
    <>
      {session &&
        <div className={styles.logout}>
          <button onClick={() => signOut()}>Signed in as {session.user.name}</button>
        </div>
      }


      <div className={styles.main}>
        <h2> 1. Post URL </h2>
        <div className={styles.inputs}>
          <div className={styles.links}>
            <Input placeholder='URL (works with Medium and Youtube)' value={youtubeURL} className={styles.input} onChange={(e) => {
              console.log("calling setYoutubeURL");
              setYoutubeURL(e.target.value);
              console.log(e.target.value);
              if (e.target.value !== "") {
                console.log("calling youtubeTransformText");
                youtubeTransformText(e.target.value)
              }
            }} />
            {summary !== '' &&
              <>
                <p>
                </p>
                Summary:
                <p> </p>

                <Textarea
                  style={{ height: '10vh', width: '40vw' }}
                  value={summary}
                  onChange={(e) => { setSummary(e.target.value) }}
                  placeholder='Here is a sample placeholder'
                  size='lg' />
              </>
            }
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
            <Select placeholder='Select Output' onChange={(e) => setOutputSelected(e.target.value)} value={outputSelected} >
              {outputs.map((output, index) => (
                <option key={index} value={output}>{output}</option>
              ))}
            </Select>
            <Button isDisabled={(youtubeURL.length <= 0 || outputSelected === "")} colorScheme='purple' onClick={() => {
              if (outputSelected === 'Test') {
                convertSummaryS(summary)
              } else {
                convertSummary(summary)
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
