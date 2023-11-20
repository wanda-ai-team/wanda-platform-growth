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
    Textarea
} from "@chakra-ui/react";
import streamResponse from "@/utils/common/stream";
export default function Prospecting() {
    const [companies, setCompanies] = useState([]) as any;
    const [people, setPeople] = useState([]) as any;
    const [selectedPeople, setSelectedPeople] = useState([]) as any;
    const stopB = useRef(false);
    const canStopB = useRef(false);
    const [generatedText, setGeneratedText] = useState("");


    async function getCompanies() {
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
        let websitescrape: {
            content?: string;
            context?: string;
        } = {};

        // const response = await outputContent(transcript, outputSelected, outputSelectedT, outputSelectedW)
        const response = await fetch("/api/llm/gpt3/textToThreadStream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: "transcript",
                output: "email",
                outputO: "followup",
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
            <VStack align="flex-start" justify="flex-start" ml={8}>
                <Text fontSize="xl" fontWeight={600}>
                    Prospecting
                </Text>

                <Text fontSize="lg" fontWeight={400}>
                    Companies
                </Text>
                <HStack spacing={4}>
                    <Text fontSize="sm" fontWeight={200}>
                        {companies.map((company: any) => (
                            <div key={company.id}>
                                <h1>{company.display_name}</h1>
                                <a href={company.linkedin_url}><h3>{company.linkedin_url}</h3></a>
                            </div>
                        ))}
                    </Text>
                </HStack>


                <Text fontSize="lg" fontWeight={400}>
                    People
                </Text>
                <CheckboxGroup colorScheme='green' value={selectedPeople} onChange={setSelectedPeople} >
                    <HStack spacing={4}>
                        <Text fontSize="sm" fontWeight={200}>
                            {people.map((people: any) => (
                                <div key={people.id}>
                                    <Checkbox value={people.full_name}><h1>{people.full_name}</h1></Checkbox>
                                    <a href={people.linkedin_url}><h1>{people.linkedin_url}</h1></a>
                                    <p>{people.job_title} at {people.job_company_name}</p>
                                    <p>{people.work_email}</p>
                                    <p>{people.recommended_personal_email}</p>
                                    {people.personal_emails.map((email: any, index: number) => (
                                        <div key={index}>
                                            <p>{email}</p>
                                        </div>
                                    ))}
                                    {people.emails.map((email: any, index: number) => (
                                        <div key={index}>
                                            <p>{email}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </Text>
                    </HStack>
                </CheckboxGroup>

                <Button colorScheme='purple' isDisabled={false} onClick={() => generateEmail(true)}> Generate Emails </Button>

                <Textarea
                    value={generatedText}
                    size="lg"
                />
            </VStack>
        </main>
    )
}

Prospecting.auth = true;