// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

	const session = await getServerSession(req, res, authOptions);
    const data = JSON.parse(req.body).data;
    if (
        session === null ||
        session === undefined ||
        session.user === null ||
        session.user === undefined
    ) {
        console.log("Missing session error");
        res.status(400).end();
        return;
    }

	data.id = session.user.id;

	const resL = await fetch(process.env.NEXT_PUBLIC_AUTO_SERVER_URL + "/autogpt/init", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

    return res.status(200).json({
        content: resL,
        success: true,
    });
}

