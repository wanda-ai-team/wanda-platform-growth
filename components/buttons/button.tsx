import { Button } from "@chakra-ui/react";
import Image from "next/image";
import styles from '../../styles/Button.module.css'
const ButtonC = ({ icon, className, label, loading, loadingLabel, valueExists, classButton, classText, onclick, iconWidth = 20 }: any) => {
    return (
        <div className="self-stretch flex flex-col items-center justify-start gap-[8px] text-left text-lg text-midnightblue font-body-body-3-body-3-emphasized1">
            <Button
                isLoading={loading}
                isDisabled={valueExists ? false : true}
                onClick={onclick}
                className={`self-stretch ${classButton}  ${styles[className]} ${loading ? styles['button-disabled'] : ''}`}>
                {icon !== undefined ?
                    <Image src={icon} alt={""} width={iconWidth} height="20"></Image>
                    : ''}
                <span className={`${classText}`}>
                    {loading
                        ? loadingLabel
                        : label
                    }
                </span>
            </Button>
            {/* <InputRightElement/> */}
        </div>
    );
};

export default ButtonC;