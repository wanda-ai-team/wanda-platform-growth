import Image from "next/image";
import ButtonC from "../buttons/button";
import { ReactElement, JSXElementConstructor, ReactFragment, ReactPortal, useState } from "react";
import { InlineWidget, PopupButton, PopupModal, PopupWidget } from "react-calendly";
import Modal from 'react-modal'
const PriceBlock = ({ footnote, loading, onclick, title, price, subtitle, featuresList, buttonText, baseColor, buttonColor, priceSubtitle }: any) => {

    const [isOpen, setIsOpen] = useState(false)
    return (
        <div style={{ borderRadius: '12px', backgroundColor: baseColor, padding: '24px' }} className="gap-[24px] self-stretch flex flex-col items-start justify-start text-left text-lg text-midnightblue font-body-body-3-body-3-emphasized1">
            <h4 style={{ color: baseColor !== '#f9f9f9' ? 'white' : '#8F50E2' }}>
                {title}
            </h4>
            <div>
                <span >
                    <h1 style={{ display: 'inline', color: baseColor !== '#f9f9f9' ? 'white' : '#2C154F' }}>
                        {price}
                    </h1>
                    <h4 style={{ display: 'inline', color: baseColor !== '#f9f9f9' ? 'white' : '#2C154F' }}>
                        {priceSubtitle}
                    </h4>
                </span>
            </div>
            <div className="flex flex-col gap-[16px]">
                <p className={` ${baseColor === '#f9f9f9' ? 'body2em' : 'body2emW'}`}>
                    {subtitle}
                </p>

                <div className="flex flex-col gap-[12px]">
                    {featuresList !== undefined && featuresList.map((feature: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined, index: any) => (
                        <div key={feature + index} className="flex flex-row gap-[12px] ">
                            <Image src={"/assets/icons/" + (baseColor === '#f9f9f9' ? 'checkbox' : 'checkboxW') + ".png"} alt={""}
                                width="0"
                                height="0"
                                style={{ width: '12px', height: '12px', marginTop: 'auto', marginBottom: 'auto' }} ></Image>
                            <p className={` ${baseColor === '#f9f9f9' ? 'body2' : 'body2W'}`} >
                                {feature}
                            </p>
                        </div>
                    ))}
                </div>

            </div>

            <ButtonC icon={undefined} className={buttonColor} label={buttonText} loading={loading} loadingLabel={'...'} valueExists={true}
                classButton={undefined} classText={undefined} onclick={() => { title === 'Believer' ? setIsOpen(true) : onclick() }}></ButtonC>

            <PopupModal
                url="https://calendly.com/wandaai/wizard-early-access"
                /*
                 * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
                 * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
                 */
                rootElement={document.getElementById("__next") as HTMLElement}
                onModalClose={() => setIsOpen(false)}
                open={isOpen}
            />

            <div className="flex flex-col self-stretch text-center">
                <span style={{
                    fontWeight: 400,
                    fontSize: '10px',
                    lineHeight: '16px',
                    letterSpacing: '0.01em',
                    color: '#554271'

                }}>
                    {footnote}
                </span>
            </div>
        </div>
    );
};

export default PriceBlock;