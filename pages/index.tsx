
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
import { Button, Input } from '@chakra-ui/react'
import { ColorRing } from 'react-loader-spinner'
import TwitterThread from '@/components/text/twitterThread/twitterThread'
import { getSubtitlesFromYoutube } from '@/utils/api/video/getSubtitlesFromYoutube'
import { getTextSummary } from '@/utils/api/text/getTextSummary'
import { convertTextToThread } from '@/utils/api/text/convertTextToThread'
import { getAudioFromYoutube } from '@/utils/api/video/getAudioFromYoutube'
import { speechToText } from '@/utils/api/AIConvert/speechToText'
import { getBlogText } from '@/utils/api/text/getBlogText'

export default function Home() {
  const [mediumUrl, setMediumUrl] = useState('');
  const [youtubeURL, setYoutubeURL] = useState('');
  const [twitterThread, setTwitterThread] = useState('');
  const [summary, setSummary] = useState('');
  const [apiStep, setApiStep] = useState('');
  const [loadingAPICall, setLoadingAPICall] = useState(false);
  const [twitterThreadText, setTwitterThreadText] = useState(['']);
  const [numberOfTweets, setNumberOfTweets] = useState(1);

  async function youtubeToThread() {
    const subtitles = await getYoutubeSubtitles();
    if (subtitles !== "") {
      await summarizeTextAndCreateThread(subtitles);
    }
    else {
      setApiStep('No Subtitles Found, calling Batman to fix this ...');
      const response = await getAudioFromYoutube(youtubeURL);
      if (response.success) {
        const summary = await speechToText(youtubeURL, response.content);
        if(summary.success){
          await summarizeTextAndCreateThread(summary.content);
        }
      }
    }
    setLoadingAPICall(false);
    setApiStep('');
  }
  

  async function blogToThread() {
    setLoadingAPICall(true);
    setApiStep('Getting Medium Text...');
    const response = await getBlogText(mediumUrl)
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

  async function summarizeTextAndCreateThread(data: any) {
    setApiStep('Formatting Text...');
    const response = await getTextSummary(data);
    if (response.success) {
      setApiStep('Converting to Twitter Thread\...');
      setSummary(response.content);
      const reponseConvert = await convertTextToThread(response.content);
      if (reponseConvert.success) {
        reponseConvert.content.forEach((element: string | any[]) => {
        });
        setNumberOfTweets(reponseConvert.content.length);
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

  return (
    <div className={styles.main}>
      <div className={styles.inputs}>
        <div className={styles.links}>
          <Input placeholder='Medium URL' value={mediumUrl}
            onChange={(e) => setMediumUrl(e.target.value)} />
          <Button isDisabled={mediumUrl.length <= 0} colorScheme='purple' onClick={blogToThread}>Transform blog post</Button>
        </div>
        <div className={styles.links}>
          <Input placeholder='Youtube URL' value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)} />
          <Button isDisabled={youtubeURL.length <= 0} colorScheme='purple' onClick={youtubeToThread}>Transform youtube video</Button>
        </div>
      </div>
      <div>
        {loadingAPICall &&
          <>
            <p>{apiStep}</p>
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="blocks-loading"
              wrapperStyle={{}}
              wrapperClass="blocks-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']} />
          </>
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
        {twitterThreadText}
        {/* <TwitterThread
          setNumberOfTweets={setNumberOfTweets}
          numberOfTweets={numberOfTweets}
          setTwitterThreadText={setTwitterThreadText}
          twitterThreadText={twitterThreadText} /> */}
      </div>
    </div>
  )
}
