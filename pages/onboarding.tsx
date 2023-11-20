import {
  Box,
  Button,
  Center,
  Checkbox,
  HStack,
  Input,
  Progress,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { FunctionComponent, useState } from "react";
import { useRouter } from 'next/navigation';
import toastDisplay from "@/utils/common/toast";
import sleep from "@/utils/common/utils";
import { embedText } from "@/utils/api/backend/backendCalls";
import { useSession } from "next-auth/react";
import { Mixpanel } from "@/utils/mixpanel";
import ModalComponent from "@/components/modal/Modal";
import { businessModelICP, companyTypeICP, countriesICP, employsICP, fundingRaisedICP, industriesICP, techUsedICP } from "@/utils/globalVariables";
import { default as ReactSelect } from "react-select";
import Option from "@/components/options/Option";
import { POSTApiCall } from "@/utils/api/commonAPICall";

interface OnboardingProps { }


export default function Onboarding() {
  const [step, setStep] = useState<number>(-1);
  const [siteData, setSiteData] = useState<any>({});
  const { push } = useRouter();
  const { data: session, status } = useSession()
  const [businessName, setBusinessName] = useState("");

  const MAX_STEPS = 2;

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
              // handleNext();
              push('/');
            }}

            businessName={businessName}
            setBusinessName={setBusinessName}
          // loading={loading}
          />
        );
      case 1:
        return (
          <StepICP
            onPrevAction={() => {
              handlePrev();
            }}
            onNextAction={(data: any) => {
              push('/dashboard');
            }}
            businessName={businessName}
            setBusinessName={setBusinessName}
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
              handleNext();
            }}

            businessName={businessName}
            setBusinessName={setBusinessName}
          />
        );
      case 3:
        return (
          <Step3
            onPrevAction={() => {
            }}
            onNextAction={() => {
              push('/dashboard');
            }}
            businessName={businessName}
            setBusinessName={setBusinessName}
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
                <Text visibility={(step + 2 === MAX_STEPS ? 'hidden' : 'visible')} fontSize="sm" color="gray.500">{`${step + 2}/${MAX_STEPS}`}</Text>
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
  businessName: string
  setBusinessName: (businessName: string) => void;
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
  businessName,
  setBusinessName
}: // onNextAction,
  // loading,
  Step0Props) => {
  const [url, setURL] = useState("");
  const [urls, setURLs] = useState([]);

  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [businessNameT, setBusinessNameT] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingSitemap, setLoadingSitemap] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = React.useState<any[]>([])

  const { data: session, status } = useSession()

  const checkSitemap = async () => {
    setLoadingSitemap(true);
    let URLIsWorking = false;
    await fetch("/api/onboarding/checkURL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
      }),
    }).then((response) => response.json()).then(({ success }: any) => {
      if (!success) {
        toastDisplay('Error while scraping, check if URL is well formed', false);
        URLIsWorking = false;
        setLoadingSitemap(false);
      } else {
        setIsOpen(true);
        URLIsWorking = true;
      }
    })

    if (!URLIsWorking) {
      return;
    }

    const urls = await fetch("/api/onboarding/scrapeSitemap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
      }),
    }).then((response) => response.json()).then(({ siteContent, success }: any) => {
      if (success) {
        return siteContent;
      }
      else {
        return [];
      }
    })

    if (urls.length === 0) {
      toastDisplay('Error while scraping, check if URL is well formed', false);
      setIsOpen(false)
    } else {
      setURLs(urls);
      setCheckedItems(new Array(urls.length).fill(false));
    }
    setLoadingSitemap(false);
  }

  const sitemapModelContent = () => {
    return (
      <VStack spacing={4}
        align='stretch'>
        <Text as="h2" fontSize="l">
          Select the pages you want to use for context.
        </Text>
        {loadingSitemap ?
          <Center>
            <Spinner color="#8F50E2" />
          </Center>
          :
          <Stack spacing={[1, 5]} direction={'column'}>
            {urls.map((url: any, index: any) => (
              <Checkbox
                key={index}
                size='md'
                colorScheme='purple'
                isChecked={checkedItems[index]}
                onChange={(e) => {
                  const newCheckedItems = [...checkedItems];
                  newCheckedItems[index] = e.target.checked;
                  setCheckedItems(newCheckedItems);
                }}
              >
                {url}
              </Checkbox>
            ))}
          </Stack>
        }
      </VStack>
    )
  }

  const handleScrape = async () => {
    setIsOpen(false);
    let finalUrl: any[] = []
    urls.forEach((url: any, index: any) => {
      if (checkedItems[index]) {
        finalUrl.push(url);
      }
    })
    setLoading(true);
    setBusinessName(businessNameT);
    await fetch("/api/onboarding/scrapeURLS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: finalUrl,
        businessName: businessNameT
      }),
    })
      .then((response) => response.json())
      .then(async ({ data, siteContent, success }: any) => {
        if (success) {
          toastDisplay('Business understood, storing ...', true);
          console.log(data);
          setProduct(data.product);
          setTargetAudience(data.target_audience);

          setLoading(false);
          return
          const content = siteContent.replace(/(\r\n|\n|\r)/gm, "");

          await embedText(
            "This information is from " + session?.user.email + " about " + businessNameT + ", this information is about the user business or website content.\n"
            + "What is the product: " + data.product
            + "\nWhat is the target audience: " + data.target_audience
            + "\nContent of the landing page: " + content
            , businessNameT
            , url
            , 'Landing Page Content');

        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        toastDisplay('Error while scraping, check if URL is well formed', false);
      });
  };

  return (
    <>
      <Text fontSize="xl" fontWeight={600}>
        Tell us more about your business
      </Text>
      <Text fontSize="l" fontWeight={400}>
        Tell us your business name
      </Text>

      <VStack w={700} align="flex-start" spacing={2}>
        <HStack align="flex-end" w="full">
          <VStack align="flex-start" w="full">
            <Input
              isDisabled={loading}
              defaultValue={businessNameT}
              placeholder="Wanda"
              onChange={(evt) => {
                setBusinessNameT(evt.target.value);
              }}
            />
          </VStack>
        </HStack>
      </VStack>
      <Text fontSize="l" fontWeight={400}>
        Tell us your company or personal website so we can better understand you.
      </Text>

      <VStack w={700} align="flex-start" spacing={2}>
        <HStack align="flex-end" w="full">
          <VStack align="flex-start" w="full">
            <Input
              isDisabled={loading || !businessNameT}
              defaultValue={url}
              placeholder="https://wanda.so"
              type="url"
              onChange={(evt) => {
                setURL(evt.target.value);
              }}
            />
          </VStack>
          <Button
            isDisabled={loading || !businessNameT || !url || loadingSitemap}
            onClick={() => {
              checkSitemap();
            }}
          >
            {loadingSitemap ? <Spinner color="#8F50E2" /> : 'Add'}
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
            onNextAction({ url, targetAudience, product, businessName });
          }}
          isDisabled={!product || !targetAudience || !businessName}
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
      <ModalComponent isOpen={isOpen} onClose={() => setIsOpen(false)} title={"Website"} content={sitemapModelContent()} buttonText={"Get context"}
        buttonClickT={() => { handleScrape() }}
        buttonDisabled={!checkedItems.some((element) => element === true)} />
    </>
  );
};

interface Step1Props {
  onPrevAction: () => void;
  onNextAction: (data: any) => void;
  businessName: string
  setBusinessName: (businessName: string) => void;
}

const Step1: FunctionComponent<Step1Props> = ({
  onPrevAction,
  onNextAction,
  businessName,
  setBusinessName
}: Step1Props) => {
  const [xHandle, setXHandle] = useState("here_is_abrams");
  const [loading, setLoading] = useState(false);
  const [tweets, setTweets] = useState([]);
  const { data: session, status } = useSession()

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
      .then(async ({ data }: any) => {
        if (data.status === 200 || data.length > 0) {
          toastDisplay('X handle added successfully, storing ...', true);
          setTweets(data);

          await embedText(
            "This information is from " + session?.user.email + " about " + businessName + ", this information is a set of different tweets written the the user for that particular business, it should be used to create new content based on the tweets tone of writing.\n"
            + "Tweets: " + data
            , businessName
            , xHandle
            , 'Twitter Handle and Tweets');

        }
        else {
          toastDisplay('Error while accessing X, check your handle.', false);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        setTweets([]);
        toastDisplay('Error while accessing X, check your handle.', false);
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
          <Progress size="xs" isIndeterminate colorScheme="purple" w="full" />
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
          isDisabled={!xHandle || tweets.length === 0 || loading}
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
  businessName: string
  setBusinessName: (businessName: string) => void;
}

const Step2: FunctionComponent<Step2Props> = ({
  onPrevAction,
  onNextAction,
  businessName,
  setBusinessName
}: Step2Props) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [numberOfCompetitors, setNumberOfCompetitors] = useState([0]);
  const { data: session, status } = useSession();
  const [inputs, setInputs] = useState({});

  const addQuestionResponses = async (response1: {}) => {
    if (Object.keys(response1).length === 0) {
      return;
    }
    setLoading(true);
    await fetch("/api/onboarding/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response1 }),
    })
      .then((response) => response.json())
      .then(async ({ status, response1 }: any) => {
        if (status === 200 || length > 0) {

          toastDisplay('Answer to questions received, storing ...', true);

          await embedText(
            "This information is from " + session?.user.email + " about " + businessName + ", this information is some business information, like competition.\n"
            + "Information: " + response1
            , businessName
            , businessName
            , 'Business Information, like competition');

        }
        else {
          toastDisplay('Error while storing answers', false);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        toastDisplay('Error while storing answers', false);
      });
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

        <HStack align="flex-end" w="full">
          <VStack align="flex-start" w="full">
            {numberOfCompetitors.map((item, index) => (
              <Input
                key={index}
                placeholder="https://wanda.so"
                type="url"
                onChange={(e) =>
                  setInputs((prev) => {
                    return { ...prev, [item]: e.target.value };
                  })
                }
              />
            ))}
          </VStack>
        </HStack>
        <HStack align="flex-end" w="full">

          <Button
            onClick={() => {
              setNumberOfCompetitors([...numberOfCompetitors, numberOfCompetitors.length]);
            }}
          >
            +
          </Button>
          <Button
            onClick={() => {
              if (numberOfCompetitors.length > 1) {
                setNumberOfCompetitors(numberOfCompetitors.slice(0, -1));
              }
            }}
            isDisabled={numberOfCompetitors.length === 1}
          >
            -
          </Button>
        </HStack>

      </VStack>

      <HStack w="full" justify="space-between">

        <Button
          isDisabled={loading}

          onClick={async () => {
            await addQuestionResponses(inputs);
            onNextAction({ setContent });
          }}
        >
          Start generating ideas
        </Button>
      </HStack>


      {loading && (
        <Progress size="xs" isIndeterminate colorScheme="purple" w="full" />
      )}
    </>
  );
};

interface Step3Props {
  onPrevAction: () => void;
  onNextAction: () => void;
  businessName: string
  setBusinessName: (businessName: string) => void;
}

const Step3: FunctionComponent<Step3Props> = ({
  onPrevAction,
  onNextAction,
  businessName,
  setBusinessName
}: Step3Props) => {
  const contentArray = [
    "Ideas brewing in the cosmic cauldron 🌌🔮...",
    "Summoning the Batsignal of inspiration 🦇💡...",
    "Exploring your digital universe 🌟🌐...",
  ]

  const [currentContent, setCurrentContent] = useState(contentArray[0]);

  async function changer() {
    await sleep(2000)
    setCurrentContent(contentArray[1]);
    await sleep(2000)
    setCurrentContent(contentArray[2]);
    await sleep(2000)
    onNextAction();
  }

  useEffect(() => {
    changer()

    Mixpanel.track("Loaded Onboarding Page");
  });

  return (
    <Center>
      <Stack w="30vw">
        <Text fontSize="xl" fontWeight={600}>
          {currentContent}
        </Text>
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
      </Stack>
    </Center>
  );
};


interface StepICPProps {
  onPrevAction: () => void;
  onNextAction: (data: any) => void;
  businessName: string
  setBusinessName: (businessName: string) => void;
}

const StepICP: FunctionComponent<StepICPProps> = ({
  onPrevAction,
  onNextAction,
  businessName,
  setBusinessName
}: StepICPProps) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedFundingRaised, setSelectedFundingRaised] = useState([]);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState([]);
  const [selectedBusinessModels, setSelectedBusinessModels] = useState([]);
  const [selectedTechUsed, setSelectedTechUsed] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const industriesList = industriesICP.map((industry) => ({ label: industry, value: industry }));
  const employeesList = employsICP.map((employ) => ({ label: employ, value: employ }));
  const fundingRaisedList = fundingRaisedICP.map((funding) => ({ label: funding, value: funding }));
  const companyTypesList = companyTypeICP.map((companyType) => ({ label: companyType, value: companyType }))
  const businessModelList = businessModelICP.map((businessModel) => ({ label: businessModel, value: businessModel }));
  const techUsedList = techUsedICP.map((techUsed) => ({ label: techUsed, value: techUsed }));
  const countriesList = countriesICP.map((country) => ({ label: country, value: country }));

  const addICP = async () => {
    setLoading(true);

    toastDisplay('ICP added successfully, storing ...', true);
    const response =
      await POSTApiCall('/api/db/addOrCreateDBEntry',
        {
          collection: 'userICP',
          numberOfConditions: 1,
          condition: ['email'],
          conditionValue: [session?.user.email],
          conditionOperation: ['=='],
          body: {
            email: session?.user.email,
            industriesICP: selectedIndustries.map((value: any) => value?.label),
            employsICP: selectedEmployees.map((value: any) => value.label),
            fundingRaisedICP: selectedFundingRaised.map((value: any) => value.label),
            businessModelICP: selectedBusinessModels.map((value: any) => value.label),
            techUsedICP: selectedTechUsed.map((value: any) => value.label),
            countriesICP: selectedCountries.map((value: any) => value.label),
            companyTypeICP: selectedCompanyTypes.map((value: any) => value.label),
          },
        })
    setLoading(false);
  };
  const handleChange = (selected: any, setSelected: any) => {
    setSelected(selected);
  };

  const select = (title: string, optionsList: any, changeFunction: any, valueSelected: any, setSelectedValue: any) => {
    return (
      <HStack w={700} spacing={2} justifyContent="space-between" align="center">
        <Text fontSize="sm" fontWeight={200}>
          {title}
        </Text>
        <div style={{ width: '500px' }} >
          <ReactSelect
            menuPlacement="auto"
            menuPosition="fixed"
            options={optionsList}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{ Option }}
            onChange={(selected) => changeFunction(selected, setSelectedValue)}
            isDisabled={loading}
            value={valueSelected} />
        </div>
      </HStack>
    )
  }
  return (
    <>

      <Text fontSize="xl" fontWeight={600}>
        Select your ICP
      </Text>


      <VStack w={700} align="flex-start" spacing={6}>

        {select('Industry', industriesList, handleChange, selectedIndustries, setSelectedIndustries)}
        {select('Employees', employeesList, handleChange, selectedEmployees, setSelectedEmployees)}
        {select('Funding raised', fundingRaisedList, handleChange, selectedFundingRaised, setSelectedFundingRaised)}
        {select('Company type', companyTypesList, handleChange, selectedCompanyTypes, setSelectedCompanyTypes)}
        {select('Business model', businessModelList, handleChange, selectedBusinessModels, setSelectedBusinessModels)}
        {select('Tech used', techUsedList, handleChange, selectedTechUsed, setSelectedTechUsed)}
        {select('Country', countriesList, handleChange, selectedCountries, setSelectedCountries)}

      </VStack>
      {loading && (
        <Progress size="xs" isIndeterminate colorScheme="purple" w="full" />
      )}

      <HStack w="full" justify="space-between">
        {/* <Button onClick={handlePrevious}>Previous</Button> */}

        <Button
          isDisabled={loading}
          onClick={async () => {
            await addICP()
            onNextAction({});
          }}
        >
          Start using
        </Button>


        <Button
          isDisabled={loading}
          onClick={() => {
            let skip = 'skip'
            onNextAction({ skip });
          }}
        >
          Skip
        </Button>
      </HStack>
    </>
  );
};

Onboarding.auth = true;