import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import PDLJS from 'peopledatalabs';
import getDBEntry from "@/utils/api/db/getDBEntry";
import { IFTTTWebhook } from "langchain/tools";
import createDBEntry from "@/utils/api/db/createDBEntry";
import updateDBEntry from "@/utils/api/db/updateDBEntry";
import fsPromises from 'fs/promises';
import path from "path";

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


        const { getOldCompanies } = req.body
        console.log(getOldCompanies);
        if (getOldCompanies) {
            const userICPs = await getDBEntry("userICP", ["email"], ["=="], [session.user.email], 1);

            return res.status(200).json({ status: 200, data: (userICPs[0].data.companiesList) });
        } else {
            console.log("here");


            // Create a client, specifying your API key
            const PDLJSClient = new PDLJS({ apiKey: process.env.PEOPLE_DATA_LABS_API_KEY as string });

            // Create an SQL query

            let ICPInfo = await getDBEntry("userICP", ["email"], ["=="], [session.user.email], 1);
            ICPInfo = ICPInfo[0].data;

            let sqlQuery = `SELECT * FROM company WHERE `;
            console.log(ICPInfo.companyTypeICP);

            if (ICPInfo.companyTypeICP.length > 0) {
                sqlQuery += `(`
                for (let i = 0; i < ICPInfo.companyTypeICP.length; i++) {
                    sqlQuery += ` type = '${ICPInfo.companyTypeICP[i]}'  `;
                    if (i != ICPInfo.companyTypeICP.length - 1) {
                        sqlQuery += ` OR `;
                    }
                }
                sqlQuery += `)`;
            }

            if (ICPInfo.employsICP.length > 0) {
                sqlQuery += ` AND (`
                for (let i = 0; i < ICPInfo.employsICP.length; i++) {
                    sqlQuery += ` (`
                    sqlQuery += ` employee_count >= '${ICPInfo.employsICP[i].split('-')[0].includes('K') ? ICPInfo.employsICP[i].split('-')[0].replace('K', '') * 1000 : ICPInfo.employsICP[i].split('-')[0].replace('K', '')}'  `;
                    sqlQuery += ` AND `;
                    sqlQuery += ` employee_count <= '${ICPInfo.employsICP[i].split('-')[1].includes('K') ? ICPInfo.employsICP[i].split('-')[1].replace('K', '') * 1000 : ICPInfo.employsICP[i].split('-')[1].replace('K', '')}'  `;
                    sqlQuery += `) `;
                    if (i != ICPInfo.employsICP.length - 1) {
                        sqlQuery += ` OR `;
                    }
                }
                sqlQuery += `)`;
            }

            if (ICPInfo.industriesICP.length > 0) {
                sqlQuery += ` AND (`
                for (let i = 0; i < ICPInfo.industriesICP.length; i++) {
                    sqlQuery += ` industry = '${ICPInfo.industriesICP[i]}'  `;
                    if (i != ICPInfo.industriesICP.length - 1) {
                        sqlQuery += ` OR `;
                    }
                }
                sqlQuery += `)`;
            }

            if (ICPInfo.countriesICP.length > 0) {
                sqlQuery += ` AND (`
                for (let i = 0; i < ICPInfo.countriesICP.length; i++) {
                    sqlQuery += ` location.country = '${ICPInfo.countriesICP[i]}'  `;
                    if (i != ICPInfo.countriesICP.length - 1) {
                        sqlQuery += ` OR `;
                    }
                }
                sqlQuery += `)`;
            }

            // if (ICPInfo.fundingRaisedICP.length > 0) {
            //     sqlQuery += ` AND (`
            //     for (let i = 0; i < ICPInfo.fundingRaisedICP.length; i++) {
            //         sqlQuery += ` (`
            //         sqlQuery += ` total_funding_raised >= '${parseInt(ICPInfo.fundingRaisedICP[i].split('-')[0].replace('$', '').replace('M',''))*1000000}'  `;
            //         sqlQuery += ` AND `;
            //         sqlQuery += ` total_funding_raised <= '${parseInt(ICPInfo.fundingRaisedICP[i].split('-')[1].replace('$', '').replace('M',''))*1000000}'  `;
            //         sqlQuery += `) `;
            //         if (i != ICPInfo.fundingRaisedICP.length - 1) {
            //             sqlQuery += ` OR `;
            //         }
            //     }
            //     sqlQuery += `)`;
            // }~

            const dataFilePath = path.join('./', 'companyData.json');
            const jsonData = await fsPromises.readFile(dataFilePath);
            const companyData = JSON.parse(jsonData.toString())

            console.log(companyData);
            await updateDBEntry("userICP", { companiesList: companyData.data }, ['email'], '==', [session?.user.email], 1);
            return res.status(200).json(companyData);

            // Create a parameters JSON object
            const params = {
                searchQuery: sqlQuery,
                size: 10,
                pretty: true
            }

            // Pass the parameters object to the Company Search API
            await PDLJSClient.company.search.sql(params).then(async (data) => {
                // console.log(data);

                await updateDBEntry("userICP", { companiesList: data.data }, ['email'], '==', [session?.user.email], 1);
                console.log(data);
                return res.status(200).json(data);
            }).catch((error) => {
                console.log(error);
                return res.status(200).json({ status: 200, data: [] });
            });

        }
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