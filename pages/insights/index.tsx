
import RadioTag from "@/components/radio-tag";
import styles from "@/styles/HomeN.module.css";
import { urlToText, urlToTranscript } from "@/utils/common/transcript/transcript";
import uploadFile from "@/utils/common/upload/upload";
import {
    Input,
    InputGroup,
    Text,
    Textarea,
    Progress,
    useRadioGroup,
    Button,
    InputRightElement,
    Spinner,
    Select,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Contents = "context" | "url" | "text" | "file" | "gong";
const inputList: {
    key: Contents;
    value: string;
}[] = [
        // {
        //     key: "url",
        //     value: "URL",
        // }, 
        {
            key: "gong",
            value: "Gong calls",
        },
        {
            key: "file",
            value: "Video (File)",
        },
    ];

export default function Insights() {
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const [gongConnected, setGongConnected] = useState<boolean>(false);
    const [outputSelectedI, setOutputSelectedI] = useState<Contents>(inputList[0].key);
    const [url, setUrl] = useState<string>("");
    const [loadingAPICall, setLoadingAPICall] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [keyphrases, setKeyphrases] = useState<string[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [speakers, setSpeakers] = useState<any>([]);
    const [outputSelected, setOutputSelected] = useState<string>("");

    const [gongCallsA, setGongCallsA] = useState([]);
    const [selectedGongCall, setSelectedGongCall] = useState<any>({});
    const [loadingGongCalls, setLoadingGongCalls] = useState<boolean>(true);

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "content",
        defaultValue: inputList[0].key,
        onChange: (value: Contents) => setOutputSelectedI(value),
    });
    const group = getRootProps();

    async function getCalls() {
        setLoadingGongCalls(true);
        console.log('getCalls');
        await fetch('/api/integrations/gong/getCallByDateWithToken')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setGongConnected(true);
                if (data.success) {
                    setGongCallsA(data.content);
                    setSelectedGongCall(data.content[0].id);
                } else {
                    if (data.content.includes("authorization")) {
                        console.log('gong not connected');
                        setGongConnected(false);
                    }
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        setLoadingGongCalls(false);
    }

    async function getCallInformation(callId: string) {
        setLoadingGongCalls(true);
        await fetch('/api/integrations/gong/getCallInformationById', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                callId: [callId],
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    console.log(data.content);
                    setSpeakers(data.content.parties.map((item: any) => item.name));
                    setTopics(data.content.content.topics.map((item: any) => item.name));
                } else {
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        setLoadingGongCalls(false);
    }

    useEffect(() => {
        getCalls();
    }, []);

    function urlInput() {
        return (
            <>
                <Input
                    isDisabled={loadingAPICall}
                    sx={{ backgroundColor: "white" }}
                    placeholder={outputSelectedI === "url"
                        ? "URL (works with Youtube)"
                        : "URL (works with spotify)"}
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        if (e.target.value !== "") {
                            if (outputSelectedI === "url") {
                                let url = e.target.value;
                                if (e.target.value.includes('youtu.be')) {
                                    url = 'https://www.youtube.com/watch?v=' + e.target.value.split('youtu.be/')[1];
                                }
                                urlToText(url, true, outputSelectedI, setTranscript, setLoadingAPICall);
                            } else {
                                // getAudioTranscript(e.target.value);
                            }
                        }
                    }} />
            </>
        );
    }

    function fileInput() {
        return (
            <>
                <InputGroup>
                    <input
                        type="file"
                        name="myfile"
                        accept="video/*"
                        ref={inputFileRef}
                    />
                    <Button colorScheme="purple" onClick={async (e) => {
                        if (inputFileRef && inputFileRef.current && inputFileRef.current.files && inputFileRef.current.files.length > 0) {
                            const responseO = await uploadFile(setLoadingAPICall, inputFileRef);
                            if (responseO && responseO.upload.ok) {
                                console.log(responseO);
                                const response = await urlToTranscript(url + responseO.url, responseO.fields, true, true, true, true, true);
                                setTranscript(response.transcript);
                                setSummary(response.summary);
                                setKeyphrases(response.auto_highlights_result.results.map((item: any) => item.text))

                                console.log(Object.keys(response.topics))
                                setTopics(Object.keys(response.topics).map((item: any) => item.split('>')[item.split('>').length - 1]));


                                const speakerArr = response.speakers.map((speaker: any) => speaker.speaker);
                                console.log(speakerArr);
                                const speakerSet = new Set(speakerArr);
                                setSpeakers(Array.from(speakerSet));
                            }
                            setLoadingAPICall(false);
                        }
                    }
                    }>
                        Upload
                    </Button>
                    {loadingAPICall && (
                        <InputRightElement>
                            <Spinner color="#8F50E2" />
                        </InputRightElement>
                    )}
                </InputGroup>
            </>
        );
    }

    function gongCalls() {
        return (
            <>
                {!gongConnected ?
                    <Text>
                        Gong account is not connected. Please connect it <Link href="/profile"> here </Link>
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
                            Get Call Information
                        </Button>
                    </>
                }
            </>
        )
    }

    function getTextArea(valueChosen: any) {
        if (outputSelected === '') {
            return (
                <>
                    <Textarea
                        style={{ height: '500px' }}
                        value={valueChosen}
                        // onChange={handleInputChange}
                        placeholder='Here is a sample placeholder'
                        size='lg' />
                </>
            )
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.form__container}>
                <div className={styles.title__container}>
                    <Text as="h2" fontSize="3xl">
                        Customer Insights
                    </Text>
                    <Text>
                        Get insights on your customers and their interests based on the selected platfrom.
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
                        {
                            outputSelectedI === "url" &&
                            urlInput()
                        }
                        {
                            outputSelectedI === "file" &&
                            fileInput()
                        }
                        {
                            outputSelectedI === "gong" ?
                                loadingGongCalls ?
                                    <>
                                        <Text>
                                            Loading Gong calls.
                                        </Text>
                                        <Progress size='xs' isIndeterminate />
                                    </>
                                    :
                                    gongCalls()
                                :
                                <></>
                        }
                    </div>
                </div>

                <div className={styles.platform__container}>
                    {/* <Text fontWeight="semibold">Select Platform:</Text> */}

                </div>
            </div>

            <div className={styles.transcript__summary}>
                <div className={styles.texts}>
                    <Progress size='xs' isIndeterminate />

                    <Text as="h3" fontSize="xl">
                        Transcript
                    </Text>
                    {getTextArea(outputSelected === 'Summary' ? transcript : outputSelected === 'Transcript' ? transcript : transcript)}

                    <Text as="h3" fontSize="xl">
                        Brief
                    </Text>
                    <Text>
                        {summary}
                    </Text>

                    <Text as="h3" fontSize="xl">
                        Keypoints
                    </Text>
                    {keyphrases.map((item: any, index: number) => (
                        <Text key={index}>
                            - {item}
                        </Text>
                    ))}

                    <Text as="h3" fontSize="xl">
                        Speakers
                    </Text>
                    {speakers.map((item: any, index: number) => (
                        <Text key={index}>
                            - {item}
                        </Text>
                    ))}

                    <Text as="h3" fontSize="xl">
                        Topics
                    </Text>
                    {topics.map((item: any, index: number) => (
                        <Text key={index}>
                            - {item}
                        </Text>
                    ))}
                    {/* {getTextArea(speakers)} */}
                </div>
            </div>
        </main>
    )


}