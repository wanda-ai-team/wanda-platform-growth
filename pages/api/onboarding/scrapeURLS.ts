// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import { load } from 'cheerio';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import createDBEntry from '@/utils/api/db/createDBEntry';
import updateDBEntry from '@/utils/api/db/updateDBEntry';
import { authOptions } from '../auth/[...nextauth]';
import getDBEntry from '@/utils/api/db/getDBEntry';
import updateDBEntryArray from '@/utils/api/db/updateDBEntryArray';
import { getOpenAIAnswer } from '@/utils/api/openAI/openAICalls';
import { outputContentBackendCall } from '@/utils/api/backend/backendCalls';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
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
    let { urls } = req.body
    let { businessName } = req.body

    if(!urls || urls.length <= 0){
      res.status(400).json({ error: "No URLs" })
    }

    let result: string = ""
    for (let indexf = 0; indexf < urls.length; indexf++) {
      const { data } = await axios.get(urls[indexf])
      const $ = load(data)
  
      const bodyText: any = []

      $($('body').find('h1,h2,h3,h4,h5,h6,p,span')).each(function (index, element) {
        bodyText.push($(element).text())
      });
  
      result += bodyText.join('\n\n')
      
    }

    
    let responseOpenAI = await outputContentBackendCall(result, "scrape", "")
    responseOpenAI  =responseOpenAI.replace("```json","").replace("```","")
    responseOpenAI = JSON.parse(responseOpenAI)

    // const openAIResult = await getOpenAIAnswer(result.replace(/\n/g, ' ').substring(0, 1000), 'landing-page', false, "")


    // const context = await addContext({ email: session.user?.email })

    let context = await getDBEntry("userContexts", ['email'], ['=='], [session.user.email], 1)
    if (context.length <= 0) {
      context = await createDBEntry("userContexts", { email: session.user.email });
    }
    else {
      context = context[0]
    }

    const site = await createDBEntry("userSites", { url: urls[0], product: responseOpenAI.product, target_audience: responseOpenAI.target_audience, contextId: context.id, businessName: businessName, email: session.user.email });
    await updateDBEntryArray("userContexts", site.id, 'sites', ['email'], '==', [session.user.email], 1);

    await updateDBEntry("users", { context: context.id }, ['email'], '==', [session.user.email], 1);

    // await addSite({ url: url, product: openAIResult.product, target_audience: openAIResult.target_audience, contextId: context.id })


    res.status(200).json({ data: responseOpenAI, siteContent: result, success: true })
  } catch (error) {
    console.log({ error })
    res.status(400).json({ error, success: false })
  }

}
