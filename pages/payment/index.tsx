import { Tabs, TabList, Tab, Tooltip, TabPanels, TabPanel, SimpleGrid } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PriceBlock from "../../components/blocks/priceBlock";
import { InlineWidget, PopupButton } from "react-calendly";
import { useSession } from "next-auth/react";

export default function Payment() {
    const [loading, setLoading] = useState(true);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const router = useRouter();
    const { data: session, status, update } = useSession();
    // const session = useSession();

    async function getUser() {
        await fetch('/api/user/getUser')
            .then((res) => res.json())
            .then(async (data1) => {
                if (data1.content[0].data.isActive === true) {
                    router.push('/');
                } else {
                    setLoading(false);
                }
            }).catch((err) => {
                setLoading(false);
            });
            setLoading(false);
    }

    useEffect(() => {
        console.log("Olaa")
        getUser();
    }, []);

    function buyPro(productType: string) {
        setLoading1(true);
        fetch('/api/stripe/create-checkout-session?productId=' + productType)
            .then((res) => res.json())
            .then((data) => {
                if (data.redirectUrl) {
                    router.push(data.redirectUrl);
                }
                setLoading1(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading1(false);
            });
    }

    function buyBeliever() {
        setLoading2(true);
        // fetch('/api/stripe/create-checkout-session?productId=3-Year')
        //     .then((res) => res.json())
        //     .then((data) => {
        //         if (data.redirectUrl) {
        //             router.push(data.redirectUrl);
        //         }
        //         setLoading2(false);
        //     }).catch((err) => {
        //         console.log(err);
        //         setLoading2(false);
        //     });
    }

    return (
        <>
            {
                loading ?
                    <></>
                    :
                    <>
                        <div className="p bg-greyscale-grey-70 flex flex-row pt-24 pb-8 box-border items-center justify-center h-[94.5vh]">

                            <div></div>
                            <div className="self-stretch flex flex-col items-center justify-start gap-[88px]">
                                <div className="self-stretch flex flex-col items-center justify-between gap-[24px]">
                                    <h1>
                                        Get better customer insights and multiply your content - Today!
                                    </h1>
                                    <h4>Start a 7-day free trial — no credit card required</h4>
                                </div>

                                <div id="123" className="self-stretch flex flex-col items-center justify-between gap-[24px]">
                                    <Tabs variant='unstyled' style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', }}>
                                            <TabList style={{ paddingLeft: '2px', paddingRight: '2px', marginTop: '55px', display: 'flex', justifyContent: 'center', paddingTop: '2px', paddingBottom: '2px', background: '#f9f9f9', borderRadius: '88px' }}>
                                                <Tab _selected={{ color: '#8f51e3', bg: '#f6f3ff' }} style={{ paddingRight: '48px', paddingLeft: '48px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '88px' }}>
                                                    <p className="body2emp" >Bill monthly</p>
                                                </Tab>
                                                <Tab _selected={{ color: '#8f51e3', bg: '#f6f3ff' }} style={{ paddingRight: '48px', paddingLeft: '48px', paddingTop: '9px', paddingBottom: '9px', borderRadius: '88px' }}>
                                                    <Tooltip label='Coming soon...' placement='top'>
                                                        <p className="body2emp" >Bill anually</p>
                                                    </Tooltip>
                                                </Tab>
                                            </TabList>

                                        </div>

                                        <TabPanels>
                                            <TabPanel>
                                                <SimpleGrid columns={2} spacing={10}>
                                                    <PriceBlock footnote={'No credit card required.'}
                                                        loading={loading1}
                                                        onclick={() => buyPro("Pro-Month")}
                                                        title={'Pro'}
                                                        price={'$19'}
                                                        priceSubtitle={'/month'}
                                                        subtitle={'For Teams scaling their content .'}
                                                        featuresList={['All Content Outputs', 'All Content Inputs', 'Access to beta features']} buttonText={'Start a 7-day Free Trial'} baseColor={'#f9f9f9'} buttonColor={'buttonMainPurple'} />
                                                    <PriceBlock footnote={undefined} loading={loading2} onclick={buyBeliever} title={'Believer'} price={'Talk with us'} priceSubtitle={''}
                                                        subtitle={'Everything in Pro plan plus...'}
                                                        featuresList={['Build features alongside us', 'Community Calls with the Team', 'Roadmap & Support priority']} buttonText={'Contact Us'} baseColor={'#8F50E2'} buttonColor={'buttonMainWhite'} />
                                                </SimpleGrid>
                                            </TabPanel>
                                            <TabPanel>
                                                <SimpleGrid columns={2} spacing={10}>
                                                    <PriceBlock footnote={'No credit card required.'} loading={loading1} onclick={() => buyPro("Pro-Year")} title={'Pro'}
                                                        price={'$190'} priceSubtitle={'/year'} subtitle={'For Teams scaling their content .'}
                                                        featuresList={['All Content Outputs', 'All Content Inputs', 'Access to beta features']} buttonText={'Start a 7-day Free Trial'} baseColor={'#f9f9f9'} buttonColor={'buttonMainPurple'} />
                                                    <PriceBlock footnote={undefined} loading={loading2} onclick={buyBeliever} title={'Believer'} price={'Talk with us'} priceSubtitle={''}
                                                        subtitle={'Everything in Pro plan plus...'}
                                                        featuresList={['Build features alongside us', 'Community Calls with the Team', 'Roadmap & Support priority']} buttonText={'Contact Us'} baseColor={'#8F50E2'} buttonColor={'buttonMainWhite'} />
                                                </SimpleGrid>
                                            </TabPanel>
                                        </TabPanels>
                                    </Tabs>
                                </div>
                            </div>

                        </div>
                    </>
            }
        </>
    )
}

Payment.auth = true;