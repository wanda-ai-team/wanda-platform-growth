
import ModalComponent from "@/components/modal/Modal";
import RadioTag from "@/components/radio-tag";
import styles from "@/styles/HomeN.module.css";
import { getListOfChannels, getListOfUsers, sendMessageToChannel } from "@/utils/api/integrations/slack";
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
    useDisclosure,
    HStack,
    VStack,
    FormControl,
    FormErrorMessage,
} from "@chakra-ui/react";
import { Link } from '@chakra-ui/react'
import {
    AsyncCreatableSelect,
    AsyncSelect,
    CreatableSelect,
    Select,
} from "chakra-react-select";
import { Message, Blocks, Elements } from 'slack-block-builder';

import { useEffect, useRef, useState } from "react";
import { isError } from "util";

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
    const [loadingSlack, setLoadingSlack] = useState<boolean>(true);
    const [slackUsers, setSlackUsers] = useState<any>([]);
    const [slackChannels, setSlackChannels] = useState<any>([]);
    const [selectedChannel, setSelectedChannel] = useState<any>("");
    const [channelName, setChannelName] = useState<string>("");
    const [selectedSlackUsers, setSelectedSlackUsers] = useState<any>([]);

    const isError = slackChannels.find((item: any) => item.label === channelName) || channelName === "";
    const [gongCallsA, setGongCallsA] = useState([]);
    const [selectedGongCall, setSelectedGongCall] = useState<any>({});
    const [loadingGongCalls, setLoadingGongCalls] = useState<boolean>(true);
    const { isOpen, onOpen, onClose } = useDisclosure()
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
                    console.log(data);
                    if (data && data.content && data.content.includes("authorization")) {
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

    async function getCallInformation(callId: any) {
        console.log(callId.value);
        setLoadingGongCalls(true);
        await fetch('/api/integrations/gong/getCallInformationById', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                callId: [callId.value],
            }),
        })
            .then(response => response.json())
            .then(async data => {
                console.log(data);
                if (data.success) {
                    console.log(data.content);
                    // const response = await urlToTranscript(data.content.media.audioUrl, true, true, true, true, true);
                    setTranscript(data.content.transcript);
                    setTopics(data.content.content.topics.map((item: any) => item.name));

                    // setKeyphrases(response.auto_highlights_result.results.map((item: any) => item.text))

                    // setSummary(response.summary);

                    // console.log(Object.keys(response.topics))
                    // setTopics(Object.keys(response.topics).map((item: any) => item.split('>')[item.split('>').length - 1]));


                    // const speakerArr = response.speakers.map((speaker: any) => speaker.speaker);
                    // console.log(speakerArr);
                    // const speakerSet = new Set(speakerArr);
                    // setSpeakers(Array.from(speakerSet));

                } else {
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        setLoadingGongCalls(false);
    }

    async function getSlackInfo() {
        setLoadingSlack(true)
        let users = await getListOfUsers();
        let channels = await getListOfChannels();
        users = users.map((item: any) => ({ label: item.name, value: item.id }));
        setSlackUsers(users);
        channels = channels.map((item: any) => ({ label: item.name, value: item.id }));
        const nChannels = [{ label: 'Create new', value: 'create' }].concat(channels);
        setSlackChannels(nChannels);
        setSelectedChannel(nChannels[0]);
        setLoadingSlack(false)
    }

    useEffect(() => {
        getCalls();
        getSlackInfo();
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
                            if (responseO && responseO.upload.ok && responseO.fields.success_action_status) {
                                console.log(responseO);

                                const response = await urlToTranscript(url + responseO.url, true, true, true, true, true);
                                setTranscript(response.transcript);
                                setSummary(response.summary);
                                setKeyphrases(response.auto_highlights_result.results.map((item: any) => item.text))

                                console.log(Object.keys(response.topics))
                                setTopics(Object.keys(response.topics).map((item: any) => item.split('>')[item.split('>').length - 1]));


                                const speakerArr = response.speakers.map((speaker: any) => speaker.speaker);
                                console.log(speakerArr);
                                const speakerSet = new Set(speakerArr);
                                setSpeakers(Array.from(speakerSet));
                            } else {
                                console.error('Upload failed.');
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
                        Gong account is not connected. <Link color='teal.500' href="/profile"> Please connect it here </Link>
                    </Text>
                    :
                    <>
                        <Select
                            value={selectedGongCall}
                            onChange={(e) => { console.log(e); setSelectedGongCall(e); }}
                            options={gongCallsA.map((call: any, index: number) => ({ label: call.title.substring(0, 75) + ' ...', value: call.id, title: call.title }))}
                        />

                        <Button isDisabled={!selectedGongCall.value} colorScheme="purple" onClick={async (e) => {
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
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder='Here is a sample placeholder'
                        size='lg' />
                </>
            )
        }
    }

    function slackModalContent() {
        return (
            <VStack spacing={4}
                align='stretch'>
                <Text as="h2" fontSize="l">
                    Channel
                </Text>
                <Select
                    colorScheme="purple"
                    options={slackChannels}
                    value={selectedChannel}
                    onChange={(e) => { setSelectedChannel(e); }}
                    isMulti={false}
                />
                {selectedChannel.value === "create" &&
                    <>
                        <Text as="h4" fontSize="sm">
                            Channel name
                        </Text>
                        <FormControl isInvalid={isError}>
                            <Input isInvalid={slackChannels.find((item: any) => item.label === channelName)}
                                value={channelName} onChange={(e) => setChannelName(e.target.value.replace(" ", "-").toLowerCase())} placeholder='example-name' />
                            {isError &&
                                <FormErrorMessage>{channelName === "" ? "Channel name can't be empty" : "Channel name already exists."}</FormErrorMessage>
                            }
                        </FormControl>
                    </>}
                <Text as="h2" fontSize="l">
                    Invite people to channel
                </Text>
                <Select
                    colorScheme="purple"
                    options={slackUsers}
                    value={selectedSlackUsers}
                    onChange={(e) => { setSelectedSlackUsers(e); }}
                    isMulti={true}
                /></VStack>
        )
    }

    function sendMessageToChannelT(message: string, channelId: any, selectedGongCall: any, selectedSlackUsers: any, channelName: string) {
        console.log(selectedSlackUsers);
        console.log("awd")
        if (message && message.length > 0) {
            let listOfUsers = ""
            if (selectedSlackUsers.length > 0) {
                listOfUsers = selectedSlackUsers.map((item: any) => item.value).join(",");
            }
            message = "Insights from meeting -> "
                + selectedGongCall.title
                + "\n>" + "*Topics*"
                + "\n>- " + topics.join("\n>- ")
            console.log(channelId);
            const messageF = Message({ channel: channelId, text: "Example" })
                .blocks(
                    Blocks.Section({ text: 'One does not simply walk into Slack and click a button.' }),
                    Blocks.Section({ text: 'At least that\'s what my friend Slackomir said :crossed_swords:' }),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.Button({ text: 'Sure One Does', actionId: 'gotClicked' })
                                .danger(),
                            Elements.Button({ text: 'One Does Not', actionId: 'scaredyCat' })
                                .primary()))
                .asUser()
                .buildToJSON();
            sendMessageToChannel(messageF, channelId, channelId.value === "create", listOfUsers, channelName);
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
                    <Button isDisabled={loadingSlack || transcript.length <= 0} colorScheme="purple" onClick={onOpen} >
                        {
                            loadingSlack ? "Loading Slack ..." : "Send to slack"
                        }

                    </Button>
                    <ModalComponent isOpen={isOpen} onClose={onClose} title={"Slack Notification"} content={slackModalContent()} buttonText={"Send to Slack"}
                        buttonClickT={() => { sendMessageToChannelT(topics.join(" "), selectedChannel, selectedGongCall, selectedSlackUsers, channelName); onClose() }}
                        buttonDisabled={(selectedChannel.value === "create"
                            ? (slackChannels.find((item: any) => item.label === channelName) && channelName !== "")
                            : !selectedChannel)} />

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