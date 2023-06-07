import styles from "@/styles/HomeN.module.css";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RepeatIcon } from '@chakra-ui/icons'
import {
  InputRightAddon,
  Button,
  IconButton,
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
import { useSession } from 'next-auth/react';
import { useRouter } from "next/router";

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
  const router = useRouter();
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
  async function getUser() {
    await fetch('/api/user/getUser')
      .then((res) => res.json())
      .then(async (data1) => {
        if (data1.content[0].data.isActive === false) {
          router.push('/payment');
        }
      }).catch((err) => {
      });
  }

  useEffect(() => {
    console.log("Olaa")
    getUser();
  }, []);

  async function test1() {
    const response = await fetch("/api/agents/agent_textToSummary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        textData: "he ability to run open-source large language models (LLM) with billions of parameters is a superpower that not many people know about. Imagine having ChatGPT operating on your personal computer, allowing you to utilize any language model without limitations. In this article, I am going to show you a step-by-step guide on how you can run AI chatbots for free on your local machine. Let’s get started. What is Text Generation WebUI? Text generation web UI is a Gradio WebUI for running LLMs. Its goal is to provide a simple and easy-to-use interface when running powerful chatbots on your local machine. Here’s an example: What is Text Generation WebUI? Text generation web UI is a Gradio WebUI for running LLMs. Its goal is to provide a simple and easy-to-use interface when running powerful chatbots on your local machine. Image by Jim Clyde Monge How to install Step 1: Setup the WebUI Download and unzip this zip file: oobabooga-windows.zip Step 1: Setup the WebUI Download and unzip this zip file: oobabooga-windows.zip Image by Jim Clyde Monge Double-click on the “install.bat” file. A command-line window will show up and install all the requirements and dependency files. Double-click on the “install.bat” file. A command-line window will show up and install all the requirements and dependency files. Image by Jim Clyde Monge Make sure you see the “Finished processing dependencies...” message at the end. Step 2: Download the AI model In this step, we will be setting up the GPT-4 x Alpaca project from HuggingFace. Note that you can use other language models; head over to the HuggingFace conversational AI page to explore. Copy the command below and paste it into a CLI pointing to the \text-generation-webui\models folder. # Make sure you have git-lfs installed (https://git-lfs.com) git lfs install git clone https://huggingface.co/anon8231489123/gpt4-x-alpaca-13b-native-4bit-128g # if you want to clone without large files – just their pointers # prepend your git clone with the following env var: GIT_LFS_SKIP_SMUDGE=1 You should see these cloned project files on your local disk: Download the 8GB language model file gpt-x-alpaca-13b-native-4bit-128g-cuda.pt and paste it into the “gpt4-x-alpaca-13b-native-4bit-128g” folder. Image by Jim Clyde Monge Download the 8GB language model file gpt-x-alpaca-13b-native-4bit-128g-cuda.pt and paste it into the “gpt4-x-alpaca-13b-native-4bit-128g” folder. Step 3: Run the WebUI Before running the WebUI, open the start-webui.bat file and make a few changes to the script: @echo off @echo Starting the web UI… cd /D “%~dp0” set MAMBA_ROOT_PREFIX=%cd%\installer_files\mamba set INSTALL_ENV_DIR=%cd%\installer_files\env if not exist “%MAMBA_ROOT_PREFIX%\condabin\micromamba.bat” ( call “%MAMBA_ROOT_PREFIX%\micromamba.exe” shell hook >nul 2>&1 ) call “%MAMBA_ROOT_PREFIX%\condabin\micromamba.bat” activate “%INSTALL_ENV_DIR%” || ( echo MicroMamba hook not found. && goto end ) cd text-generation-webui call python server.py — auto-devices — chat — wbits 4 — groupsize 128 :end pause Finally, double-click the batch file to load the model. Run the WebUI Before running the WebUI, open the start-webui.bat file and make a few changes to the script: Image by Jim Clyde Monge The web interface should be running in your local browser via http://127.0.0.1:7860. The web interface should be running in your local browser via http://127.0.0.1:7860. Image by Jim Clyde Monge Awesome. Now you can begin chatting with the gpt-x-alpaca AI model. If you encounter any issues while running the program on your local machine, feel free to ask for help in the comments. Final Thoughts Overall, I am impressed with how easy it is nowadays to run large language models on your local PC. However, as users, we must exercise caution when using these open-source language models, as their capabilities can be both beneficial and detrimental. You can use it to probably entertain yourself or impress your friends, but not to perpetuate biases and stereotypes or produce harmful content. In a future article, I will show you how to create a chatbot that can act as a virtual girlfriend.",
        url: "https://github.com/wanda-ai/langchain-py/tree/main/api"
      }),
    });
  }

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
    await summarizeTextAndCreateThread(text, "null", text);
    setLoadingAPICall(false);
  }

  async function youtubeToThread(youtubeURLN: string, transB = true) {
    let subtitles = await getYoutubeSubtitles(youtubeURLN);
    console.log("subtitles")
    if (subtitles !== "") {
      console.log("subtitles1")
      let stringF = "";
      const sub = subtitles;
      sub.forEach((element: any) => {
        stringF = stringF + '[' + element.offser + 's] ' + element.text + "\n";
      });
      console.log(stringF)
      setTranscript(stringF);
      toast.success('Transcript done', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log("subtitles2")

      subtitles = subtitles.map((caption: any) => caption.text);
      subtitles = subtitles.join('');
      subtitles = subtitles.replace(/(\r\n|\n|\r)/gm, "");
      await summarizeTextAndCreateThread(subtitles, youtubeURLN, stringF);
    } else {
      const response = await getAudioFromYoutube(youtubeURLN);
      if (response.success) {
        if (transB) {
          setTranscript(response.content);
          toast.success('Transcript done', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        const responseWhisper = await speechToText(response.content);
        if (responseWhisper.success) {
          await summarizeTextAndCreateThread(
            responseWhisper.content,
            youtubeURLN,
            responseWhisper.content
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
      await summarizeTextAndCreateThread(response.content, youtubeURLN, response.content);
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

  async function summarizeTextAndCreateThread(data: any, url: string, transc: string = "") {
    const response = await getTextSummary(data, url);
    setTranscript(transc);
    console.log("Ola111aa")

    if (response.success) {
      setSummary(response.content);
      
      toast.success('Summary done', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      toast.error('OpenAPI is overloaded, please try again later', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
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
                                  if (e.target.value.includes('youtu.be')) {
                                    const urlN = 'https://www.youtube.com/watch?v=' + e.target.value.split('youtu.be/')[1];
                                    youtubeTransformText(
                                      urlN,
                                      wantTranscript
                                    );
                                  } else {
                                    youtubeTransformText(
                                      e.target.value,
                                      wantTranscript
                                    );

                                  }
                                } else {
                                  // getAudioTranscript(e.target.value);
                                }
                              }
                            }}
                          />
                          {loadingAPICall && (
                            <InputRightElement style={{ marginLeft: '-1rem' }}>
                              <Spinner color="#8F50E2" />
                            </InputRightElement>
                          )}
                        </InputGroup>
                        <InputRightAddon style={{backgroundColor: '#f7f5fa', borderWidth: '0px'}}>
                          {/* right add-on element */}
                          <IconButton
                            onClick={() => {
                              setTranscript("");
                              setSummary("");
                              if (youtubeURL !== "") {
                                if (outputSelectedI === "url") {
                                  if (youtubeURL.includes('youtu.be')) {
                                    const urlN = 'https://www.youtube.com/watch?v=' + youtubeURL.split('youtu.be/')[1];
                                    youtubeTransformText(
                                      urlN,
                                      wantTranscript
                                    );
                                  } else {
                                    youtubeTransformText(
                                      youtubeURL,
                                      wantTranscript
                                    );

                                  }
                                } else {
                                  // getAudioTranscript(e.target.value);
                                }
                              }
                            }}
                            variant='outline'
                            colorScheme='purple'
                            aria-label='Call Sage'
                            icon={<RepeatIcon />}
                          />
                        </InputRightAddon>
                      </InputGroup>

                    </>
                  )}

                  {outputSelectedI === "text" && (
                    <>
                      <InputGroup>
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
                        {loadingAPICall && (
                          <InputRightElement>
                            <Spinner color="#8F50E2" />
                          </InputRightElement>
                        )}
                      </InputGroup>
                    </>
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
                    onChange={(e) => {
                      setOutputSelected(e.target.value);
                      setOutputSelectedO(outputsWithPlatform.filter(v => v.platform === e.target.value)[0].outputs[0]);
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
      </main >

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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
    </>
  );
}

Home.auth = true