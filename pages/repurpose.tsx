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
  Box,
  HStack,
  VStack,
  Progress,
  RadioGroup,
  Radio,
  Link,
} from "@chakra-ui/react";
import TwitterThread from "@/components/text/twitterThread/twitterThreadN";
import { getSubtitlesFromYoutube } from "@/utils/api/video/getSubtitlesFromYoutube";
import { getTextSummary } from "@/utils/api/text/getTextSummary";
import { getAudioFromYoutube } from "@/utils/api/video/getAudioFromYoutube";
import { speechToText, speechToTextYoutubeVideo } from "@/utils/api/AIConvert/speechToText";
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
import toastDisplay from "@/utils/common/toast";
import { useChat } from 'ai/react';
import streamResponse from "@/utils/common/stream";
import { Mixpanel } from "@/utils/mixpanel";
import { urlToTranscript } from "@/utils/common/transcript/transcript";

type Contents = "url" | "text" | "podcast";
type ContentsAV = "gong" | "file";

const inputList: {
  key: Contents;
  value: string;
}[] = [
    // {
    //   key: "context",
    //   value: "Created Content"
    // },
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
      value: "Video & Audio",
    },
  ];

const inputListaudioVideo: {
  key: ContentsAV;
  value: string;
}[] = [
    {
      key: "gong",
      value: "Gong Calls"
    },
    {
      key: "file",
      value: "File",
    },
  ];


export default function Repurpose() {
  const router = useRouter();
  const inputFileRefF = useRef<HTMLInputElement>(null);
  const stopB = useRef(false);
  const canStopB = useRef(false);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [toneStyle, setToneStyle] = useState("");
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [loadingAPICall, setLoadingAPICall] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [twitterThreadText, setTwitterThreadText] = useState([""]);
  const [projects, setProjects] = useState([]);
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

  const [outputSelectedAudioVideo, setOutputSelectedAudioVideo] = useState<ContentsAV>(
    inputListaudioVideo[0].key
  );

  const [outputSelected, setOutputSelected] = useState(outputsWithPlatform[0].platform);
  const [outputSelectedO, setOutputSelectedO] = useState(outputsWithPlatform[0].outputs[0]);

  const [outputSelectedW, setOutputSelectedW] = useState(toneList[0]);
  const [outputSelectedT, setOutputSelectedT] = useState(writingStyles[0]);
  const [wantTranscript, setWantTranscript] = useState(false);
  const [landingURL, setLandingURL] = useState("");
  const [selectedProject, setSelectedproject] = useState("");
  const [currentStep, setCurrentStep] = useState<"settings" | "result">(
    "settings"
  );
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  async function getCallsGongInit() {
    await getCalls();
  }

  async function getProjects() {
    setLoadingProjects(true);
    await fetch('/api/user/getProjectsWithInfo')
      .then((res) => res.json())
      .then(async (data1) => {
        if (data1.projects.length > 0) {
          setProjects(data1.projects)
          setSelectedproject(data1.projects[0].id)
        } else {
          setProjects([])
        }
        setLoadingProjects(false);
      }).catch((err) => {
        setLoadingProjects(false);
      });
  }

  useEffect(() => {
    // getUser();
    getProjects();
    getCallsGongInit()

    Mixpanel.track("Loaded Repurpose Page");
  }, []);

  async function convertSummaryS(
    summaryN: string,
    text: boolean,
    toneStyle: string,
    landingPageURL: string = ""
  ) {
    let websitescrape: {
      content?: string;
      context?: string;
    } = {};

    if (landingPageURL !== "") {
      websitescrape = await fetch("/api/onboarding/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: landingPageURL,
          businessName: landingPageURL
        }),
      })
        .then((response) => response.json())
        .then(async ({ data, siteContent, success }: any) => {
          if (success) {
            return { context: data.target_audience + " " + data.product, content: siteContent.replace(/(\r\n|\n|\r)/gm, "") };
          } else {
            return {}
          }
        })
    }
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
        writingStyle: outputSelectedW,
        landingPageContent: websitescrape.content ? websitescrape.content : "",
        landingPageContext: websitescrape.context ? websitescrape.context : "",
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }

    await streamResponse(data, setConvertedText, canStopB, stopB, setNumberOfTweets, outputSelected, setTwitterThreadTextPerTweet);


    canStopB.current = false;
    setLoadingConversion(false);
    setLoadingC(false);
  }

  async function contentToText(url: string, transB = false) {
    if (outputSelectedI !== "url") {
      textToSummary(url);
    } else {
      if (url === "") return;
      if (url.includes("youtube")) {
        youtubeToThread(url, transB);
      } else {
        if (url.includes("spotify")) {
          getAudioTranscript(
            "https://open.spotify.com/episode/6KSA3AdTUc3LLUocRCHCJL?si=5vw8HIzYSqKAPP6h6MRpaQ",
            ""
          );
        } else {
          if (url.includes("twitter")) {
            twitterThreadToText(url);
          } else {
            blogToThread(url);
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
    if (subtitles !== "") {
      let stringF = "";
      const sub = subtitles;
      sub.forEach((element: any) => {
        stringF = stringF + '[' + element.offser + 's] ' + element.text + "\n";
      });
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

      subtitles = subtitles.map((caption: any) => caption.text);
      subtitles = subtitles.join('');
      subtitles = subtitles.replace(/(\r\n|\n|\r)/gm, "");
      await summarizeTextAndCreateThread(subtitles, youtubeURLN, stringF);
    } else {
      const response = await getAudioFromYoutube(youtubeURLN);
      if (response.success) {
        if (transB) {
          setTranscript(response.content);
          toastDisplay('Transcript done', true);
        }
        console.log(response.content);
        const responseWhisper = await speechToTextYoutubeVideo(response.content.videoId);

        if (responseWhisper.success) {
          console.log(responseWhisper);
          
          toastDisplay('Transcript done', true);
          setTranscript(responseWhisper.content);
          await summarizeTextAndCreateThread(
            responseWhisper.content,
            youtubeURLN,
            responseWhisper.content
          );
          
          toastDisplay('Summary done', true);
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
      toastDisplay('Correctly loaded!', true);
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

  async function summarizeTextAndCreateThread(data: any, url: string, transc: string = "", output: string = "") {
    const response = await getTextSummary(data, url, output);
    setTranscript(transc);
    if (response.success) {
      setSummary(response.content);
      toastDisplay('Summary done', true);
    } else {
      toastDisplay('Error while doing the summary, please try again', false);
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

  const handleConvert = async (landingPageURL = "") => {
    Mixpanel.track("Clicked Convert Button", { "Page": "Repurpose", "Input Type": outputSelectedI, "Output Type": outputSelected, "Output Type O": outputSelectedO, "Output Tone": outputSelectedT, "Output Writing Style": outputSelectedW, "Landing Page URL": landingPageURL })
    setConvertedText("");
    setTwitterThreadTextPerTweet([""]);
    setLoadingC(true);
    // if (outputSelectedI === 'context') {
    //   const response = await getStoredThreads(selectedProject);
    //   if (response.success) {
    //     await convertSummaryS(response.project.content, false, toneStyle);
    //   }
    // } else {
    if (outputSelected === "Twitter") {
      await convertSummaryS(summary, false, toneStyle);
    } else {
      if (outputSelectedO === "Text") {
        await convertSummaryS(inputText, true, toneStyle);
      } else {
        if (outputSelected === "Landing Page") {
          await convertSummaryS(summary, false, toneStyle, landingPageURL);
        } else {
          await convertSummaryS(summary, false, toneStyle);
        }
      }
    }
    // }
    setLoadingC(false);
    // setCurrentStep("result");
  };

  const [gongCallsA, setGongCallsA] = useState([]);
  const [selectedGongCall, setSelectedGongCall] = useState<any>({});
  const [loadingGongCalls, setLoadingGongCalls] = useState<boolean>(true);
  const [gongConnected, setGongConnected] = useState<boolean>(false);
  async function getCalls() {
    setLoadingGongCalls(true);
    await fetch('/api/integrations/gong/getCallByDateWithToken')
      .then(response => response.json())
      .then(data => {
        setGongConnected(true);
        if (data.success) {
          setGongCallsA(data.content);
          setSelectedGongCall(data.content[0].id);
        } else {
          if (data.content.includes("authorization")) {
            setGongConnected(false);
          }
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    setLoadingGongCalls(false);
  }


  async function getCallInformation(callId: string) {
    setLoadingGongCalls(true);
    await fetch('/api/integrations/gong/getCallTranscriptById', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callId: [callId],
      }),
    })
      .then(response => response.json())
      .then(async data => {
        if (data.success) {
          await summarizeTextAndCreateThread(data.content, callId, data.content);
        } else {
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    setLoadingGongCalls(false);
  }

  function gongCalls() {
    return (
      <>
        {!gongConnected ?
          <Text>
            Gong account is not connected. <Link color='teal.500' href="/profile"> Please connect it here </Link>
          </Text>
          :
          <>
            <Select
              sx={{ backgroundColor: "white" }}
              value={selectedGongCall}
              onChange={(e) => { setSelectedGongCall(e.target.value); }}
            >
              {gongCallsA.map((call: any, index: number) => (
                <option key={index} value={call.id}>
                  {call.title.substring(0, 75) + ' ...'}
                </option>
              ))}
            </Select>

            <Button colorScheme="purple" onClick={async (e) => {
              getCallInformation(selectedGongCall);
            }} >
              Get Call Summary
            </Button>
          </>
        }
      </>
    )
  }

  // Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
  function AudioVideoRadioGroup() {
    const { getRootProps, getRadioProps } = useRadioGroup({
      name: "contentAV",
      defaultValue: inputListaudioVideo[0].key,
      onChange: async (value: ContentsAV) => { setOutputSelectedAudioVideo(value); Mixpanel.track("Changed Input Type", { "Input Type": value, "Page": "Repurpose" }) },
    })

    const group = getRootProps()

    if (outputSelectedI === "podcast") {
      return (
        <div className={styles.radio__group} {...group}>
          {inputListaudioVideo.map(({ key, value }) => {
            const radioV = getRadioProps({ value: key });
            return (
              <RadioTag
                key={key}
                {...radioV}
              >
                {value}
              </RadioTag>
            );
          })}
        </div>
      )
    }
    return (
      <>
      </>
    )
  }
  function InputRadioGroup() {
    const { getRootProps, getRadioProps } = useRadioGroup({
      name: "content",
      defaultValue: inputList[0].key,
      onChange: (value: Contents) => { setOutputSelectedI(value); Mixpanel.track("Changed Input Type", { "Input Type": value, "Page": "Repurpose" }) },
    })

    const group = getRootProps()

    return (
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
    )
  }

  function getTextArea(valueChosen: any) {
    console.log(outputSelected)
    if (outputSelected === 'Twitter') {
      return getTwitterThread();
    }

    if (outputSelected !== '') {
      return (
        <>
          <Textarea
            style={{ height: '100%', marginRight: '1.5%', width: '97%', marginLeft: '1.5%' }}
            value={valueChosen}
            onChange={handleInputChange}
            placeholder='Here is a sample placeholder'
            size='lg' />
        </>
      )
    }
  }

  const uploadPhoto = async (e: any) => {
    setLoadingAPICall(true);

    if (inputFileRef === null || inputFileRef.current === null || inputFileRef.current.files === null || inputFileRef.current.files.length === 0) {
      return;
    }

    const file = inputFileRef.current.files[0];
    const filename = encodeURIComponent(inputFileRef.current.files[0].name.replace(/\s/g, ""));
    const res = await fetch(`/api/files/upload/upload?file=${filename}`);
    let { url, fields } = await res.json();
    const formData = new FormData();

    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      // @ts-ignore
      formData.append(key, value);
    });

    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (upload.ok) {
      let URLF = url + filename;

      if (fields.success_action_status === '201') {
        const response = await urlToTranscript(URLF, true, false, true, false, false, 'Upload done, transcribing..');

        setWantTranscript(true)
        if (typeof response.transcript === 'string') {
          setTranscript(response.transcript);
        }
        else {
          setTranscript(response.transcript.text);
        }

        if (response.summary !== undefined) {
          setSummary(response.summary);
        }
        else {
          setSummary(response.transcript.summary);
        }
        toastDisplay('Summary done', true);
        setLoadingAPICall(false);
      } else {
        toastDisplay('Error with the upload', false);
        setLoadingAPICall(false);
        console.error('Upload failed.');
      }
    }
  };

  return (
    <>
      <main className={styles.main}>
        {currentStep === "settings" ? (
          <>
            <div className={styles.form__container}>
              <div className={styles.title__container}>
                <Text as="h2" fontSize="3xl">
                  Repurpose social content
                </Text>
                <Text>
                  Repurpose your content to other platforms
                </Text>
              </div>
              <div className={styles.options}>
                <Text fontWeight="semibold">Choose input content type:</Text>
                {InputRadioGroup()}
              </div>
              <div className={styles.inputs}>
                <div className={styles.links}>
                  {outputSelectedI === "url" && (
                    <>
                      <InputGroup>
                        <Input
                          sx={{ backgroundColor: "white" }}
                          isDisabled={loadingAPICall}
                          placeholder={
                            outputSelectedI === "url"
                              ? "URL (works with Medium, Youtube, X)"
                              : "URL (works with spotify)"
                          }
                          value={youtubeURL}
                          onChange={(e) => {
                            setYoutubeURL(e.target.value);
                            if (e.target.value !== "") {
                              if (outputSelectedI === "url") {
                                let urlN = e.target.value;
                                if (e.target.value.includes('youtu.be')) {
                                  urlN = 'https://www.youtube.com/watch?v=' + e.target.value.split('youtu.be/')[1];
                                }
                                contentToText(
                                  urlN,
                                  wantTranscript
                                );
                              } else {
                                // getAudioTranscript(e.target.value);
                              }
                            }
                          }}
                        />
                        <InputRightAddon style={{ backgroundColor: '#f7f5fa', borderWidth: '0px' }}>
                          {/* right add-on element */}
                          <IconButton
                            isDisabled={loadingAPICall}
                            onClick={() => {
                              setTranscript("");
                              setSummary("");
                              if (youtubeURL !== "") {
                                if (outputSelectedI === "url") {
                                  if (youtubeURL.includes('youtu.be')) {
                                    const urlN = 'https://www.youtube.com/watch?v=' + youtubeURL.split('youtu.be/')[1];
                                    contentToText(
                                      urlN,
                                      wantTranscript
                                    );
                                  } else {
                                    contentToText(
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
                          style={{ height: "10vh" }}
                          value={inputText}
                          onChange={(e) => {
                            setInputText(e.target.value);
                          }}
                          placeholder="Paste your text here"
                          size="lg"
                        />
                      </InputGroup>

                      <Button
                        isDisabled={((inputText === ""))}
                        colorScheme="purple"
                        onClick={() => contentToText(inputText)}
                      >
                        Start analysis
                      </Button>
                    </>
                  )}

                  {loadingAPICall && (
                    <Progress size='xs' isIndeterminate />
                  )}

                  {AudioVideoRadioGroup()}
                  {outputSelectedI === "podcast" && (
                    <>
                      {outputSelectedAudioVideo === "gong" && (
                        loadingGongCalls ?
                          <>
                            <Text>
                              Loading Gong calls.
                            </Text>
                            <Progress size='xs' isIndeterminate />
                          </>
                          :
                          gongCalls()
                      )}
                      {outputSelectedAudioVideo === "file" && (
                        <InputGroup>
                          <input
                            type="file"
                            name="myfile"
                            accept="audio/*,video/*"
                            ref={inputFileRef}
                          />
                          <Button colorScheme="purple" onClick={(e) => uploadPhoto(e)}>
                            Upload
                          </Button>
                          {loadingAPICall && (
                            <InputRightElement>
                              <Spinner color="#8F50E2" />
                            </InputRightElement>
                          )}
                        </InputGroup>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className={styles.platform__container}>
                <div className={styles.options}>
                  <HStack>
                    <VStack align={"start"} w={outputSelected !== "Summary" && outputSelected !== "Transcript" ? "50%" : "100%"}>
                      <Text fontWeight="semibold">Output Platform:</Text>
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
                    </VStack>
                    {outputSelected && (outputSelected !== 'Transcript' && outputSelected !== 'Summary') && (
                      <VStack align={"start"} w={"50%"}>
                        <Text fontWeight="semibold">Output Type:</Text>
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
                      </VStack>
                    )}
                  </HStack>

                  {outputSelected && (outputSelected !== 'Transcript' && outputSelected !== 'Summary') && (
                    <HStack w={"100%"}>
                      <VStack align={"start"} w={"50%"}>
                        <Text fontWeight="semibold">Tone Style:</Text>
                        <Select
                          sx={{ backgroundColor: "white" }}
                          onChange={(e) => { setOutputSelectedT(e.target.value); }} value={outputSelectedT} >
                          {toneList.map((output, index) => (
                            <option key={index} value={output}>{output}</option>
                          ))}
                        </Select>
                      </VStack>

                      <VStack align={"start"} w={"50%"}>
                        <Text fontWeight="semibold">Writing Style:</Text>
                        <Select
                          sx={{ backgroundColor: "white" }}
                          onChange={(e) => { setOutputSelectedW(e.target.value); }} value={outputSelectedW} >
                          {writingStyles.map((output, index) => (
                            <option key={index} value={output}>{output}</option>
                          ))}
                        </Select>
                      </VStack>
                    </HStack>
                  )}

                  {outputSelected === "Landing Page" && (
                    <VStack align={"start"} w={"100%"}>
                      <Text fontWeight="semibold">Current Landing Page:</Text>
                      <Input
                        sx={{ backgroundColor: "white" }}
                        isDisabled={loadingAPICall}
                        placeholder={"Current landing page"}
                        value={landingURL}
                        onChange={(e) => {
                          setLandingURL(e.target.value);
                        }}
                        type="url"
                      />
                    </VStack>
                  )}

                  {outputSelected !== "Summary" && outputSelected !== "Transcript" && (
                    <Button
                      isDisabled={(
                        // (outputSelectedI !== "context" && summary === "")
                        // || canStopB.current
                        // || (outputSelectedI === "context" && selectedProject === "")

                        (summary === "")
                        || canStopB.current
                        || (selectedProject === "")
                      )}
                      colorScheme="purple"
                      onClick={() => handleConvert(landingURL)}
                    >
                      Convert to {outputSelected} {outputSelectedO}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.transcript__summary}>
              <div className={styles.texts}>
                <span className={styles.summary__header}>
                  {outputSelected} {outputSelectedO}
                </span>
              </div>


              <hr className={styles.divider} />

              {loadingC && (
                <div style={{ width: '100%', marginTop: '-15px' }}>
                  <Progress size='xs' isIndeterminate />
                </div>
              )}

              {getTextArea(outputSelected === 'Summary' ? summary : outputSelected === 'Transcript' ? transcript : convertedText)}

              <div className={styles.texts}>
              </div>
            </div>          
          </>
        ) : (
          <>
            <div className={styles.transcript__summary}>
              <div className={styles.texts}>
                <span className={styles.summary__header}>
                  {outputSelected} AI post
                </span>
              </div>

              <hr className={styles.divider} />



              <div className={styles.texts}>
                {outputSelected === "Twitter"
                  ?
                  <>
                  </>
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
        <Button colorScheme='purple' isDisabled={!canStopB.current} onClick={() => stopB.current = true}> Stop Generation </Button>

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

Repurpose.auth = true