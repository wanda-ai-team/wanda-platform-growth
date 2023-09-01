import { Button, Center, CircularProgress, HStack, Input, Progress, Radio, RadioGroup, Select, Spinner, Stack, Text, Textarea, VStack } from "@chakra-ui/react";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { platformsToGenerateIdeas } from "@/utils/globalVariables";
import styles from "@/styles/HomeN.module.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import TwitterThread from "@/components/text/twitterThread/twitterThreadN";
import toastDisplay from "@/utils/common/toast";
import { width } from "@mui/system";


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
  const [convertedText, setConvertedText] = useState("Example");
  const [selectedTweets, setSelectedTweets] = useState<any>([]);
  const [threadPostResult, setThreadPostResult] = useState("");
  const stopB = useRef(false);
  const canStopB = useRef(false);
  
  let handleInputChange = (e: { target: { value: any } }) => {
    if (selectedPlatform === "Twitter") {
      let newArr = [...twitterThreadText];
      newArr[0] = e.target.value;
      setTwitterThreadText([...newArr]);
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
        setIdeas(data.ideas);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }

  useEffect(() => {
    // getIdeas()
  }, []);

  const generateBlogIdea = async (chosenIdeaN: string) => {
    console.log(chosenIdeaN)
    setLoadingC(true);
    const response = await fetch("/api/llm/gpt3/generateBlogIdeasStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idea: chosenIdeaN, platform: selectedPlatform }),
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
    setConvertedText("")
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

      if (selectedPlatform === "Twitter") {
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
                getIdeas();
              }}
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
            {!loading && ideas.length > 0 && (
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
              isDisabled={loading || (!value) || canStopB.current}
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
              value={convertedText}
              style={{ height: '600px' }}
              // isDisabled={!convertedText}
              onChange={handleInputChange}
              placeholder='AI Post will show up here when it is generated'
              size="lg"
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
          isDisabled={!twitterThreadText || !convertedText || loadingS}
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
