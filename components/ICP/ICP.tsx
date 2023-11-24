import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, HStack, Progress, VStack, Text } from "@chakra-ui/react";

import { default as ReactSelect } from "react-select";
import Option from "@/components/options/Option";
import { industriesICP, employsICP, fundingRaisedICP, companyTypeICP, businessModelICP, techUsedICP, countriesICP, birthYearPersona, jobPersona } from "@/utils/globalVariables";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toastDisplay from "@/utils/common/toast";
import { POSTApiCall } from "@/utils/api/commonAPICall";

const ICPList = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedFundingRaised, setSelectedFundingRaised] = useState([]);
    const [selectedCompanyTypes, setSelectedCompanyTypes] = useState([]);
    const [selectedBusinessModels, setSelectedBusinessModels] = useState([]);
    const [selectedTechUsed, setSelectedTechUsed] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedBirth, setSelectedBirth] = useState([]);
    const [selectdJob, setSelectedJob] = useState([]);

    const industriesList = industriesICP.map((industry) => ({ label: industry, value: industry }));
    const employeesList = employsICP.map((employ) => ({ label: employ, value: employ }));
    const fundingRaisedList = fundingRaisedICP.map((funding) => ({ label: funding, value: funding }));
    const companyTypesList = companyTypeICP.map((companyType) => ({ label: companyType, value: companyType }))
    const businessModelList = businessModelICP.map((businessModel) => ({ label: businessModel, value: businessModel }));
    const techUsedList = techUsedICP.map((techUsed) => ({ label: techUsed, value: techUsed }));
    const countriesList = countriesICP.map((country) => ({ label: country, value: country }));
    const birthYearPersonaList = birthYearPersona.map((birth) => ({ label: birth, value: birth }));
    const jobPersonaList = jobPersona.map((job) => ({ label: job, value: job }));

    const getICPFromDB = async () => {
        await POSTApiCall('/api/db/getDBEntry', {
            collection: 'userICP',
            conditionOperation: ['=='],
            conditionValue: [session?.user.email],
            condition: ['email'],
            numberOfConditions: 1,
        }).then(async (data1) => {
            if(data1 && data1.success){
                setSelectedIndustries(data1.content[0].data.industriesICP?.map((industry: any) => ({ label: industry, value: industry })));
                setSelectedEmployees(data1.content[0].data.employsICP?.map((employ: any) => ({ label: employ, value: employ })));
                setSelectedFundingRaised(data1.content[0].data.fundingRaisedICP?.map((funding: any) => ({ label: funding, value: funding })));
                setSelectedCompanyTypes(data1.content[0].data.companyTypeICP?.map((companyType: any) => ({ label: companyType, value: companyType })));
                setSelectedBusinessModels(data1.content[0].data.businessModelICP?.map((businessModel: any) => ({ label: businessModel, value: businessModel })));
                setSelectedTechUsed(data1.content[0].data.techUsedICP?.map((techUsed: any) => ({ label: techUsed, value: techUsed })));
                setSelectedCountries(data1.content[0].data.countriesICP?.map((country: any) => ({ label: country, value: country })));
                setSelectedBirth(data1.content[0].data.birthYearPersona?.map((birth: any) => ({ label: birth, value: birth })));
                setSelectedJob(data1.content[0].data.jobPersona?.map((job: any) => ({ label: job, value: job })));
            }
        })

        setLoading(false);
    }

    useEffect(() => {
        console.log('session', session);
        getICPFromDB();
    }, []);

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

    const handleChange = (selected: any, setSelected: any) => {
        setSelected(selected);
    };

    const addICP = async () => {
        setLoading(true);

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
                        industriesICP: selectedIndustries?.map((value: any) => value?.label),
                        employsICP: selectedEmployees?.map((value: any) => value.label),
                        fundingRaisedICP: selectedFundingRaised?.map((value: any) => value.label),
                        businessModelICP: selectedBusinessModels?.map((value: any) => value.label),
                        techUsedICP: selectedTechUsed?.map((value: any) => value.label),
                        countriesICP: selectedCountries?.map((value: any) => value.label),
                        companyTypeICP: selectedCompanyTypes?.map((value: any) => value.label),
                        birthYearPersona: selectedBirth?.map((value: any) => value.label),
                        jobPersona: selectdJob?.map((value: any) => value.label),
                    },
                })
        setLoading(false);

        
        toastDisplay('ICP updated successfully', true);
    };

    return (

        <>
            <Text fontSize="xl" fontWeight={600}>
                Change ICP
            </Text>


            <VStack w={700} align="flex-start" spacing={6}>
                {select('Company industry', industriesList, handleChange, selectedIndustries, setSelectedIndustries)}
                {select('Company number of Employees', employeesList, handleChange, selectedEmployees, setSelectedEmployees)}
                {select('Company funding raised', fundingRaisedList, handleChange, selectedFundingRaised, setSelectedFundingRaised)}
                {select('Company type', companyTypesList, handleChange, selectedCompanyTypes, setSelectedCompanyTypes)}
                {select('Company business model', businessModelList, handleChange, selectedBusinessModels, setSelectedBusinessModels)}
                {select('Company tech used', techUsedList, handleChange, selectedTechUsed, setSelectedTechUsed)}
                {select('Company Country', countriesList, handleChange, selectedCountries, setSelectedCountries)}
                {select('Persona birth year', birthYearPersonaList, handleChange, selectedBirth, setSelectedBirth)}
                {select('Persona work position', jobPersonaList, handleChange, selectdJob, setSelectedJob)}

            </VStack>
            {loading && (
                <Progress size="xs" isIndeterminate colorScheme="purple" w="full" />
            )}

            <Button
                isDisabled={loading}
                onClick={async () => {
                    await addICP()
                }}
            >
                Save
            </Button>

        </>
    )
}

export default ICPList;