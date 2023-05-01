// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch, {
    FormData,
    File,
} from 'node-fetch'
import fs from 'fs';
import formidable from "formidable";
import mime from 'mime';

export const config = {
    api: {
        bodyParser: false,
    },
};


type ProcessedFiles = Array<[string, File]>;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    let status = 200,
        resultBody = { status: 'ok', message: 'Files were uploaded successfully' };

    const files = await new Promise<ProcessedFiles | undefined>((resolve, reject) => {
        const customOptions = {maxFileSize: 300 * 1024 * 1024 };

        const form = new formidable.IncomingForm(customOptions);
        const files: ProcessedFiles = [];
        console.log("ola")
        form.on('file',  (field, file: any) => {
            files.push([field, file]);
        })
        form.on('end', () => resolve(files));
        form.on('error', (err: any) => reject(err));
        form.parse(req, () => {
            //
        });
    }).catch(e => {
        console.log(e);
        console.log("ola2")
        status = 500;
        resultBody = {
            status: 'fail', message: 'Upload error'
        }
    });
    if (files?.length) {


        // console.log("data")
        // const data = await new Promise(function (resolve, reject) {
        //     const form = new formidable.IncomingForm({ keepExtensions: true });
        //     form.parse(req, function (err: any, fields: any, files: any) {
        //         if (err) return reject(err);
        //         resolve({ fields, files });
        //     });
        // });

        // const file = data.fields.media;
        // let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
        // console.log(url)

        // console.log(JSON.stringify(data.fields.media))
        // console.log(data.fields)
        let rawData = fs.readFileSync((files[0][1] as any).filepath)
        let buff = Buffer.from(rawData); // Node.js Buffer
        buff = buff.subarray(0, 24000000)
        console.log(buff)

        var audioBlob = new Blob([buff], { type: 'audio/mp3' });
        console.log(audioBlob)

        // const fileB = data.files..on('finish', function () {
        //     //get a blob you can do whatever you like with
        //     return stream.toBlob('application/pdf');
        //    });

        let data2 = "";
        const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
        const formData = new FormData()
        const formData1 = new Headers()

        const abc = new File([buff], 'abc.mp3', { type: 'audio/mp3' });

        formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY);
        formData.set('model', 'whisper-1');
        formData.set('file', abc);

        const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 });
        const resW = await response.json();
        console.log(resW);
        data2 = (resW as { text: '' }).text;

        if (data2 === undefined || data2 === null || data2 === "") {
            return res.status(400).json({
                content: "",
                success: false,
            });
        } else {

            return res.status(200).json({
                content: data2,
                success: true,
            });
        }
    } else {
        return res.status(400).json({
            content: "",
            success: false,
        });

    }
}
