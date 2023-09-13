// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import { load } from 'cheerio';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from "openai";
import { getSession } from "next-auth/react"
import { getServerSession } from 'next-auth';
import createDBEntry from '@/utils/api/db/createDBEntry';
import updateDBEntry from '@/utils/api/db/updateDBEntry';
import { authOptions } from '../auth/[...nextauth]';
import getDBEntry from '@/utils/api/db/getDBEntry';
import updateDBEntryArray from '@/utils/api/db/updateDBEntryArray';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  console.log("olaaaa")
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
    let { url } = req.body
    let { businessName } = req.body
    console.log({ url })
    if (url.indexOf("http") === -1 && url.indexOf("https") === -1 && url.indexOf("www") === -1) {
      console.log("no url")
      url = `https://${url}`
    }

    if (!new URL(url)) {
      res.status(400).json({ error: "Invalid URL" })
    }

    const { data } = await axios.get(url)
    const $ = load(data)

    const bodyText: any = []
    let result: string = ""
    const t = $('body').find('h1,h2,h3,h4,h5,h6,p,a').text()

    $($('body').find('h1,h2,h3,h4,h5,h6,p,a')).each(function (index, element) {
      bodyText.push($(element).text())
    });

    result = bodyText.join('\n\n')

    const openAIResult = await getOpenAIAnswer(result.substring(0, 1000))



    // const context = await addContext({ email: session.user?.email })

    let context = await getDBEntry("userContexts", ['email'], ['=='], [session.user.email], 1)
    if (context.length <= 0) {
      context = await createDBEntry("userContexts", { email: session.user.email });
    }
    else {
      context = context[0]
    }

    const site = await createDBEntry("userSites", { url: url, product: openAIResult.product, target_audience: openAIResult.target_audience, contextId: context.id, businessName: businessName, email: session.user.email });
    await updateDBEntryArray("userContexts", site.id, 'sites', ['email'], '==', [session.user.email], 1);

    await updateDBEntry("users", { context: context.id }, ['email'], '==', [session.user.email], 1);

    // await addSite({ url: url, product: openAIResult.product, target_audience: openAIResult.target_audience, contextId: context.id })

    res.status(200).json({ data: openAIResult, siteContent: result })
  } catch (error) {
    console.log({ error })
    res.status(400).json({ error })
  }

}

const getOpenAIAnswer = async (context: string) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    messages: [{
      role: "system", content: "You are a senior marketing expert at a SaaS company. Only respond in JSON format.",
    }, {
      role: "user", content: `This is the copy of a landing page for a product: ${context}. Write a short description of the product and the target audience in the space below.
      Don't forget to always put product descriptions and target audiences.
    Provide a RFC8259 compliant JSON response following this format without deviation.
    {"product": "product description", "target_audience": "target audience of the product: ${context}"}`
    }],
  });
  const result = completion.data.choices[0].message?.content || "No results"


  try {
    const parsedResult: any = JSON.parse(result)

    return parsedResult
  } catch (error) {
    console.log({ error })
    return result
  }
}
