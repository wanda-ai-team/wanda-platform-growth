
import ModalComponent from "@/components/modal/Modal";
import RadioTag from "@/components/radio-tag";
import styles from "@/styles/HomeN.module.css";
import { getListOfChannels, getListOfUsers, sendMessageToChannel } from "@/utils/api/integrations/slack";
import { getLemurInsights, urlToText, urlToTranscript } from "@/utils/common/transcript/transcript";
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
    VStack,
    FormControl,
    FormErrorMessage,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Checkbox,
    Stack,
} from "@chakra-ui/react";
import { Link } from '@chakra-ui/react'
import {
    Select,
} from "chakra-react-select";
import { Message, Blocks, Elements } from 'slack-block-builder';

import { useEffect, useRef, useState } from "react";
import { POSTApiCall } from "@/utils/api/commonAPICall";
import { Mixpanel } from "@/utils/mixpanel";

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

const insights = [{
    value: "summary",
    label: "Summary",
    checked: false
}, {
    value: "painPoints",
    label: "Pain Points",
    checked: false
}, {
    value: "topics",
    label: "Topics",
    checked: false
}, {
    value: "speakers",
    label: "Speakers",
    checked: false
}];
export default function Insights() {
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const [gongConnected, setGongConnected] = useState<boolean>(false);
    const [slackConnected, setSlackConnected] = useState<boolean>(false);
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
    const [callId, setCallId] = useState<string>("");
    const [channelName, setChannelName] = useState<string>("");
    const [selectedSlackUsers, setSelectedSlackUsers] = useState<any>([]);
    const [selectedInsights, setSelectedInsights] = useState<any>([]);

    const isError = slackChannels.find((item: any) => item.label === channelName) || channelName === "";
    const [gongCallsA, setGongCallsA] = useState([]);
    const [selectedGongCall, setSelectedGongCall] = useState<any>({});
    const [loadingGongCalls, setLoadingGongCalls] = useState<boolean>(true);
    const [loadingGongCallInfo, setLoadingGongCallInfo] = useState<boolean>(false);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "content",
        defaultValue: inputList[0].key,
        onChange: (value: Contents) => { setOutputSelectedI(value); Mixpanel.track("Changed Input Type", { "Input Type": value, "Page": "Insights" }) },
    });
    const group = getRootProps();

    useEffect(() => {
        Mixpanel.track("Loaded Insights Page");
        getCalls();
        getSlackInfo();
    }, []);

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
        setLoadingGongCallInfo(true);
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
                if (data.success) {

                    const gongCall = await POSTApiCall('/api/db/getDBEntry', {
                        collection: 'gongCalls',
                        numberOfConditions: 1,
                        condition: ['callId'],
                        conditionValue: [data.content.metaData.id],
                        conditionOperation: ['=='],
                    })

                    if (gongCall.content.length > 0) {

                        setTranscript(gongCall.content[0].data.transcript);
                        setTopics(gongCall.content[0].data.topics);
                        setSummary(gongCall.content[0].data.summary);
                        setSpeakers(gongCall.content[0].data.speakers);
                        setKeyphrases(gongCall.content[0].data.keyphrases)
                    }
                    else {
                        setTranscript(data.content.transcript);
                        const response = await urlToTranscript(data.content.media.audioUrl, true, true, true, true, true, 'Transcribed, getting insights..');

                        setCallId(data.content.metaData.id);
                        setTopics(data.content.content.topics.map((item: any) => item.name));

                        setSummary(response.transcript.summary);

                        const speakerArr = response.transcript.words.map((speaker: any) => speaker.speaker);
                        const speakerSet = new Set(speakerArr);
                        setSpeakers(Array.from(speakerSet));


                        const responseLemur = await getLemurInsights(data.content.media.audioUrl);
                        setKeyphrases(responseLemur.pain_points)
                        await POSTApiCall('/api/db/addOrCreateDBEntry',
                            {
                                collection: 'gongCalls',
                                numberOfConditions: 1,
                                condition: ['callId'],
                                conditionValue: [data.content.metaData.id],
                                conditionOperation: ['=='],
                                body: {
                                    callId: data.content.metaData.id,
                                    title: data.content.metaData.title,
                                    transcript: data.content.transcript,
                                    keyphrases: responseLemur.pain_points,
                                    topics: data.content.content.topics.map((item: any) => item.name),
                                    date: new Date().toISOString(),
                                },
                            })
                    }
                } else {
                    console.log(data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        setLoadingGongCallInfo(false);
    }

    async function getSlackInfo() {
        setLoadingSlack(true)
        console.log('getSlackInfo');
        let users = await getListOfUsers();
        console.log("users");
        console.log(users);
        if (users.code && users.data && users.data.ok === false) {
            setLoadingSlack(false)
            setSlackConnected(false);
            return;
        }
        let channels = await getListOfChannels();
        console.log(channels);
        if (channels.code && channels.data && channels.data.ok === false) {
            setLoadingSlack(false)
            setSlackConnected(false);
            return;
        }
        setSlackConnected(true);
        users = users.map((item: any) => ({ label: item.name, value: item.id }));
        setSlackUsers(users);
        channels = channels.map((item: any) => ({ label: item.name, value: item.id }));
        const nChannels = [{ label: 'Create new', value: 'create' }].concat(channels);
        setSlackChannels(nChannels);
        setSelectedChannel(nChannels[0]);
        setLoadingSlack(false)
    }


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
                                const response = await urlToTranscript(url + responseO.url, true, true, true, true, true, 'Upload done, transcribing..');
                                console.log(response);
                                if (response.transcript.text !== null) {
                                    setTranscript(response.transcript.text);
                                }
                                if (response.transcript.summary !== null) {
                                    setSummary(response.transcript.summary);
                                }
                                if (response.transcript.auto_highlights_result !== undefined && response.transcript.auto_highlights_result !== null) {
                                    setKeyphrases(response.transcript.auto_highlights_result.results.map((item: any) => item.text));
                                }
                                if (response.transcript.topics !== null && response.transcript.topics.length > 0) {
                                    setTopics(Object.keys(response.transcript.topics).map((item: any) => item.split('>')[item.split('>').length - 1]));
                                }
                                if (response.transcript.words !== null && response.transcript.words.length > 0) {

                                    const speakerArr = response.transcript.words.map((speaker: any) => speaker.speaker);
                                    console.log(speakerArr);
                                    const speakerSet = new Set(speakerArr);
                                    setSpeakers(Array.from(speakerSet));
                                }
                                const responseLemur = await getLemurInsights(url + responseO.url);
                                if (responseLemur.pain_points !== null) {
                                    setKeyphrases(responseLemur.pain_points)
                                }
                                // await POSTApiCall('/api/db/addOrCreateDBEntry',
                                //     {
                                //         collection: 'gongCalls',
                                //         numberOfConditions: 1,
                                //         condition: ['callId'],
                                //         conditionValue: [url + responseO.url],
                                //         conditionOperation: ['=='],
                                //         body: {
                                //             callId: data.content.metaData.id,
                                //             title: data.content.metaData.title,
                                //             transcript: data.content.transcript,
                                //             keyphrases: responseLemur.pain_points,
                                //             topics: data.content.content.topics.map((item: any) => item.name),
                                //             date: new Date().toISOString(),
                                //         },
                                //     })

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
                            Mixpanel.track("Clicked on get call information for Gong", { "Page": "Insights" });
                            getCallInformation(selectedGongCall);
                        }} >
                            Get Call Information
                        </Button>
                    </>
                }
            </>
        )
    }

    function slackButton() {
        return (
            <>
                {loadingSlack ?
                    <>
                        <Text>
                            Loading slack information.
                        </Text>
                        <Progress size='xs' isIndeterminate />
                    </>
                    :
                    !slackConnected ?
                        <Text>
                            Slack bot was not added to your channel. <Link color='teal.500' href="/profile"> Please connect it here </Link>
                        </Text>
                        :
                        <>

                            <Button isDisabled={loadingSlack || transcript.length <= 0} colorScheme="purple" onClick={onOpen} >
                                {
                                    "Send to slack"
                                }
                            </Button>
                            <ModalComponent isOpen={isOpen} onClose={onClose} title={"Slack Notification"} content={slackModalContent()} buttonText={"Send to Slack"}
                                buttonClickT={() => {
                                    Mixpanel.track("Sent notification to slack", { "Selected Channel": selectedChannel, "Selected Gong Call": selectedGongCall, "Selected Slack Users": selectedSlackUsers, "Selected Channel Name": channelName, "Selected Insights": selectedInsights });
                                    sendMessageToChannelT(selectedChannel, selectedGongCall, selectedSlackUsers, channelName, selectedInsights);
                                    onClose()
                                }}
                                buttonDisabled={
                                    (selectedChannel.value === "create" && slackChannels.find((item: any) => item.label === channelName))
                                    ||
                                    (selectedChannel.value === "create" && channelName === "")
                                    ||
                                    (selectedGongCall.value === "")
                                } />
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
                    Insights to send
                </Text>

                <Select
                    colorScheme="purple"
                    options={insights.map((item: any) => ({ label: item.label, value: item.value }))}
                    value={selectedInsights}
                    onChange={(e) => { setSelectedInsights(e); }}
                    isMulti={true}
                />

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

    function sendMessageToChannelT(channelId: any, selectedGongCall: any, selectedSlackUsers: any, channelName: string, selectedInsightsV: any) {
        console.log(selectedGongCall)
        console.log('Meeting Insights for meeting ' + selectedGongCall.title + " id_" + selectedGongCall.value);
        if (true) {
            let message = ""
            selectedInsightsV.map((item: any) => {
                message += "\n>" + "*" + item.label + "*"
                    + "\n>- " + (item.value === "summary" ? summary : item.value === "painPoints" ? keyphrases.join("\n>- ") : item.value === "topics" ? topics.join("\n>- ") : item.value === "speakers" ? speakers.join("\n>- ") : "")
                    + "\n>"
            })
            let listOfUsers = ""
            if (selectedSlackUsers.length > 0) {
                listOfUsers = selectedSlackUsers.map((item: any) => item.value).join(",");
            }
            console.log(channelId);
            const messageF = Message({ channel: channelId, text: "Meeting insights" })
                .blocks(
                    Blocks.Section({ text: 'Meeting Insights for meeting ' + selectedGongCall.title + " id_" + selectedGongCall.value }),
                    Blocks.Divider(),
                    message !== "" ? Blocks.Section({ text: message }) : Blocks.Section({ text: "No insights selected" }),
                    Blocks.Divider(),
                    Blocks.Actions()
                        .elements(
                            Elements.Button({ text: 'Create case study', actionId: 'createCaseStudy' })
                                .primary(),
                            Elements.Button({ text: 'Update CRM', actionId: 'gotClicked' })
                                .primary(),
                            Elements.Button({ text: 'Write follow up email', actionId: 'followUpEmail' })
                                .primary(),
                            Elements.Button({ text: 'Create piece of content', actionId: 'createPieceOfContent' })
                                .primary()))
                .asUser()
                .buildToJSON();
            sendMessageToChannel(messageF, channelId, channelId.value === "create", listOfUsers, channelName);
        }
    }

    return (
        <main className={styles.main} style={{ height: "92vh" }}>
            <div className={styles.form__container}>
                <div className={styles.title__container}>
                    <Text as="h2" fontSize="3xl">
                        Customer Insights
                    </Text>
                    <Text>
                        Get insights from your customer calls, align your team and take action.
                    </Text>
                </div>
                <div className={styles.options}>
                    <Text fontWeight="semibold"></Text>
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
                                    loadingGongCallInfo ?
                                        <>
                                            <Text>
                                                Loading call information.
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
                    {slackButton()}
                </div>
            </div>

            <div className={styles.transcript__summary}>
                <div className={styles.texts}>
                    <Progress size='xs' isIndeterminate />

                    <Accordion allowToggle w={"100%"}>
                        <AccordionItem isDisabled={transcript == ""}>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        Transcript
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {getTextArea(outputSelected === 'Summary' ? transcript : outputSelected === 'Transcript' ? transcript : transcript)}
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem isDisabled={keyphrases.length <= 0}>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        Pain Points
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {keyphrases.length > 0 && keyphrases.map((item: any, index: number) => (
                                    <Text key={index}>
                                        - {item}
                                    </Text>
                                ))}
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem isDisabled={summary == ""}>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        Brief
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {summary}
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem isDisabled={speakers.length <= 0}>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        Speakers
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {speakers.map((item: any, index: number) => (
                                    <Text key={index}>
                                        - {item}
                                    </Text>
                                ))}
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem isDisabled={topics.length <= 0}>
                            <h2>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        Topics
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {topics.map((item: any, index: number) => (
                                    <Text key={index}>
                                        - {item}
                                    </Text>
                                ))}
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                    {/* {getTextArea(speakers)} */}
                </div>
            </div>
        </main>
    )


}
Insights.auth = true;