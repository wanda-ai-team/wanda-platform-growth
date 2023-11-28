// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import formidable from "formidable";
import mime from 'mime';
import e from 'express';

export const config = {
    api: {
        bodyParser: false,
        sizeLimit: '2000mb',
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
        const customOptions = { maxFileSize: 300 * 1024 * 1024 };

        const form = new formidable.IncomingForm(customOptions);
        const files: ProcessedFiles = [];
        form.on('file', (field, file: any) => {
            files.push([field, file]);
        })
        form.on('end', () => resolve(files));
        form.on('error', (err: any) => reject(err));
        form.parse(req, () => {
            //
        });
    }).catch(e => {
        console.log(e);
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
        let count = 1;
        let data2 = "";
        let value = buff.length / 25000000;

        if (value > 1) {
            do {
                let buffN = buff.subarray(count * 25000000, ((value - count >= 1) ? count + 1 : (value)) * 25000000)
                const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
                const formData = new FormData()
                const formData1 = new Headers()

                const abc = await new File([buffN], 'abc.mp3', { type: 'audio/mp3' });
                formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY);
                formData.set('model', 'whisper-1');
                formData.set('file', abc);

                const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 });
                const resW = await response.json();
                data2 += (resW as { text: '' }).text;
                count++;
            } while (value > count)
        } else {
            let buffN = buff.subarray(0, (value) * 25000000)

            const httpbin = 'https://api.openai.com/v1/audio/transcriptions'
            const formData = new FormData()
            const formData1 = new Headers()

            const abc = new File([buffN], 'abc.mp3', { type: 'audio/mp3' });

            formData1.set('Authorization', "Bearer " + process.env.OPENAI_API_KEY);
            formData.set('model', 'whisper-1');
            formData.set('file', abc);

            const response = await fetch(httpbin, { method: 'POST', body: formData, headers: formData1 });
            const resW = await response.json();
            data2 += (resW as { text: '' }).text;
        }


        // const fileB = data.files..on('finish', function () {
        //     //get a blob you can do whatever you like with
        //     return stream.toBlob('application/pdf');
        //    });


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
