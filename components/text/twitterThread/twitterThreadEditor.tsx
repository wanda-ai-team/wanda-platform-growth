import { Textarea } from '@chakra-ui/react'

const TwitterThreadEditor = ({ setTwitterThreadText, twitterThreadText, index }: { setTwitterThreadText: any; twitterThreadText: any; index: any; }) => {

    let handleInputChange = (e: { target: { value: any; }; }) => {
        let newArr = [...twitterThreadText];
        newArr[index] = e.target.value;
        setTwitterThreadText(newArr);
    }
    return (
        <Textarea
            value={twitterThreadText}
            onChange={handleInputChange}
            maxLength={280}
            placeholder='Here is a sample placeholder'
            size='sm' />
    );
};

export default TwitterThreadEditor;
