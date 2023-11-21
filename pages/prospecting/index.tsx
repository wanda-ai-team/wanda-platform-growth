import styles from "@/styles/HomeN.module.css";
import { GETApiCall, POSTApiCall } from "@/utils/api/commonAPICall";
import { useEffect, useRef, useState } from "react";
import {
    HStack,
    Text,
    VStack,
    Checkbox,
    CheckboxGroup,
    Button,
    Textarea,
    Container
} from "@chakra-ui/react";
import streamResponse from "@/utils/common/stream";
import { useSession } from "next-auth/react";
export default function Prospecting() {
    const session = useSession({ required: true })
    const [companies, setCompanies] = useState([]) as any;
    const [people, setPeople] = useState([]) as any;
    const [selectedPeople, setSelectedPeople] = useState([]) as any;
    const stopB = useRef(false);
    const canStopB = useRef(false);
    const [generatedText, setGeneratedText] = useState("");


    async function getCompanies() {
        console.log("getCompanies")
        const company = await GETApiCall("/api/integrations/peopledata/searchCompanies");
        setCompanies(company.data)
        console.log(company);

        const people = await POSTApiCall("/api/integrations/peopledata/searchPeople", {
            // "companyName": "peopledatalabs",
            "jobTitle": ["co-founder"]
        });
        console.log(people);
        setPeople(people.data)
        // console.log(comapny.data[0].linkedin_url);

        // const url = "linkedin.com/company/peopledatalabs"
        // const companyInfo = await POSTApiCall("/api/integrations/linkedin/scrap", { "linkedin": url });
    }

    async function generateEmail(
        text: boolean,
    ) {

        const selectedPerson = people.filter((person: any) => { return selectedPeople.includes(person.full_name) })

        const contextResponse = await POSTApiCall("api/context/getContext", { platform: "email" })

        const response = await fetch("/api/llm/gpt3/textToThreadStream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: "transcript",
                output: "email",
                outputO: "followup",
                selectedPerson: selectedPerson[0],
                email: session.data?.user.email,
                context: contextResponse.documents[1].page_content,
                isText: text,
                toneStyle: "friendly",
                writingStyle: "friendly",
                landingPageContent: "",
                landingPageContext: "",
            }),
        });


        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = response.body;
        if (!data) {
            return;
        }

        let a: any;
        await streamResponse(data, setGeneratedText, canStopB, stopB, a, "email", a);
        canStopB.current = false;
    }

    useEffect(() => {
        getCompanies();
    }, []);

    return (
        <main className={styles.main}>
            <div className={styles.form__container} style={{height: '91.5vh'}}>

                <VStack align="flex-start" justify="flex-start" ml={8}>
                    <Text fontSize="xl" fontWeight={600}>
                        Prospecting
                    </Text>

                    <Text fontSize="lg" fontWeight={400}>
                        Companies
                    </Text>
                    <Container maxH='200px' overflow='auto' ml={'0'}>
                        <HStack spacing={4}>
                            <Text fontSize="sm" fontWeight={200}>
                                {companies && companies.length > 0 && companies.map((company: any) => (
                                    <div key={company.id}>
                                        <h1>{company.display_name}</h1>
                                        <a href={company.linkedin_url}>{company.linkedin_url}</a>
                                        <br></br>
                                        <a href={company.twitter_url}>{company.twitter_url}</a>
                                    </div>
                                ))}
                            </Text>
                        </HStack>
                    </Container>


                    <Text fontSize="lg" fontWeight={400}>
                        People
                    </Text>

                    <Container maxH='250px' overflow='auto' ml={'0'}>
                        <CheckboxGroup colorScheme='green' value={selectedPeople} onChange={setSelectedPeople} >
                            <HStack spacing={4}>
                                <Text fontSize="sm" fontWeight={200}>
                                    {people && people.length > 0 && people.map((people: any) => (
                                        <div key={people.id}>
                                            <Checkbox value={people.full_name}><h1>{people.full_name}</h1></Checkbox>
                                            <a href={people.linkedin_url}><h1>{people.linkedin_url}</h1></a>
                                            <p>{people.job_title} at {people.job_company_name}</p>
                                            <p>{people.work_email}</p>
                                            <p>{people.recommended_personal_email}</p>

                                            {people.emails && people.emails.map((email: any, index: number) => (
                                                <div key={index}>
                                                    <p>{email.address}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </Text>
                            </HStack>
                        </CheckboxGroup>
                    </Container>

                    <Button colorScheme='purple' isDisabled={false} onClick={() => generateEmail(true)}> Generate Emails </Button>

                </VStack>
            </div>

            <div className={styles.transcript__summary}>
                <div className={styles.texts}>
                    <span className={styles.summary__header}>
                        Email
                    </span>
                </div>
                <>
              <Textarea
                style={{ height: '100%', marginRight: '1.5%', width: '97%', marginLeft: '1.5%' }}
                value={generatedText}
                placeholder='Here is a sample placeholder'
                size='lg' />
            </>
            </div>
        </main >
    )
}

Prospecting.auth = true;