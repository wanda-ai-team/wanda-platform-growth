import { NextApiRequest, NextApiResponse } from 'next';
import { Storage } from '@google-cloud/storage';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    console.log("ola")
    const storage = new Storage({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.split(String.raw`\n`).join('\n') as string,
        },
    });

    const bucket = storage.bucket("audios-wanda");
    return await configureBucketCors(bucket)
        .then(async () => {
        const file = bucket.file(req.query.file as string);
        const options = {
            expires: Date.now() + 15 * 60 * 1000, //  1 minute,
            fields: { 'x-goog-meta-test': 'data', 'success_action_status': '201' },
            
        };

        const [response] = await file.generateSignedPostPolicyV4(options);
    
        res.status(200).json(response);
    });
}

async function configureBucketCors(bucket: any) {
    await bucket.setCorsConfiguration([
        {
            "origin": ["*"],
            "method": ["GET","POST","HEAD","DELETE", "PUT"],
            "maxAgeSeconds": 3600,
            "responseHeader": ["Content-Type", "access-control-allow-origin", "access-control-allow-header"]
        }
    ]);
}