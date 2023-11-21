import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import PDLJS from 'peopledatalabs';
import getDBEntry from "@/utils/api/db/getDBEntry";
import { IFTTTWebhook } from "langchain/tools";
import fsPromises from 'fs/promises';
import path from 'path';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const session = await getServerSession(req, res, authOptions)
        if (!session?.user || !session?.user?.email) {
            return res.status(401).json({
                error: {
                    code: "no-access",
                    message: "You are not signed in.",
                },
            });
        }

        const { companyName } = req.body
        const { jobTitle } = req.body

        // Create a client, specifying your API key
        const PDLJSClient = new PDLJS({ apiKey: process.env.PEOPLE_DATA_LABS_API_KEY as string });

        // Create an SQL query

        let sqlQuery = `SELECT * FROM person WHERE `;


        if (companyName && companyName.length > 0) {
            sqlQuery += `(`
            for (let i = 0; i < companyName.length; i++) {
                sqlQuery += ` job_company_name = '${companyName[i]}'  `;
                if (i != companyName.length - 1) {
                    sqlQuery += ` OR `;
                }
            }
            sqlQuery += `)`;
        }

        if (jobTitle && jobTitle.length > 0) {

            sqlQuery += companyName ? ` AND (` : `(`;
            for (let i = 0; i < jobTitle.length; i++) {
                sqlQuery += ` job_title = '${jobTitle[i]}'  `;
                if (i != jobTitle.length - 1) {
                    sqlQuery += ` OR `;
                }
            }
            sqlQuery += `)`;
        }

        
        const dataFilePath = path.join('./', 'userData.json');
        const jsonData = await fsPromises.readFile(dataFilePath);
        return res.status(200).json(JSON.parse(jsonData.toString()));

        // Create a parameters JSON object
        const params = {
            dataset: "email",
            searchQuery: sqlQuery,
            size: 10,
            pretty: true
        }

        // Pass the parameters object to the Company Search API
        PDLJSClient.person.search.sql(params).then(async (data) => {
            // console.log(data);
            // console.log(data);
            // console.log(JSON.stringify(data));
            // const dataFilePath = path.join('./', 'userData.json');
            // await fsPromises.writeFile(dataFilePath, JSON.stringify(data));
            return res.status(200).json(data);
        }).catch((error) => {
            console.log(error);
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: {
                code: "server-error",
                message: "Something went wrong.",
            },
        });
    }
}