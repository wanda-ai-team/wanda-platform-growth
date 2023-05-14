import styles from "@/styles/HomeN.module.css";
import { useRef, useState } from "react";
import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Spinner,
  Text,
  Textarea,
  useRadioGroup,
} from "@chakra-ui/react";
import TwitterThread from "@/components/text/twitterThread/twitterThreadN";
import { getSubtitlesFromYoutube } from "@/utils/api/video/getSubtitlesFromYoutube";
import { getTextSummary } from "@/utils/api/text/getTextSummary";
import { getAudioFromYoutube } from "@/utils/api/video/getAudioFromYoutube";
import { speechToText } from "@/utils/api/AIConvert/speechToText";
import { getBlogText } from "@/utils/api/text/getBlogText";

import { postTweet } from "@/utils/api/text/postTweet";
import { getAudioTranscript } from "@/utils/api/audio/getAudioTranscript";
import { Checkbox } from "@chakra-ui/react";
import { getThread } from "@/utils/api/twitter/getThread";
import Header from "@/components/header";
import RadioTag from "@/components/radio-tag";
import Head from "next/head";
import { outputsWithPlatform, toneList, writingStyles } from "@/utils/globalVariables";

type Contents = "url" | "text" | "podcast";

const inputList: {
  key: Contents;
  value: string;
}[] = [
    {
      key: "url",
      value: "URL",
    },
    {
      key: "text",
      value: "Text",
    },
    {
      key: "podcast",
      value: "Podcast (File)",
    },
  ];

export default function Home() {
  const stopB = useRef(false);
  const canStopB = useRef(false);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [toneStyle, setToneStyle] = useState("");
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [loadingAPICall, setLoadingAPICall] = useState(false);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [twitterThreadText, setTwitterThreadText] = useState([""]);
  const [twitterThreadTextPerTweet, setTwitterThreadTextPerTweet] = useState([
    "",
  ]);
  const [convertedText, setConvertedText] = useState("");
  const [selectedTweets, setSelectedTweets] = useState<any>([]);
  const [numberOfTweets, setNumberOfTweets] = useState(1);
  const [threadPostResult, setThreadPostResult] = useState("");
  const [outputSelectedI, setOutputSelectedI] = useState<Contents>(
    inputList[0].key
  );

  const [outputSelected, setOutputSelected] = useState(outputsWithPlatform[0].platform);
  const [outputSelectedO, setOutputSelectedO] = useState(outputsWithPlatform[0].outputs[0]);

  const [outputSelectedW, setOutputSelectedW] = useState(toneList[0]);
  const [outputSelectedT, setOutputSelectedT] = useState(writingStyles[0]);

  const [postingThread, setPostingThread] = useState(false);
  const [wantTranscript, setWantTranscript] = useState(false);
  const [currentStep, setCurrentStep] = useState<"settings" | "result">(
    "settings"
  );
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "content",
    defaultValue: inputList[0].key,
    onChange: (value: Contents) => setOutputSelectedI(value),
  });

  const group = getRootProps();

  async function convertSummaryS(
    summaryN: string,
    text: boolean,
    toneStyle: string
  ) {
    setLoadingConversion(true);
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
        toneStyle: outputSelectedT,
        writingStyle: outputSelectedW
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

      if (chunkValue === "\n") {
        if (newTweet) {
          index++;
          setNumberOfTweets(index);
          newTweet = false;
        } else {
          newTweet = true;
        }
      }

      if (chunkValue === "\n\n") {
        index++;
        setNumberOfTweets(index);
      }

      if (outputSelected === "Twitter") {
        if (!newTweet) {
          if (chunkValue !== "\n") {
            if (tweetThread[index] !== undefined) {
              tweetThread[index] = tweetThread[index] + chunkValue;
            } else {
              tweetThread[index] = chunkValue;
            }
            tweetThread[index] = tweetThread[index].replace("\n", "");
            setTwitterThreadTextPerTweet([...tweetThread]);
          }
        }
      } else {
        setConvertedText((prev) => prev + chunkValue);
      }
    }

    canStopB.current = false;
    setLoadingConversion(false);
  }

  async function postTweet1() {
    setPostingThread(true);
    const threadResult = await postTweet(twitterThreadTextPerTweet);
    if (threadResult.success) {
      setThreadPostResult(threadResult.content);
    } else {
      setThreadPostResult("Error");
    }
    setPostingThread(false);
  }

  async function youtubeTransformText(youtubeURLN: string, transB = false) {
    if (outputSelectedI !== "url") {
      textToSummary(youtubeURLN);
    } else {
      if (youtubeURLN === "") return;
      if (youtubeURLN.includes("youtube")) {
        youtubeToThread(youtubeURLN, transB);
      } else {
        if (youtubeURLN.includes("spotify")) {
          getAudioTranscript(
            "https://open.spotify.com/episode/6KSA3AdTUc3LLUocRCHCJL?si=5vw8HIzYSqKAPP6h6MRpaQ",
            ""
          );
        } else {
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
    await summarizeTextAndCreateThread(text, "null");
    setLoadingAPICall(false);
  }

  async function youtubeToThread(youtubeURLN: string, transB = false) {
    const subtitles = await getYoutubeSubtitles(youtubeURLN);
    if (subtitles !== "") {
      if (transB) {
        setTranscript(subtitles);
      }
      await summarizeTextAndCreateThread(subtitles, youtubeURLN);
    } else {
      const response = await getAudioFromYoutube(youtubeURLN);
      if (response.success) {
        if (transB) {
          setTranscript(response.content);
        }
        const responseWhisper = await speechToText(response.content);
        if (responseWhisper.success) {
          await summarizeTextAndCreateThread(
            responseWhisper.content,
            youtubeURLN
          );
        }
      }
    }
    setLoadingAPICall(false);
  }
  async function twitterThreadToText(youtubeURLN: string) {
    setLoadingAPICall(true);
    const response = await getThread(youtubeURLN);
    if (response.success) {
      const thread = response.content.flat().toString();
      setSummary(thread);
    }
    setLoadingAPICall(false);
  }

  async function blogToThread(youtubeURLN: string) {
    setLoadingAPICall(true);
    const response = await getBlogText(youtubeURLN);
    if (response.success) {
      await summarizeTextAndCreateThread(response.content, youtubeURLN);
    }
    setLoadingAPICall(false);
  }

  async function getYoutubeSubtitles(youtubeURLN: string) {
    setLoadingAPICall(true);
    const response = await getSubtitlesFromYoutube(youtubeURLN);
    if (response.success) {
      return response.content;
    } else {
      return "";
    }
  }

  async function summarizeTextAndCreateThread(data: any, url: string) {
    const response = await getTextSummary(data, url);
    setTranscript(data);
    if (response.success) {
      setSummary(response.content);
    }

    setLoadingAPICall(false);
  }

  async function submitFile(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setLoadingAPICall(true);
    e.preventDefault();
    let formData = new FormData();
    if (inputFileRef.current === null) {
      return;
    }
    Object.values((inputFileRef.current.files as any)).forEach(file => {
      formData.append('file', (file as Blob | string));
    })

    const res = await fetch("/api/files/uploadFiles", {
      method: "POST",

      body: formData,
    });

    const body = await res.json();
    console.log(body)

    if (body.success) {
      setWantTranscript(true)
      setTranscript(body.content)
      const response = await getTextSummary(body.content, "null");
      if (response.success) {
        setSummary(response.content);
      } else {
      }
      // Do some stuff on successfully upload
    } else {
      // Do some stuff on error
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
          selectedTweets={selectedTweets}
        />
        {threadPostResult !== "" && (
          <a href={threadPostResult}>{threadPostResult}</a>
        )}
      </>
    );
  }

  let handleInputChange = (e: { target: { value: any } }) => {
    if (outputSelected === "twitter") {
      let newArr = [...twitterThreadText];
      newArr[0] = e.target.value;
      setTwitterThreadText([...newArr]);
    } else {
      setConvertedText(e.target.value);
    }
  };

  let handleInputSChange = (e: { target: { value: any } }) => {
    let inputValue = e.target.value;
    setSummary(inputValue);
  };

  const handleStopGeneration = () => (stopB.current = true);

  const handleConvert = () => {
    setConvertedText("");
    setTwitterThreadTextPerTweet([""]);
    if (outputSelected === "Twitter") {
      convertSummaryS(summary, false, toneStyle);
    } else {
      if (outputSelectedO === "Text") {
        convertSummaryS(inputText, true, toneStyle);
      } else {
        convertSummaryS(summary, false, toneStyle);
      }
    }
    // setCurrentStep("result");
  };

  function getTextArea(valueChosen: any) {
    console.log(valueChosen)
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
      <Head>
        <title>Wanda AI</title>
      </Head>
      <Header />

      <main className={styles.main}>
        {currentStep === "settings" ? (
          <>
            <div className={styles.form__container}>
              <div className={styles.title__container}>
                <Text as="h2" fontSize="3xl">
                  Create a AI post
                </Text>
                <Text>
                  Select a content & choose a platform. Political, sexual and
                  discriminatory content will not be approved.
                </Text>
              </div>
              <div className={styles.options}>
                <Text fontWeight="semibold">Post Content</Text>
                <div className={styles.radio__group} {...group}>
                  {inputList.map(({ key, value }) => {
                    const radio = getRadioProps({ value: key });
                    return (
                      <RadioTag
                        key={key}
                        {...radio}
                      >
                        {value}
                      </RadioTag>
                    );
                  })}
                </div>
              </div>
              <div className={styles.inputs}>
                <div className={styles.links}>
                  {outputSelectedI === "url" && (
                    <>
                      <InputGroup>
                        <Input
                          sx={{ backgroundColor: "white" }}
                          placeholder={
                            outputSelectedI === "url"
                              ? "URL (works with Medium, Youtube, Twitter tweets)"
                              : "URL (works with spotify)"
                          }
                          value={youtubeURL}
                          onChange={(e) => {
                            setYoutubeURL(e.target.value);
                            if (e.target.value !== "") {
                              if (outputSelectedI === "url") {
                                youtubeTransformText(
                                  e.target.value,
                                  wantTranscript
                                );
                              } else {
                                // getAudioTranscript(e.target.value);
                              }
                            }
                          }}
                        />
                        {loadingAPICall && (
                          <InputRightElement>
                            <Spinner color="#8F50E2" />
                          </InputRightElement>
                        )}
                      </InputGroup>
                      {/* <Checkbox
                        colorScheme="purple"
                        isChecked={wantTranscript}
                        onChange={(e) => setWantTranscript(e.target.checked)}
                      >
                        Transcript (for video and audios)
                      </Checkbox> */}
                    </>
                  )}

                  {outputSelectedI === "text" && (
                    <Textarea
                      style={{ height: "10vh", width: "40vw" }}
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        if (e.target.value !== "") {
                          youtubeTransformText(e.target.value);
                        }
                      }}
                      placeholder="Paste your text here"
                      size="lg"
                    />
                  )}

                  {outputSelectedI === "podcast" && (
                    <>

                      <InputGroup>
                        <input
                          type="file"
                          name="myfile"
                          accept=".mp3"
                          ref={inputFileRef}
                        />
                        <Button colorScheme="purple" onClick={(e) => submitFile(e)}>
                          Upload
                        </Button>
                        {loadingAPICall && (
                          <InputRightElement>
                            <Spinner color="#8F50E2" />
                          </InputRightElement>
                        )}
                      </InputGroup>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.platform__container}>
                <Text fontWeight="semibold">Select Platform</Text>

                <div className={styles.options}>
                  <Select
                    sx={{ backgroundColor: "white" }}
                    placeholder="Select Platform"
                    onChange={(e) => {
                      setOutputSelected(e.target.value);
                    }}
                    value={outputSelected}
                  >
                    {outputsWithPlatform.map((output, index) => (
                      <option key={index} value={output.platform}>
                        {output.platform}
                      </option>
                    ))}
                  </Select>

                  {outputSelected && (outputSelected !== 'Transcript' && outputSelected !== 'Summary') && (
                    <>
                      {" "}
                      <Select
                        sx={{ backgroundColor: "white" }}
                        onChange={(e) => {
                          setOutputSelectedO(e.target.value);
                        }}
                        value={outputSelectedO}
                      >
                        {outputsWithPlatform.filter(
                          (plat) => plat.platform === outputSelected
                        )[0] !== undefined ? (
                          outputsWithPlatform
                            .filter(
                              (plat) => plat.platform === outputSelected
                            )[0]
                            .outputs.map((output, index) => (
                              <option key={index} value={output}>
                                {output}
                              </option>
                            ))
                        ) : (
                          <></>
                        )}
                      </Select>

                      <Text fontWeight="semibold">Tone Style:</Text>
                      <Select
                        sx={{ backgroundColor: "white" }}
                        onChange={(e) => { setOutputSelectedT(e.target.value); }} value={outputSelectedT} >
                        {toneList.map((output, index) => (
                          <option key={index} value={output}>{output}</option>
                        ))}
                      </Select>


                      <Text fontWeight="semibold">Writing Style:</Text>
                      <Select
                        sx={{ backgroundColor: "white" }}
                        onChange={(e) => { setOutputSelectedW(e.target.value); }} value={outputSelectedW} >
                        {writingStyles.map((output, index) => (
                          <option key={index} value={output}>{output}</option>
                        ))}
                      </Select>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.transcript__summary}>
              <div className={styles.texts}>
                <span className={styles.summary__header}>
                  {outputSelected} AI post
                </span>
              </div>


              <hr className={styles.divider} />
              {getTextArea(outputSelected === 'Summary' ? summary : outputSelected === 'Transcript' ? transcript : convertedText)}

              <div className={styles.texts}>
              </div>
            </div>

            {/* <div className={styles.transcript__summary}>
              <div className={styles.texts}>
                <span className={styles.summary__header}>Summary</span>
                <Textarea
                  disabled={!summary}
                  style={{
                    height: `calc(${wantTranscript ? "40" : "100"}vh  - 200px)`,
                    width: "40vw",
                  }}
                  value={summary}
                  onChange={(e) => {
                    handleInputSChange(e);
                  }}
                  size="lg"
                  resize="none"
                  variant="flushed"
                />
              </div>

              {wantTranscript && <hr className={styles.divider} />}
              {wantTranscript && (
                <div className={styles.texts}>
                  <span className={styles.transcript__header}>Transcript</span>
                  <Textarea
                    disabled={!transcript}
                    style={{ height: "calc(60vh - 168px)", width: "40vw" }}
                    value={transcript}
                    onChange={(e) => {
                      setTranscript(e.target.value);
                    }}
                    size="lg"
                    resize="none"
                    variant="flushed"
                  />
                </div>
              )}
            </div> */}
          </>
        ) : (
          <>
            {/* <div className={styles.form__container}>
              <div className={styles.title__container}>
                <Text as="h2" fontSize="3xl">
                  Edit & Publish AI Post
                </Text>
                <Text>Adjust, edit or add one or all of the posts.</Text>
              </div>
              <Chat
                selectedTweets={selectedTweets}
                twitterThreadText={twitterThreadTextPerTweet}
                setTwitterThreadTextPerTweet={setTwitterThreadTextPerTweet}
              />
            </div> */}

            <div className={styles.transcript__summary}>
              <div className={styles.texts}>
                <span className={styles.summary__header}>
                  {outputSelected} AI post
                </span>
              </div>

              <hr className={styles.divider} />
              <div className={styles.texts}>
                {outputSelected === "Twitter"
                  ? getTwitterThread()
                  : outputSelected !== "" && (
                    <Textarea
                      value={convertedText}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className={styles.generate__footer}>

        <Button
          isDisabled={((summary === "") || canStopB.current)} 
          colorScheme="purple"
          onClick={handleConvert}
        >
          Convert to AI Post
        </Button>
        <Button colorScheme='purple' isDisabled={!canStopB.current} onClick={() => stopB.current = true}> Stop Generation </Button>
        {outputSelected === "Twitter" && (
          <Button
            colorScheme="purple"
            isDisabled={twitterThreadTextPerTweet.length <= 1}
            onClick={postTweet1}
          >
            {postingThread ? <Spinner /> : `Publish on ${outputSelected}`}
          </Button>
        )}

      </footer>
    </>
  );
}
