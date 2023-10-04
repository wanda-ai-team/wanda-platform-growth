
import RadioTag from "@/components/radio-tag";
import styles from "@/styles/HomeN.module.css";
import { urlToText } from "@/utils/common/transcript/transcript";
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
} from "@chakra-ui/react";
import { useRef, useState } from "react";

type Contents = "context" | "url" | "text" | "file";

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
            key: "file",
            value: "Podcast & Video(File)",
        },
    ];

export default function RepurposeN() {
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const [outputSelectedI, setOutputSelectedI] = useState<Contents>(inputList[0].key);
    const [url, setUrl] = useState<string>("");
    const [loadingAPICall, setLoadingAPICall] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>("");
    const [speakers, setSpeakers] = useState<any>([]);
    const [outputSelected, setOutputSelected] = useState<string>("");
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "content",
        defaultValue: inputList[0].key,
        onChange: (value: Contents) => setOutputSelectedI(value),
    });
    const group = getRootProps();

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
                        const responseO = await uploadFile(setLoadingAPICall, inputFileRef)

                        if (responseO && responseO.upload.ok) {
                            // setTranscript(responseO.summary);
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
                            outputSelectedI === "url" ?
                                urlInput()
                                :
                                outputSelectedI === "file" ?
                                    fileInput()
                                    :
                                    <></>
                        }
                    </div>
                </div>

                <div className={styles.platform__container}>
                    <Text fontWeight="semibold">Select Platform:</Text>

                </div>
            </div>

            <div className={styles.transcript__summary}>
                <div className={styles.texts}>
                    <Progress size='xs' isIndeterminate />
                    {getTextArea(outputSelected === 'Summary' ? transcript : outputSelected === 'Transcript' ? transcript : transcript)}
                    {getTextArea(speakers)}

                </div>



            </div>
        </main>
    )


}