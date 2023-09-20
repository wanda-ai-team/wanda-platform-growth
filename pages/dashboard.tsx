import { Button, Center, CircularProgress, HStack, Input, Progress, Radio, RadioGroup, Select, Spinner, Stack, Text, Textarea, VStack } from "@chakra-ui/react";
import { FunctionComponent, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { platformsToGenerateIdeas } from "@/utils/globalVariables";
import styles from "@/styles/HomeN.module.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import TwitterThread from "@/components/text/twitterThread/twitterThreadN";
import toastDisplay from "@/utils/common/toast";
import { width } from "@mui/system";
import { useSession } from "next-auth/react";
import { getContext } from "@/utils/api/context/contextCalls";
import streamResponse from "@/utils/common/stream";


interface DashboardProps { }

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingS, setLoadingS] = useState(false);
  const [value, setValue] = useState('');
  const [chosenIdea, setChosenIdea] = useState('');
  const [data, setData] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(platformsToGenerateIdeas[0]);
  const [twitterThreadText, setTwitterThreadText] = useState([""]);
  const [numberOfTweets, setNumberOfTweets] = useState(1);
  const [twitterThreadTextPerTweet, setTwitterThreadTextPerTweet] = useState([
    "",
  ]);
  const [convertedText, setConvertedText] = useState("");
  const [selectedTweets, setSelectedTweets] = useState<any>([]);
  const [threadPostResult, setThreadPostResult] = useState("");
  const stopB = useRef(false);
  const canStopB = useRef(false);
  const { data: session, status } = useSession()

  let handleInputChange = (e: { target: { value: any } }) => {
    console.log("newArr")
    if (selectedPlatform === "Twitter") {
      let newArr = [...twitterThreadText];
      newArr[0] = e.target.value;
      setTwitterThreadText([...newArr]);
      console.log(newArr)
    } else {
      setConvertedText(e.target.value);
    }
  };

  const getIdeas = async () => {
    setLoading(true);
    fetch("/api/llm/gpt3/generateIdeas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: 'https://www.wanda.so/', platform: selectedPlatform }),
    })
      .then((response) => response.json())
      .then(({ data }: any) => {
        console.log(data)
        if(data.ideas.length > 0) {
          setIdeas(data.ideas);
        }
        else{
          setIdeas([]);
          toastDisplay('Error while generating, try again', false)
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        toastDisplay('Error while generating, try again', false)
        setLoading(false);
      });
  }

  useEffect(() => {
    // getIdeas()
  }, []);

  const generateBlogIdea = async (chosenIdeaN: string) => {
    setLoadingC(true);
    setNumberOfTweets(1);
    setTwitterThreadTextPerTweet([""]);
    const documents = await fetch("/api/context/getContext", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ platform: selectedPlatform }),
    });

    let documentContextData = null;

    if (documents.ok) {
      documentContextData = await documents.json();
    } 
    
    let documentContextDataF = "";
    if (documentContextData && documentContextData.status !== 500 && documentContextData.documents.length > 0) {
      documentContextData.documents.map((document: any) => {
        if (document && document.page_content && document.page_content.length > 0) {
          documentContextDataF += document.page_content
        }
      })
    }
    const response = await fetch("/api/llm/gpt3/generateBlogIdeasStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idea: chosenIdeaN, platform: selectedPlatform, email: session?.user.email, documents: documentContextDataF }),
    });

    if (!response.ok) {
      toastDisplay('Error while generating, try again', false)
      setLoadingC(false);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    await streamResponse(data, setConvertedText, canStopB, stopB, setNumberOfTweets, selectedPlatform, setTwitterThreadTextPerTweet);
    setLoadingC(false);
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

  function saveGeneratedContent(platform: string, content: string): void {
    setLoadingS(true);
    fetch("/api/user/store/storeGenerated", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ platform: platform, content: content }),
    })
      .then((response) => response.json())
      .then(({ data }: any) => {
        toastDisplay('Successfully saved generated content', true)
        setLoadingS(false);
      })
      .catch((error) => {
        toastDisplay('Error while saving', false)
        setLoadingS(false);
      });
  }

  return (
    <>
      <main className={styles.main}>

        <div className={styles.form__container}>

          <VStack align="flex-start" w="full">

            <div className={styles.title__container}>
              <Text as="h2" fontSize="3xl">
                Generate Ideas
              </Text>
              <Text>
                Select the platform and ideas will be generated based on your context.
              </Text>
            </div>

          </VStack>

          <div className={styles.platform__container}>
            <Text fontWeight="semibold">Select Platform</Text>
            <Select
              sx={{ backgroundColor: "white" }}
              onChange={(e) => { setSelectedPlatform(e.target.value); }} value={selectedPlatform} >
              {platformsToGenerateIdeas.map((platform, index) => (
                <option key={index} value={platform}>{platform}</option>
              ))}
            </Select>

            <Button
              colorScheme="purple"
              onClick={() => {
                setIdeas([]);
                getIdeas();
              }}
              isDisabled={loading || loadingC}
            >
              Start Idea Generator
            </Button>

          </div>

          {/* <Text fontSize="xl" fontWeight={600}>
        Dashboard
      </Text> */}

          <div className={styles.platform__container}>

            <Text fontWeight="semibold">{(!loading) ? (
              'Generated Ideas'
            ) : 'Generating Ideas'}
            </Text>


            {loading && (
              <Progress size='xs' isIndeterminate />
            )}
            {!loading && ideas && ideas.length > 0 && (
              <>
                <RadioGroup onChange={setValue} value={value}>
                  <Stack direction='column'>
                    {ideas.map((idea, index) => (
                      <Radio key={index} value={idea}>{idea}</Radio>
                    ))}
                    <Radio value={'custom'}>
                      Custom
                    </Radio>
                  </Stack>
                </RadioGroup>
                <Input
                  placeholder="Custom Blog Idea"
                  onChange={(evt) => {
                    setValue('custom')
                    setChosenIdea(evt.target.value);
                  }}
                />
              </>
            )}

            <Button
              colorScheme="purple"
              onClick={() => {
                const valueToPass = (value === 'custom') ? chosenIdea : value;
                generateBlogIdea(valueToPass);
              }}
              isDisabled={loading || (!value) || canStopB.current || loadingC}
            >
              Generate {selectedPlatform} Post
            </Button>

          </div>
        </div>

        <div className={styles.transcript__summary}>
          <div className={styles.texts}>
            <span className={styles.summary__header}>
              {selectedPlatform} AI post
            </span>
          </div>


          <hr className={styles.divider} />

          {loadingC && (
            <div style={{ width: '100%', marginTop: '-15px' }}>
              <Progress size='xs' isIndeterminate />
            </div>
          )}

          {selectedPlatform === "Twitter"
            ? getTwitterThread()
            :

            <Textarea
              style={{ marginLeft: '5%', resize: "none", height: "600px", marginRight: '5%', width: '90%' }}
              value={convertedText}
              onChange={handleInputChange}
              variant="filled"
              placeholder='AI Post will show up here when it is generated'
              size="sm"
            />
          }
          {/* {getTextArea(outputSelected === 'Summary' ? summary : outputSelected === 'Transcript' ? transcript : convertedText)} */}

          <div className={styles.texts}>
          </div>

        </div>
      </main >

      <footer className={styles.generate__footer}>

        <Button colorScheme='purple' isDisabled={!canStopB.current} onClick={() => stopB.current = true}> Stop Generation </Button>
        <Button colorScheme='purple'
          isDisabled={
            loadingS
            || canStopB.current
            || (selectedPlatform === "Twitter" && twitterThreadTextPerTweet[0].length <= 0)
            || (selectedPlatform === "Blog" && convertedText.length <= 0)
          }
          onClick={() => saveGeneratedContent(selectedPlatform, convertedText)}>
          Save
        </Button>

        {loadingS && (
          <Spinner color="#8F50E2" />
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
};

export default Dashboard;

