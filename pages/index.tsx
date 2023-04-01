
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
import { Button, Grid, GridItem, Input } from '@chakra-ui/react'
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

export default function Home() {
  const [mediumUrl, setMediumUrl] = useState('');
  const [youtubeURL, setYoutubeURL] = useState('');
  const [twitterThread, setTwitterThread] = useState('');
  const [summary, setSummary] = useState('');
  const [apiStep, setApiStep] = useState('');
  const [loadingAPICall, setLoadingAPICall] = useState(false);
  const [twitterThreadText, setTwitterThreadText] = useState(['']);
  const [twitterThreadTextPerTweet, setTwitterThreadTextPerTweet] = useState(['']);
  const [selectedTweets, setSelectedTweets] = useState<any>([]);
  const [numberOfTweets, setNumberOfTweets] = useState(1);
  const { data: session } = useSession()

  async function postTweet1() {
    await postTweet("post");
  }

  async function youtubeTransformText() {
    if (youtubeURL === '') return;
    if (youtubeURL.includes("youtube")) {
      youtubeToThread(true);
    } else {
      blogToThread();
    }
  }

  async function youtubeTransformImage() {
    youtubeToThread(false);
  }

  async function youtubeToThread(text: boolean) {
    const subtitles = await getYoutubeSubtitles();
    if (subtitles !== "") {
      if (text) {
        await summarizeTextAndCreateThread(subtitles);
      } else {
        await summarizeTextAndInstagramPost(subtitles)
      }
    }
    else {
      setApiStep('No Subtitles Found, calling Batman to fix this, Batsignal can take some minutes ...');
      const response = await getAudioFromYoutube(youtubeURL);
      if (response.success) {
        setApiStep('Converting Audio ...');
        const responseWhisper = await speechToText(response.content);
        if (responseWhisper.success) {
          if (text) {
            await summarizeTextAndCreateThread(responseWhisper.content);
          } else {
            await summarizeTextAndInstagramPost(responseWhisper.content)
          }
        }
      }
    }
    setLoadingAPICall(false);
    setApiStep('');
  }


  async function blogToThread() {
    setLoadingAPICall(true);
    setApiStep('Getting Medium Text...');
    const response = await getBlogText(youtubeURL)
    if (response.success) {
      await summarizeTextAndCreateThread(response.content)
    } else {
      setTwitterThread("Error");
    }
    setLoadingAPICall(false);
    setApiStep('');
  }

  async function getYoutubeSubtitles() {
    setApiStep('Getting Subtitles from Video...');
    setLoadingAPICall(true);
    const response = await getSubtitlesFromYoutube(youtubeURL);
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

  async function summarizeTextAndInstagramPost(data: any) {
    setApiStep('Formatting Text...');
    const response = await getTextSummary(data);
    if (response.success) {
      setApiStep('Converting to Instagram\...');
      setSummary(response.content);
      const reponseConvert = await convertTextToImage(response.content);
      if (reponseConvert.success) {
        setTwitterThreadText(reponseConvert.content)
      }
      else {
        setTwitterThread("Error");
      }
    } else {
      setTwitterThread("Error");
    }

    setLoadingAPICall(false);
  }

  async function summarizeTextAndCreateThread(data: any) {
    setApiStep('Formatting Text...');
    const response = await getTextSummary(data);
    if (response.success) {
      setApiStep('Converting to Twitter Thread\...');
      setSummary(response.content);
      const reponseConvert = await convertTextToThread(response.content);
      if (reponseConvert.success) {
        setNumberOfTweets(reponseConvert.content.split("\n\n").length);
        setTwitterThreadText(reponseConvert.content);
        setTwitterThreadTextPerTweet(reponseConvert.content.split("\n\n"));
        const tweets = new Array(reponseConvert.content.split("\n\n").length).fill(false);
        setSelectedTweets(tweets);
      }
      else {
        setTwitterThread("Error");
      }
    } else {
      setTwitterThread("Error");
    }

    setLoadingAPICall(false);
  }

  return (
    <div className={styles.main}>
      {session &&
        <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      }

      <h2> 1. Post URL </h2>

      <div className={styles.inputs}>
        {/* <div className={styles.links}>
          <Input placeholder='Medium URL' value={mediumUrl}
            onChange={(e) => setMediumUrl(e.target.value)} />
          <Button isDisabled={mediumUrl.length <= 0} colorScheme='purple' onClick={blogToThread}>Transform to thread</Button>
        </div> */}
        <div className={styles.links}>
          <Input placeholder='URL (works with Medium and Youtube)' value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)} />
          <Button isDisabled={youtubeURL.length <= 0} colorScheme='purple' onClick={youtubeTransformText}>Convert to thread</Button>
          {/* <Button isDisabled={youtubeURL.length <= 0} colorScheme='purple' onClick={youtubeTransformImage}>Transform youtube video to Instagram</Button> */}
        </div>
      </div>

      <h2> 2. Check Summary </h2>

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
      <div>
        <p>
          Summary:
          {"\n"}
          {summary}
        </p>
      </div>
      <div>
        <p>
          Twitter Thread:
          {"\n"}
        </p>
        {selectedTweets}

        <Grid templateColumns='repeat(2, 1fr)' gap={6}>
          <GridItem w='40vw'  >
            <TwitterThread
              setNumberOfTweets={setNumberOfTweets}
              numberOfTweets={numberOfTweets}
              setTwitterThreadText={setTwitterThreadTextPerTweet}
              twitterThreadText={twitterThreadTextPerTweet}
              setSelectedTweets={setSelectedTweets}
              selectedTweets={selectedTweets} />
          </GridItem>

          <GridItem w='40vw' >
            <Chat selectedTweets={selectedTweets} twitterThreadText={twitterThreadTextPerTweet} setTwitterThreadTextPerTweet={setTwitterThreadTextPerTweet} />
          </GridItem>

        </Grid>
        <Button onClick={postTweet1}>Ola</Button>
        <a target="_blank" href={"https://twitter.com/intent/tweet?text=" + twitterThreadTextPerTweet} >
          Tweet</a>
      </div>

    </div>
  )
}
