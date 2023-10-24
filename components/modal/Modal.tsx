import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from "@chakra-ui/react";

const ModalComponent = ({ content, isOpen, onClose, title, buttonText, buttonClickT, buttonDisabled }: any) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {content}
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='red' mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button isDisabled={buttonDisabled} colorScheme='purple' onClick={buttonClickT}>{buttonText}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default ModalComponent;