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
import * as cheerio from 'cheerio';
import { Url } from 'slack-block-builder/dist/methods';
const { sitemapUrlScraper } = require("xml-sitemap-url-scraper");

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const sitemapUrls = ["sitemap.xml", "sitemap_index.xml", "sitemap/"]
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let { url } = req.body
    
    if (url.indexOf("http") === -1 && url.indexOf("https") === -1 && url.indexOf("www") === -1) {
      console.log("no url")
      url = `https://${url}`
    }
    console.log({ url })

    if (!new URL(url)) {
      res.status(400).json({ error: "Invalid URL" })
    }

    url = new URL(url).origin

    let urlsWithSitemap: string[] = []

    let found = false;
    for (let index = 0; index < sitemapUrls.length; index++) {
      await axios.get(`${url}/${sitemapUrls[index]}`).then((response) => {
        if (response.status === 200) {
          urlsWithSitemap.push(`${url}/${sitemapUrls[index]}`)
          found = true;
        }
      }).catch((error) => {
      });
      if (found) {
        break;
      }
    }

    let concurrency = 5;

    let urls = await sitemapUrlScraper(urlsWithSitemap, concurrency);

    for (let i = 0; i < urls.length; i++) {
      urls[i] = urls[i].replaceAll("\r\n", "").trim()
    }

    console.log({ urls })

    res.status(200).json({ siteContent: urls, success: true })
  } catch (error) {
    console.log({ error })
    res.status(400).json({ error, success: false })
  }

}
