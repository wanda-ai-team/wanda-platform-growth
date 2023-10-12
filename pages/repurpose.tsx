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
import toastDisplay from "@/utils/common/toast";
import { put, type PutBlobResult } from '@vercel/blob';

type Contents = "context" | "url" | "text" | "podcast";

const inputList: {
  key: Contents;
  value: string;
}[] = [
    {
      key: "context",
      value: "Created Content"
    },
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
      value: "Podcast & Video (File)",
    },
  ];

export default function Repurpose() {
  const router = useRouter();
  const inputFileRefF = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
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

  const [outputSelected, setOutputSelected] = useState(outputsWithPlatform[0].platform);
  const [outputSelectedO, setOutputSelectedO] = useState(outputsWithPlatform[0].outputs[0]);

  const [outputSelectedW, setOutputSelectedW] = useState(toneList[0]);
  const [outputSelectedT, setOutputSelectedT] = useState(writingStyles[0]);

  const [postingThread, setPostingThread] = useState(false);
  const [wantTranscript, setWantTranscript] = useState(false);
  const [landingURL, setLandingURL] = useState("");
  const [selectedProject, setSelectedproject] = useState("");
  const [currentStep, setCurrentStep] = useState<"settings" | "result">(
    "settings"
  );
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "content",
    defaultValue: inputList[0].key,
    onChange: (value: Contents) => setOutputSelectedI(value),
  });

  async function getStoredThreads(selectedProject: string) {
    return await fetch('/api/user/getProjectById', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: selectedProject
      }),
    })
      .then((res) => res.json())
      .then(async (data1) => {
        return data1;
      }).catch((err) => {
        return err;
      })
  }

  const group = getRootProps();

  async function getUser() {
    await fetch('/api/user/getUser')
      .then((res) => res.json())
      .then(async (data1) => {
        // if (data1.content[0].data.isActive === false) {
        //   router.push('/payment');
        // }
      }).catch((err) => {
      });
  }

  async function getProjects() {
    setLoadingProjects(true);
    await fetch('/api/user/getProjectsWithInfo')
      .then((res) => res.json())
      .then(async (data1) => {
        console.log("data1.projects")
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
    toneStyle: string,
    landingPageURL: string = ""
  ) {
    let websitescrape: {
      content?: string;
      context?: string;
    }  = {};

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
          console.log(data);
          console.log(success);
          if (success) {
            return { context: data.target_audience + " " + data.product, content: siteContent.replace(/(\r\n|\n|\r)/gm, "") };
          } else {
            return {}
          }
        })
    }
    console.log("summaryN")
    console.log(websitescrape)

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
    console.log("response")
    console.log(response)
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    console.log("data")
    console.log(data)

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

      // if (chunkValue === "\n") {
      //   if (newTweet) {
      //     index++;
      //     setNumberOfTweets(index);
      //     newTweet = false;
      //   } else {
      //     newTweet = true;
      //   }
      // }

      // if (chunkValue === "\n\n") {
      //   index++;
      //   setNumberOfTweets(index);
      // }


      console.log("chunkValue")
      console.log(chunkValue)


      if (outputSelected === "Twitter") {

        if (/\n/.exec(chunkValue)) {
          if (chunkValue === "\n" || chunkValue === "\n\n") {
            console.log("chunkValue333")
            index++;
            setNumberOfTweets(index);
          } else {
            if (chunkValue.length > 5) {
              chunkValue.split(/\n/).map((value) => {
                console.log("value")
                console.log(value)
                if (value !== "") {
                  tweetThread[index] = value;
                  setTwitterThreadTextPerTweet([...tweetThread]);
                  index++;
                  setNumberOfTweets(index);
                }
              });
            }
          }
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
    setLoadingConversion(false);
    setLoadingC(false);
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

  async function summarizeTextAndCreateThread(data: any, url: string, transc: string = "") {
    console.log("Ola")
    console.log(data)
    console.log(url)
    
    const response = await getTextSummary(data, url);
    setTranscript(transc);
    console.log("Ola111aa")
    console.log(response)
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
      toast.error('OpenAI is overloaded, please try again later', {
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
    if (inputFileRef === null || inputFileRef.current === null || inputFileRef.current.files === null || inputFileRef.current.files.length === 0) {
      return;
    }
    let a;

    for (let i = 0; i < inputFileRef.current.files.length; i++) {
      console.log("file")
      console.log(inputFileRef.current.files[i])

      a = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          if (!event.target) return;
          resolve(event.target.result);
        };

        reader.onerror = (err) => {
          reject(err);
        };
        if (inputFileRef === null || inputFileRef.current === null || inputFileRef.current.files === null || inputFileRef.current.files.length === 0) {
          return;
        }
        reader.readAsDataURL(inputFileRef.current.files[i]);
      });
    }

    console.log("a")
    console.log(a)

    await fetch("/api/llm/whisper/speechToTextAAI", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: a,
      }),
    })
      .then((response) => response.json())
      .then(async ({ content, success }: any) => {
        console.log("data")
        console.log(content)
        if (success) {
          setWantTranscript(true)
          setTranscript(content)
          const response = await getTextSummary(content, "null");
          if (response.success) {
            setSummary(response.content);
          } else {
          }
          // Do some stuff on successfully upload
        } else {
          // Do some stuff on error
        }

        setLoadingAPICall(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoadingAPICall(false);
      });





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
    setConvertedText("");
    setTwitterThreadTextPerTweet([""]);
    setLoadingC(true);
    if (outputSelectedI === 'context') {
      const response = await getStoredThreads(selectedProject);
      if (response.success) {
        await convertSummaryS(response.project.content, false, toneStyle);
      }
    } else {
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
    }
    setLoadingC(false);
    // setCurrentStep("result");
  };

  function getTextArea(valueChosen: any) {
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
    console.log("ola")

    const file = inputFileRef.current.files[0];
    const filename = encodeURIComponent(inputFileRef.current.files[0].name.replace(/\s/g, ""));
    const res = await fetch(`/api/files/upload/upload?file=${filename}`);
    let { url, fields } = await res.json();
    const formData = new FormData();

    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      console.log("key")
      console.log(key)
      console.log("value")
      console.log(value)
      // @ts-ignore
      formData.append(key, value);
    });

    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (upload.ok) {
      console.log("url")
      console.log(url + filename)
      let URLF = url + filename;
      toastDisplay('Upload done, transcribing..', true);

      // const formData = new FormData();

      // Object.entries({ ...fields, file }).forEach(([key, value]) => {
      //   // @ts-ignore
      //   formData.append(key, value);
      // });

      // const upload = await fetch(url, {
      //   method: 'POST',
      //   body: formData,
      // });

      if (fields.success_action_status === '201') {
        const decoder = new TextDecoder();
        const response = await fetch("/api/llm/whisper/speechToTextAAIURL", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: URLF,
          }),
        })
        let done = false;
        console.log("response")
        console.log(response)
        if (response === undefined) return;
        const reader = response?.body?.getReader();
        let trans = "";
        while (!done) {
          if (reader === undefined) return;
          const { value, done: doneReading } = await reader?.read();

          done = doneReading;
          if (value && decoder.decode(value) !== "processing") {

            const data = decoder.decode(value);
            // Do something with data
            trans += data;
          };

        }
        setWantTranscript(true)
        setTranscript(trans)
        toastDisplay('Transcript done, summarizing...', true);
        const responseS = await getTextSummary(trans, "null");
        console.log("responseS")
        console.log(responseS)
        if (responseS.success && responseS.content !== "Error") {
          setSummary(responseS.content);
          toastDisplay('Summary done', true);
        } else {
          toastDisplay('Error while doing the summary, please try again', false);
        }


        setLoadingAPICall(false);

        // await fetch("/api/llm/whisper/speechToTextAAIURL", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     url: "https://storage.googleapis.com/audios-wanda/" + filename,
        //   }),
        // })
        //   .then((response) => response.json())
        //   .then(async ({ content, success }: any) => {
        //     console.log("data")
        //     console.log(content)
        //     if (success) {
        //       setWantTranscript(true)
        //       setTranscript(content)
        //       toastDisplay('Transcript done', true);
        //       const response = await getTextSummary(content, "null");
        //       if (response.success) {
        //         setSummary(response.content);
        //         toastDisplay('Summary done', true);
        //       } else {
        //       }
        //       // Do some stuff on successfully upload
        //     } else {
        //       // Do some stuff on error
        //     }

        //     setLoadingAPICall(false);
        //   })
        //   .catch((error) => {
        //     console.error("Error:", error);
        //     setLoadingAPICall(false);
        //   });


        console.log('Uploaded successfully!');
      } else {
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
                          isDisabled={loadingAPICall}
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
                        onClick={() => youtubeTransformText(inputText)}
                      >
                        Start analysis
                      </Button>
                    </>
                  )}

                  {outputSelectedI === "context" && loadingProjects && (
                    <>
                      <Text>
                        Loading created content.
                      </Text>
                      <Progress size='xs' isIndeterminate />
                    </>
                  )}


                  {outputSelectedI === "context" && !loadingProjects && projects.length <= 0 && (
                    <Text>
                      No previous created content.
                    </Text>
                  )}
                  {outputSelectedI === "context" && projects.length > 0 && (
                    <>
                      <Select
                        sx={{ backgroundColor: "white" }}
                        // onChange={(e) => {
                        //   setOutputSelected(e.target.value);
                        //   setOutputSelectedO(outputsWithPlatform.filter(v => v.platform === e.target.value)[0].outputs[0]);
                        // }}
                        value={selectedProject}
                        onChange={(e) => { setSelectedproject(e.target.value); }}
                      >
                        {projects.map((project: any, index) => (
                          <option key={index} value={project.id}>
                            {project.platform} - {project.content.substring(0, 75) + ' ...'}
                          </option>
                        ))}
                      </Select>
                    </>
                  )}

                  {loadingAPICall && (
                    <Progress size='xs' isIndeterminate />
                  )}

                  {outputSelectedI === "podcast" && (
                    <>


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
                    </>
                  )}
                </div>
              </div>

              <div className={styles.platform__container}>
                <div className={styles.options}>
                  <HStack>
                    <VStack align={"start"} w={"50%"}>
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

                  <Button
                    isDisabled={(
                      (outputSelectedI !== "context" && summary === "")
                      || canStopB.current
                      || (outputSelectedI === "context" && selectedProject === "")
                    )}
                    colorScheme="purple"
                    onClick={() => handleConvert(landingURL)}
                  >
                    Convert to {outputSelected} {outputSelectedO}
                  </Button>
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

Repurpose.auth = true