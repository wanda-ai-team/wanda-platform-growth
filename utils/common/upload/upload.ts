import { MutableRefObject } from "react";

export default async function uploadFile(setLoadingAPICall: ((arg0: boolean) => void), inputFileRef: MutableRefObject<HTMLInputElement | null>) {
  setLoadingAPICall(true);

  if (inputFileRef === null || inputFileRef.current === null || inputFileRef.current.files === null || inputFileRef.current.files.length === 0) {
    return;
  }

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

  return {
    upload: await fetch(url, {
      method: 'POST',
      body: formData,
    }), fields: fields, url: url + filename
  };
};