import { Button, Textarea } from '@chakra-ui/react'
import TwitterThreadEditor from './twitterThreadEditor';

const TwitterThread = ({ setNumberOfTweets, numberOfTweets, twitterThreadText, setTwitterThreadText }: { setNumberOfTweets: any; numberOfTweets: any; twitterThreadText: any; setTwitterThreadText: any }) => {

    function changeNumberOfTweets(add: boolean) {
        if (add) {
            setTwitterThreadText([...twitterThreadText, ''])
            setNumberOfTweets(numberOfTweets + 1)
        } else {
            if (numberOfTweets === 1) return;
            setTwitterThreadText((twitterThreadText: any[]) => (twitterThreadText.slice(0, -1)));
            setNumberOfTweets(
                numberOfTweets > 1
                    ? (numberOfTweets - 1)
                    : numberOfTweets
            )
        }
    }

    return (
        [...Array(numberOfTweets)].map((i, index) => (
            <div key={index}>
                <TwitterThreadEditor setTwitterThreadText={setTwitterThreadText} twitterThreadText={twitterThreadText[index]} index={index} />
                <Button onClick={() => changeNumberOfTweets(true)}> Add new tweet </Button>
                <Button onClick={() => changeNumberOfTweets(false)}> Remove tweet </Button>
            </div>
        ))
    );
};

export default TwitterThread;
