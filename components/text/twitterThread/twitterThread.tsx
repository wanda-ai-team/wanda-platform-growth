import { Button, Checkbox, Textarea } from '@chakra-ui/react'
import TwitterThreadEditor from './twitterThreadEditor';
import styles from '@/styles/TwitterThread.module.css'

const TwitterThread = ({ setNumberOfTweets, numberOfTweets, twitterThreadText, setTwitterThreadText, setSelectedTweets, selectedTweets }:
    { setNumberOfTweets: any; numberOfTweets: any; twitterThreadText: any; setTwitterThreadText: any; setSelectedTweets: any; selectedTweets: any; }) => {

    function changeNumberOfTweets(add: boolean, index: number, i: string) {
        if (add) {
            let newArr = [...twitterThreadText];
            newArr.splice(index + 1, 0, '');
            setTwitterThreadText([...newArr]);
            // setTwitterThreadText([...twitterThreadText, ''])
            setNumberOfTweets(numberOfTweets + 1)
        } else {
            if (numberOfTweets === 1) return;
            setTwitterThreadText((twitterThreadText: any[]) => twitterThreadText.filter((s: any, i: any) => (i != index)))
            setNumberOfTweets(
                numberOfTweets > 1
                    ? (numberOfTweets - 1)
                    : numberOfTweets
            )
        }
    }

    function changeSelected(index: number, checked: boolean) {
        let newArr = [...selectedTweets];
        newArr[index] = checked;
        setSelectedTweets(newArr);
    }


    return (
        twitterThreadText.map((i: any, index: number) => (
            <div key={index} className={styles.threadBox}>
                <TwitterThreadEditor setTwitterThreadText={setTwitterThreadText} twitterThreadText={twitterThreadText} index={index} />
                <div key={index} className={styles.threadBoxButtons}>
                    <Button onClick={() => changeNumberOfTweets(true, index, i)}> Add new tweet </Button>
                    <Button onClick={() => changeNumberOfTweets(false, index, i)}> Remove tweet </Button>
                    {/* <Checkbox checked={selectedTweets[i]} onChange={(e) => changeSelected(index, e.target.checked)}> Select tweet </Checkbox> */}
                </div>
            </div>
        ))
    );
};

export default TwitterThread;