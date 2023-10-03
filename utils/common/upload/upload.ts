import { MutableRefObject } from "react";
import toastDisplay from "../toast";

export default async function uploadFile(e: any, setLoadingAPICall: ((arg0: boolean) => void), inputFileRef: MutableRefObject<HTMLInputElement | null>, setTranscript: (arg0: string) => void) {
    setLoadingAPICall(true);

    if (inputFileRef === null || inputFileRef.current === null || inputFileRef.current.files === null || inputFileRef.current.files.length === 0) {
      return;
    }
    console.log("ola")

    const file = inputFileRef.current.files[0];
    const filename = encodeURIComponent(inputFileRef.current.files[0].name.replace(/\s/g, ""));
    const res = await fetch(`/api/files/upload/upload?file=${filename}`);
    let { url, fields } = await res.json();
    const formData = new FormData();

    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      console.log("key")
      console.log(key)
      console.log("value")
      console.log(value)
      // @ts-ignore
      formData.append(key, value);
    });

    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (upload.ok) {
      console.log("url")
      console.log(url + filename)
      let URLF = url + filename;
      toastDisplay('Upload done, transcribing..', true);

      // const formData = new FormData();

      // Object.entries({ ...fields, file }).forEach(([key, value]) => {
      //   // @ts-ignore
      //   formData.append(key, value);
      // });

      // const upload = await fetch(url, {
      //   method: 'POST',
      //   body: formData,
      // });

      if (fields.success_action_status === '201') {
        const decoder = new TextDecoder();
        const response = await fetch("/api/llm/whisper/speechToTextAAIURL", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: URLF,
            getUsers: true,
          }),
        })
        let done = false;
        const test = await response.json();
        return JSON.parse(test);
        // if (response === undefined) return;
        // const reader = response?.body?.getReader();
        // let trans = "";
        // while (!done) {
        //   if (reader === undefined) return;
        //   const { value, done: doneReading } = await reader?.read();

        //   done = doneReading;
        //   if (value && decoder.decode(value) !== "processing") {

        //     const data = decoder.decode(value);
        //     // Do something with data
        //     trans += data;
        //   };

        // }

        // setTranscript(trans)
        // toastDisplay('Transcript done, summarizing...', true);

        // setLoadingAPICall(false);

        // console.log('Uploaded successfully!');
      } else {
        console.error('Upload failed.');
      }
    }
  };