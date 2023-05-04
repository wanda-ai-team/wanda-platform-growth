import { Button, Checkbox, Textarea } from "@chakra-ui/react";
import TwitterThreadEditor from "./twitterThreadEditor";
import styles from "@/styles/TwitterThread.module.css";

const TwitterThread = ({
  setNumberOfTweets,
  numberOfTweets,
  twitterThreadText,
  setTwitterThreadText,
  setSelectedTweets,
  selectedTweets,
}: {
  setNumberOfTweets: any;
  numberOfTweets: any;
  twitterThreadText: any;
  setTwitterThreadText: any;
  setSelectedTweets: any;
  selectedTweets: any;
}) => {
  function changeNumberOfTweets(add: boolean, index: number, i: string) {
    if (add) {
      let newArr = [...twitterThreadText];
      newArr.splice(index + 1, 0, "");
      setTwitterThreadText([...newArr]);
      // setTwitterThreadText([...twitterThreadText, ''])
      setNumberOfTweets(numberOfTweets + 1);
    } else {
      if (numberOfTweets === 1) return;
      setTwitterThreadText((twitterThreadText: any[]) =>
        twitterThreadText.filter((s: any, i: any) => i != index)
      );
      setNumberOfTweets(
        numberOfTweets > 1 ? numberOfTweets - 1 : numberOfTweets
      );
    }
  }

  function changeSelected(index: number, checked: boolean) {
    let newArr = [...selectedTweets];
    newArr[index] = checked;
    setSelectedTweets(newArr);
  }

  return twitterThreadText.map((i: any, index: number) => (
    <div key={index} className={styles.threadBox}>
      <Checkbox
        checked={selectedTweets[i]}
        colorScheme="purple"
        onChange={(e) => changeSelected(index, e.target.checked)}
      />
      <div className={styles.tweet__editor}>
        <TwitterThreadEditor
          setTwitterThreadText={setTwitterThreadText}
          twitterThreadText={twitterThreadText}
          index={index}
        />
        <div key={index} className={styles.threadBoxButtons}>
          <Button
            onClick={() => changeNumberOfTweets(true, index, i)}
            color="gray.400"
            colorScheme="gray"
            fontWeight="normal"
            size="sm"
            variant="ghost"
          >
            Add
          </Button>
          <Button
            onClick={() => changeNumberOfTweets(false, index, i)}
            color="gray.400"
            colorScheme="gray"
            fontWeight="normal"
            size="sm"
            variant="ghost"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  ));
};

export default TwitterThread;
