import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import PDLJS from 'peopledatalabs';
import { checkIfTokenNeedsRefresh } from "@/utils/common/integrations/hubspot/checkIfTokenNeedsRefresh";
import { refreshToken } from "@/utils/common/integrations/hubspot/refreshToken";
import { Client } from "@hubspot/api-client";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { gmail_v1 } from "googleapis";

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


        if (await checkIfTokenNeedsRefresh(session.user.email)) {
            await refreshToken(session.user.email);
        }

        const { selectedPeople } = req.body;

        if (!selectedPeople || selectedPeople.length <= 0) {
            return res.status(400).json({
                error: {
                    code: "bad-request",
                    message: "Bad request.",
                },
            });
        }


        const user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);

        const hubspotClient = new Client({ accessToken: user[0].data.hubspotAccessToken });

        for (let i = 0; i < selectedPeople.length; i++) {
            const contactObj = {
                properties: {
                    firstname: selectedPeople[i].first_name !== undefined ? selectedPeople[i].first_name : "",
                    lastname: selectedPeople[i].last_name !== undefined ? selectedPeople[i].last_name : "",
                    email: selectedPeople[i].work_email !== undefined ? selectedPeople[i].work_email : "",
                    company: selectedPeople[i].job_company_name !== undefined ? selectedPeople[i].job_company_name : "",
                },
            }

            try {
                await hubspotClient.crm.contacts.basicApi.create(contactObj as any);
            } catch (e: any) {
                if (e.body !== undefined && e.body.message !== undefined) {
                    if (e.body.message.includes("Contact already exists")) {
                        const contactId = e.body.message.split("ID:")[1].trim();
                        await hubspotClient.crm.contacts.basicApi.update(contactId, contactObj as any)
                    }
                }
            }

            try {
                const response = await fetch("https://api.hubapi.com/marketing-emails/v1/emails", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        "name": "My first API marketing email!",
                        "subject": "Sample subject line"
                    })
                })
            } catch (e) {
                console.log(e);
            }
        }

        return res.status(200).json({
            content: "createContactResponse",
            success: true
        });
    } catch (e) {
        console.log("error");
        console.log(e);
        return res.status(500).json({
            error: {
                code: "server-error",
                message: "Something went wrong.",
            },
        });
    }
}