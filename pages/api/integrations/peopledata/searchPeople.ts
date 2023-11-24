import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import PDLJS from 'peopledatalabs';
import getDBEntry from "@/utils/api/db/getDBEntry";
import { IFTTTWebhook } from "langchain/tools";
import fsPromises from 'fs/promises';
import path from 'path';
import updateDBEntry from "@/utils/api/db/updateDBEntry";

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

        const { companiesNames } = req.body
        const { jobTitle } = req.body
        const { getOldPeople } = req.body

        if (getOldPeople) {
            const userICPs = await getDBEntry("userICP", ["email"], ["=="], [session.user.email], 1);
            return res.status(200).json({ status: 200, data: JSON.parse(userICPs[0].data.peopleList) });
        }


        // Create a client, specifying your API key
        const PDLJSClient = new PDLJS({ apiKey: process.env.PEOPLE_DATA_LABS_API_KEY as string });

        // Create an SQL query


        let ICPInfo = await getDBEntry("userICP", ["email"], ["=="], [session.user.email], 1);
        ICPInfo = ICPInfo[0].data;

        let sqlQuery = `SELECT * FROM person WHERE `;


        if (companiesNames && companiesNames.length > 0) {
            sqlQuery += `(`
            for (let i = 0; i < companiesNames.length; i++) {
                sqlQuery += ` job_company_name = '${companiesNames[i]}'  `;
                if (i != companiesNames.length - 1) {
                    sqlQuery += ` OR `;
                }
            }
            sqlQuery += `)`;
        }

        if (ICPInfo.jobPersona && ICPInfo.jobPersona.length > 0) {
            sqlQuery += companiesNames ? ` AND (` : `(`;
            for (let i = 0; i < ICPInfo.jobPersona.length; i++) {
                sqlQuery += ` job_title = '${ICPInfo.jobPersona[i]}'  `;
                if (i != ICPInfo.jobPersona.length - 1) {
                    sqlQuery += ` OR `;
                }
            }
            sqlQuery += `)`;
        }

        console.log(sqlQuery);

        // const dataFilePath = path.join('./', 'userData.json');
        // const jsonData = await fsPromises.readFile(dataFilePath);
        // const peopleData = JSON.parse(jsonData.toString())
        // await updateDBEntry("userICP", { peopleList: peopleData.data }, ['email'], '==', [session?.user.email], 1);
        // return res.status(200).json(peopleData);

        // Create a parameters JSON object
        const params = {
            dataset: "email",
            searchQuery: sqlQuery,
            size: 3,
            pretty: true,
        }

        // Pass the parameters object to the Company Search API
        await PDLJSClient.person.search.sql(params).then(async (data) => {
            console.log(data);
            await updateDBEntry("userICP", { peopleList: data.data }, ['email'], '==', [session?.user.email], 1);
            // console.log(data);
            // console.log(data);
            // console.log(JSON.stringify(data));
            // const dataFilePath = path.join('./', 'userData.json');
            // await fsPromises.writeFile(dataFilePath, JSON.stringify(data));
            return res.status(200).json(data);
        }).catch((error) => {
            console.log(error);
            return res.status(200).json({ status: 200, data: [] });
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