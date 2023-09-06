// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import createDBEntry from '@/utils/api/db/createDBEntry';
import updateDBEntryArray from '@/utils/api/db/updateDBEntryArray';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { TwitterApi } from 'twitter-api-v2';
import { authOptions } from '../auth/[...nextauth]';
import getDBEntry from '@/utils/api/db/getDBEntry';



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

    let { xHandle } = req.body

    if(xHandle === undefined || xHandle === null){
      return res.status(400).json({
        error: {
          code: "no-access",
          message: "You are not signed in.",
        },
      });
    }else{
      if(xHandle[0].includes('@')){
        xHandle = xHandle.substring(1)
      }
    }


    const twitterClient = new TwitterApi(process.env.TWITTER_BEARER as string);
    const readOnlyClient = twitterClient.readOnly;

    const user = await readOnlyClient.v2.userByUsername(xHandle);
    let tweets = await readOnlyClient.v2.userTimeline(user.data.id);
    let tweetsF = tweets.data.data.map((tweet: any) => { return tweet.text });

    let context = await getDBEntry("userContexts", ['email'], ['=='], [session.user.email], 1)
    if (context.length <= 0) {
      context = await createDBEntry("userContexts", { email: session.user.email });
    }
    else {
      context = context[0]
    }

    const xAccount = await createDBEntry("userXHandles", { xHandle: xHandle, contextId: context.id, posts: tweetsF });
    await updateDBEntryArray("userContexts", xAccount.id, 'xHandles', ['email'], '==', [session.user.email], 1);

    console.log(tweetsF)
    if(tweetsF === undefined || tweetsF === null){
      tweetsF = []
    }

    res.status(200).json({ data: tweetsF })

  } catch (e: any) {
    console.log(e)
    console.log("tweetsF")
    return res.status(400).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }
}

