// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";


const { spawn } = require('child_process');


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {


    var dataToSend: any;
    // spawn new child process to call the python script
    const python = spawn('python', ['../Auto-GPT/autogpt']);
    // collect data from script
    await python.stdout.on('data', function (data: { toString: () => any; }) {
      console.log('Pipe data from python script ...');
      dataToSend = data.toString();
    });
    python.stderr.on('data', (data: { toString: (arg0: string) => any; }) => {
      console.error('stderr: ', data.toString('utf8'));
    })
    // in close event we are sure that stream from child process is closed
    await python.on('close', (code: any) => {
      console.log(`child process close all stdio with code ${code}`);
      // send data to browser
      console.log(dataToSend)
    });
    return res.status(200).json({
      name: "",
      content: "resSummarization !== undefined ? resSummarization.text : ",
      success: true
    })
  } catch (e: any) {
    console.log(e);
    let message =
      e.response.data.message !== undefined ? e.response.data.message : "";
    return res.status(400).json({
      name: "",
      reason: e.response !== undefined ? message : "",
      success: false,
    } as {
      name: string;
      reason: string;
      success: boolean;
    });
  }
}
