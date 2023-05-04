import { Textarea } from "@chakra-ui/react";

const TwitterThreadEditor = ({
  setTwitterThreadText,
  twitterThreadText,
  index,
}: {
  setTwitterThreadText: any;
  twitterThreadText: any;
  index: any;
}) => {
  let handleInputChange = (e: { target: { value: any } }) => {
    let newArr = [...twitterThreadText];
    newArr[index] = e.target.value;
    setTwitterThreadText([...newArr]);
  };
  return (
    <Textarea
      style={{ resize: "none", height: "100px" }}
      value={twitterThreadText[index]}
      onChange={handleInputChange}
      maxLength={280}
      variant="filled"
      size="sm"
    />
  );
};

export default TwitterThreadEditor;
