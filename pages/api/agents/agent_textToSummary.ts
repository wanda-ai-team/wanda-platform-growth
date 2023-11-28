import createDBEntry from "@/utils/api/db/createDBEntry";
import getDBEntry from "@/utils/api/db/getDBEntry";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const textData = req.body.textData;
    const url = req.body.url;
    let summary = [];

    if (url !== "null") {
        summary = await getDBEntry("summaries", ["url"], ["=="], [url], 1);
    }

    if (summary.length > 0) {

        return res.status(200).json({
            name: "",
            content: summary[0].data.summary,
            success: true,
        } as { name: string; content: string; format: string; success: boolean });

    }

    const resultPyVercel = await fetch('https://langchain-py.vercel.app/', {
        headers: {
            "Content-Type": "application/json",
        },
        method: 'POST',
        body: JSON.stringify({
            docsT: textData,
            url: url
        })
    }).then((res) => res.json())

    createDBEntry("summaries", { url: url, summary: resultPyVercel.response })

    return res.status(200).json({
        content: resultPyVercel.response,
        success: true,
    });
}
