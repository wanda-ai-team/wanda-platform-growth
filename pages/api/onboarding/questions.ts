// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import createDBEntry from '@/utils/api/db/createDBEntry';
import updateDBEntryArray from '@/utils/api/db/updateDBEntryArray';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { TwitterApi } from 'twitter-api-v2';
import { authOptions } from '../auth/[...nextauth]';
import getDBEntry from '@/utils/api/db/getDBEntry';
import updateDBEntry from '@/utils/api/db/updateDBEntry';



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const session = await getServerSession(req, res, authOptions)
  // Error handling

  if (!session?.user) {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }

  try {
    const { response1 } = req.body

    let context = await getDBEntry("userContexts", ['email'], ['=='], [session.user.email], 1)

    Object.values(response1).forEach(async (response: any) => {
      if(response.length > 0) {
        if (context.length <= 0) {
          context = await createDBEntry("userContexts", { email: session.user.email, response1: response });
        }
        else {
          await updateDBEntry("userContexts", { response1: response }, ['email'], '==', [session.user.email], 1);
        }

      }
    })

    return res.json({ response1: response1, status: 200})

  } catch (error) {
    console.log({ error })
    return res.json({ error, status: 400 })
  }
}

