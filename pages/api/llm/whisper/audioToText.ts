// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ButtonGroup } from "@chakra-ui/react";
import type { NextApiRequest, NextApiResponse } from "next";
const getPodcastFromFeed = require("podparse")
var xml2js = require('xml2js');
var https = require('https');

const findAllNodes = (node: { children: any[]; }, elName: any) => node.children.filter(({ name }) => elName === name);

const findNode = (node: { children: any[]; }, elName: any) => node.children.find(({ name }) => elName === name);

const findNodeOrThrow = (node: any, elName: any) => {
    const child = findNode(node, elName);
    if (!child) {
        throw new Error(`Missing required <${elName}> element.`);
    }
    return child;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let data2 = "";

        var parser = new xml2js.Parser();

        parser.on('error', function (err: any) { console.log('Parser error', err); });

        var data = '';

        var datatest: any[] = []


        // await new Promise((resolve) => {
        //     https.get("https://sellersessions.libsyn.com/rss", async function (res: { statusCode: number; on: (arg0: string, arg1: { (data_: any): void; (): void; }) => void; }) {
        //         if (res.statusCode >= 200 && res.statusCode < 400) {
        //             res.on('data', (data_:) => { data += data_.toString(); }
        //             );
        //             res.on('end', function () {
        //                 parser.parseString(data, function (err: any, result: any) {
        //                     data = result.rss.channel[0].item[0].enclosure[0]['$'].url;
        //                     https.get(data.split('?')[0], async function (res: { statusCode: number; on: (arg0: string, arg1: { (data_: any): void; (): void; }) => void; }) {


        //                         res.on('data', (chunk) => {
        //                             datatest.push(chunk);
        //                             console.log(chunk);
        //                         });

        //                         res.on('end', () => {
        //                             //console.log(data)
        //                             var buffer = Buffer.concat(datatest);
        //                             console.log(buffer)
        //                             resolve("");
        //                         });
        //                     });
        //                 });
        //             });
        //         }
        //     });
        // })


        // const podcast = getPodcastFromFeed("https://sellersessions.libsyn.com/rss.xml")

        console.log("data")
        // "My Podcast"

        return res.status(200).json({
            content: data2,
            success: true,
        });
    }


    catch (e: any) {
        console.log(e);
        return res.status(400).json({
            reason: e,
            success: false,
        } as {
            name: string;
            reason: string;
            success: boolean;
        });
    }
}
