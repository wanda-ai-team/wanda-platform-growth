import {
  Box,
  Button,
  Center,
  HStack,
  Input,
  Progress,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FunctionComponent, useState } from "react";
import { useRouter } from 'next/navigation';
import toastDisplay from "@/utils/common/toast";

interface OnboardingProps { }

const Onboarding: FunctionComponent<OnboardingProps> = () => {
  const [step, setStep] = useState<number>(-1);
  const [siteData, setSiteData] = useState<any>({});
  const { push } = useRouter();

  const MAX_STEPS = 4;

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, MAX_STEPS - 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const renderStep = () => {
    switch (step) {
      case -1:
        return (
          <StepW
            onNextAction={() => {
              handleNext();
            }}
          />
        );
      case 0:
        return (
          <Step0
            onNextAction={(data: any) => {
              if (data !== 'skip') {
                setSiteData((prev: any) => ({ ...prev, ...data }));
              }
              handleNext();
            }}
          // loading={loading}
          />
        );
      case 1:
        return (
          <Step1
            onPrevAction={() => {
              handlePrev();
            }}
            onNextAction={(data: any) => {
              if (data !== 'skip') {
                setSiteData((prev: any) => ({ ...prev, ...data }));
              }
              handleNext();
            }}
          />
        );
      case 2:
        return (
          <Step2
            onPrevAction={() => {
              handlePrev();
            }}
            onNextAction={(data: any) => {
              if (data !== 'skip') {
                const siteDataToPost = {
                  ...siteData,
                  ...data,
                  userId: 1,
                  subdomain: 0,
                };

                setSiteData((prev: any) => siteDataToPost);

              }
              //   createSiteMutation(siteDataToPost);
              push('/dashboard');
            }}
          />
        );
    }
  };

  return (
    <>


      <VStack h="90vh" spacing={0}>
        <Box w="full" h="full">
          <Center alignItems="center" justifyItems="center" w="full" h="full">
            <VStack w={700} align="flex-start" spacing={10}>
              <VStack w={700} align="flex-start" spacing={2}>
                <Text fontSize="sm" color="gray.500">{`${step + 2}/${MAX_STEPS}`}</Text>
                <VStack w={700} align="flex-start" spacing={6}>
                  {renderStep()}
                </VStack>
              </VStack>
            </VStack>
          </Center>
        </Box>
      </VStack>
    </>
  );
};

interface Step0Props {
  // loading: boolean;
  onNextAction: (data: any) => void;
}

interface StepWProps {
  // loading: boolean;
  onNextAction: () => void;
}

const StepW: FunctionComponent<StepWProps> = ({
  onNextAction,
}: // onNextAction,
  // loading,
  StepWProps) => {
  return (
    <>
      <Text fontSize="xl" fontWeight={600}>
        Welcome to Wanda!
      </Text>
      <Text fontSize="l" fontWeight={400}>
        You will now go through an onboarding process to help us understand your business and generate ideas for you.
      </Text>

      <HStack w="full" justify="space-between">
        {/* <Button onClick={handlePrevious}>Previous</Button> */}
        <Button
          onClick={() => {
            onNextAction();
          }}
        >
          Next
        </Button>
      </HStack>
    </>
  );
};

const Step0: FunctionComponent<Step0Props> = ({
  onNextAction,
}: // onNextAction,
  // loading,
  Step0Props) => {
  const [url, setURL] = useState("");

  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    await fetch("/api/onboarding/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })
      .then((response) => response.json())
      .then(({ data }: any) => {
        setProduct(data.product);
        setTargetAudience(data.target_audience);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toastDisplay('Error while scraping', false);
      });
  };

  return (
    <>
      <Text fontSize="xl" fontWeight={600}>
        What&apos;s your website?
      </Text>
      <Text fontSize="l" fontWeight={400}>
        Tell us your company or personal website so we can better understand you.
      </Text>

      <VStack w={700} align="flex-start" spacing={2}>
        <HStack align="flex-end" w="full">
          <VStack align="flex-start" w="full">
            <Input
              defaultValue={url}
              placeholder="https://wanda.so"
              onChange={(evt) => {
                setURL(evt.target.value);
              }}
            />
          </VStack>
          <Button
            onClick={() => {
              handleScrape();
            }}
          >
            Add
          </Button>
        </HStack>
      </VStack>

      {loading && (
        <Progress size="xs" isIndeterminate colorScheme="purple" w="full" />
      )}

      {product && (
        <VStack w="full" align="flex-start">
          <Text fontWeight={500} fontSize="sm">
            You&apos;re selling...
          </Text>
          <Text fontSize="sm">{product}</Text>
        </VStack>
      )}

      {targetAudience && (
        <VStack w="full" align="flex-start">
          <Text fontWeight={500} fontSize="sm">
            to...
          </Text>
          <Text fontSize="sm">{targetAudience}</Text>
        </VStack>
      )}

      <HStack w="full" justify="space-between">
        {/* <Button onClick={handlePrevious}>Previous</Button> */}
        <Button
          onClick={() => {
            onNextAction({ url, targetAudience, product });
          }}
          isDisabled={!product || !targetAudience}
        >
          Next
        </Button>
        <Button
          onClick={() => {
            let skip = 'skip'
            onNextAction({ skip, targetAudience, product });
          }}
        >
          Skip
        </Button>
      </HStack>
    </>
  );
};

interface Step1Props {
  onPrevAction: () => void;
  onNextAction: (data: any) => void;
}

const Step1: FunctionComponent<Step1Props> = ({
  onPrevAction,
  onNextAction,
}: Step1Props) => {
  const [xHandle, setXHandle] = useState("here_is_abrams");
  const [library, setLibrary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tweets, setTweets] = useState([]);

  const addXHandle = async () => {
    setLoading(true);
    fetch("/api/onboarding/xHandle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ xHandle }),
    })
      .then((response) => response.json())
      .then(({ data }: any) => {
        setLoading(false);
        setTweets(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>

      <Text fontSize="xl" fontWeight={600}>
        Add X (former Twitter) handle
      </Text>

      <Text fontSize="l" fontWeight={400}>
        Tell us your X handle so we can understand your brand.
      </Text>

      <VStack w={700} align="flex-start" spacing={2}>
        <HStack align="flex-end" w="full">
          <VStack align="flex-start" w="full">
            <Input
              placeholder="here_is_abrams"
              onChange={(evt) => {
                setXHandle(evt.target.value);
              }}
            />
          </VStack>
          <Button
            onClick={() => {
              addXHandle();
            }}>
            Add
          </Button>
        </HStack>
        {loading && (
          <Progress size="xs" isIndeterminate colorScheme="brand" w="full" />
        )}

        {tweets.length > 0 && (
          <VStack w="full" align="flex-start">
            <Text fontWeight={500} fontSize="sm">
              latest tweets...
            </Text>
            {tweets.map((tweet: any, index: any) => (
              <Text key={index} fontSize="sm">{tweet}</Text>
            )
            )}
          </VStack>
        )}
      </VStack>
      <HStack w="full" justify="space-between">
        {/* <Button onClick={handlePrevious}>Previous</Button> */}
        <Button
          onClick={() => {
            onNextAction({ xHandle, tweets });
          }}
          isDisabled={!xHandle || tweets.length === 0}
        >
          Next
        </Button>
        <Button
          onClick={() => {
            let skip = 'skip'
            onNextAction({ skip, tweets });
          }}
        >
          Skip
        </Button>
      </HStack>
    </>
  );
};

interface Step2Props {
  onPrevAction: () => void;
  onNextAction: (data: any) => void;
}

const Step2: FunctionComponent<Step2Props> = ({
  onPrevAction,
  onNextAction,
}: Step2Props) => {
  const [content, setContent] = useState("");

  const addQuestionResponses = async (response1: string) => {
    fetch("/api/onboarding/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response1 }),
    })
  };

  return (
    <>
      <VStack align={"start"} w="full" >
        <Text fontSize="xl" fontWeight={600}>
          Questions
        </Text>
        <Text fontSize="l" fontWeight={400}>
          Who are your main competitors?
        </Text>
        <Textarea
          placeholder="Who are your main competitors"
          resize="none"
          h={2}
          size='sm'
          onChange={(evt) => {
            setContent(evt.target.value);
          }}
        />
      </VStack>
      <HStack w="full" justify="space-between">

        <Button
          onClick={async () => {
            await addQuestionResponses(content);
            onNextAction({ setContent });
          }}
        >
          Start generating ideas
        </Button>
      </HStack>
    </>
  );
};

export default Onboarding;
