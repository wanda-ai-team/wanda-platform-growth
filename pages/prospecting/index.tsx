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
    Container,
    Spinner
} from "@chakra-ui/react";
import streamResponse from "@/utils/common/stream";
import { useSession } from "next-auth/react";
import toastDisplay from "@/utils/common/toast";
import Link from 'next/link';

export default function Prospecting() {
    const session = useSession({ required: true })
    const [companies, setCompanies] = useState([]) as any;
    const [people, setPeople] = useState([]) as any;
    const [selectedPeople, setSelectedPeople] = useState([]) as any;
    const [selectedCompanies, setSelectedCompanies] = useState([]) as any;

    const [loadingCRMCall, setLoadingCRMCall] = useState(false) as any;
    const [loadingCompanies, setLoadingCompanies] = useState(true) as any;
    const [loadingPeople, setLoadingPeople] = useState(false) as any;

    const stopB = useRef(false);
    const canStopB = useRef(false);
    const [generatedText, setGeneratedText] = useState("");


    async function getCompanies() {
        const company = await POSTApiCall("/api/integrations/peopledata/searchCompanies", {
            getOldCompanies: true,
        });
        setCompanies(company.data)

        setLoadingCompanies(false);
    }

    async function getPeople() {
        setLoadingPeople(true);
        const people = await POSTApiCall("/api/integrations/peopledata/searchPeople", {
            "companiesNames": selectedCompanies
        });
        setPeople(people.data)
        if (people.data) {
            toastDisplay("People found", true)
        }
        else {
            toastDisplay("No people found", false)
        }

        setLoadingPeople(false);
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

    async function updateCRM() {
        setLoadingCRMCall(true);
        const selectedPerson = people.filter((person: any) => { return selectedPeople.includes(person.full_name) })
        const updateCRM = await POSTApiCall("/api/integrations/hubspot/updateCRM", {
            "selectedPeople": selectedPerson,
        });
        if (updateCRM.success) {
            toastDisplay("CRM Updated Successfully", true)
        }
        else {
            toastDisplay("CRM Update Failed", false)
        }
        setLoadingCRMCall(false);
    }

    useEffect(() => {
        getCompanies();
    }, []);

    return (
        <main className={styles.main}>
            <div className={styles.form__container} style={{ height: '91.5vh', justifyContent: 'space-between' }}>
                <VStack align="flex-start" justify="flex-start" ml={8}>
                    <Text fontSize="xl" fontWeight={600}>
                        Prospecting
                    </Text>

                    <Text fontSize="lg" fontWeight={400}>
                        Companies
                    </Text>
                    {loadingCompanies ?
                        <>
                            <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl' />
                        </>
                        :
                        <Container maxH='350px' maxW='800px' overflow='auto' ml={'0'}>
                            {companies && companies.length <= 0
                                ?
                                <Text fontSize="md" fontWeight={400}>No Companies Found</Text>
                                :
                                <CheckboxGroup colorScheme='green' value={selectedCompanies} onChange={setSelectedCompanies} >
                                    <VStack spacing={4} alignItems="start">
                                        {companies && companies.length > 0 && companies.map((company: any) => (
                                            <div key={company.id}>
                                                <Checkbox value={company.display_name}><h1>{company.display_name}</h1></Checkbox>
                                                <br></br>
                                                <Link href={company.linkedin_url !== null ? "https://" + company.linkedin_url : ""} target="_blank">{company.linkedin_url}</Link>
                                                <br></br>
                                                <Link href={company.twitter_url !== null ? "https://" + company.twitter_url : ""}>{company.twitter_url}</Link>
                                            </div>
                                        ))}
                                    </VStack>
                                </CheckboxGroup>
                            }
                        </Container>
                    }

                    <Button colorScheme='purple' isDisabled={selectedCompanies.length <= 0} onClick={() => getPeople()} isLoading={loadingPeople}> Search People</Button>

                    <Text fontSize="lg" fontWeight={400}>
                        People
                    </Text>
                    {loadingPeople ?
                        <>
                            <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl' />
                        </>
                        :
                        <Container maxH='350px' maxW='800px' overflow='auto' ml={'0'}>
                            {people && people.length <= 0
                                ?
                                <Text fontSize="md" fontWeight={400}>No People Found</Text>
                                :
                                <CheckboxGroup colorScheme='green' value={selectedPeople} onChange={setSelectedPeople} >
                                    <VStack spacing={4} alignItems="start">
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
                                    </VStack>
                                </CheckboxGroup>
                            }
                        </Container>
                    }
                </VStack>
                <Container>
                    <Button colorScheme='purple' isDisabled={selectedPeople.length <= 0} onClick={() => updateCRM()} isLoading={loadingCRMCall}> Update CRM </Button>
                    <Button colorScheme='purple' isDisabled={selectedPeople.length <= 0} onClick={() => generateEmail(true)}> Generate Emails </Button>
                </Container>
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