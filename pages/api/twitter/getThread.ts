// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { Client, types } from "twitter-api-sdk";
import { time } from "console";

const REQUIRED_TWEET_FIELDS: types.components['parameters']['TweetFieldsParameter'] =
    ['conversation_id', 'author_id', 'created_at', 'in_reply_to_user_id'];
export interface QueryOptions {
    /** A comma separated list of Tweet fields to display. */
    'tweet.fields'?: types.components['parameters']['TweetFieldsParameter'];
    /** A comma separated list of fields to expand. */
    expansions?: types.components['parameters']['TweetExpansionsParameter'];
    /** A comma separated list of Media fields to display. */
    'media.fields'?: types.components['parameters']['MediaFieldsParameter'];
    /** A comma separated list of Poll fields to display. */
    'poll.fields'?: types.components['parameters']['PollFieldsParameter'];
    /** A comma separated list of User fields to display. */
    'user.fields'?: types.components['parameters']['UserFieldsParameter'];
    /** A comma separated list of Place fields to display. */
    'place.fields'?: types.components['parameters']['PlaceFieldsParameter'];
}

type Tweet = types.components['schemas']['Tweet'];

function getOptions(options?: QueryOptions): QueryOptions {
    if (!options) {
        // New options if non were passed
        options = {
            'tweet.fields': REQUIRED_TWEET_FIELDS,
        };
    } else if (!options['tweet.fields']) {
        // Add tweet fields option if wasn't in passed options
        options['tweet.fields'] = REQUIRED_TWEET_FIELDS;
    } else {
        // Supplement required tweet fields if not present
        for (const tweetField of REQUIRED_TWEET_FIELDS) {
            if (!options['tweet.fields'].some(x => x === tweetField)) {
                options['tweet.fields'].push(tweetField);
            }
        }
    }

    return options;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const session = await getServerSession(req, res, authOptions);

        let id = JSON.parse(req.body).id;
        console.log(id)
        if (id.split('status/').length < 1) {

            console.log("Wrong URL");
            res.status(400).end();
            return;
        }
        id = id.split('status/')[1];
        if (
            session === null ||
            session === undefined ||
            session.user === null ||
            session.user === undefined
        ) {
            console.log("Missing session error");
            res.status(400).end();
            return;
        }

        const client = new Client(process.env.TWITTER_BEARER as string);


        const completeOptions = getOptions(undefined);
        const tweet = await client.tweets.findTweetById(id, completeOptions);
        
        console.log(tweet)
        const userId = tweet.data?.author_id as string;
        const startDate = tweet.data?.created_at as string;
        const conversationId = tweet.data?.conversation_id as string;
        const date = new Date(startDate);
        date.setDate(date.getDate() + 10);
        let endDate = date.toISOString();
        console.log(date)
        console.log(endDate)
        const timelineOptions: types.operations['usersIdTimeline']['parameters']['query'] =
        {
            start_time: startDate,
            end_time: endDate,
            max_results: 100,
            'tweet.fields': completeOptions['tweet.fields'],
            expansions: completeOptions['expansions'],
            'media.fields': completeOptions['media.fields'],
            'poll.fields': completeOptions['poll.fields'],
            'user.fields': completeOptions['user.fields'],
            'place.fields': completeOptions['place.fields'],
        };


        const timeline = client.tweets.usersIdTweets(userId, timelineOptions);
        let tweets: Tweet[] = [];
        for await (const page of timeline) {
            if (!page.data) {
                continue;
            }
            page.data
                .filter(
                    x =>
                        // First tweet it thread
                        x.id === id ||
                        // Or subsequent tweets in thread
                        (x.conversation_id === conversationId &&
                            x.in_reply_to_user_id === userId)
                )
                .forEach(x => tweets.push(x));
        }
        let tweetsT = tweets.map(e => e.text.replace("\n", ""));
        for (var i = 0; i < tweetsT.length; i++) {
            tweetsT[i] = tweetsT[i].replace("\n", "");
        }

        if (tweetsT.length > 0) {
            return res.status(200).json({
                content: tweetsT.reverse(),
                success: true,
            });
        } else {
            return res.status(400).json({
                content: [""],
                success: false,
            });
        }


    } catch (e: any) {
        console.log(e);
        return res.status(400).json({
            content: e.data.errors[0].message !== undefined ? e.data.errors[0].message : "error",
            success: false,
        } as {
            name: string;
            content: string;
            success: boolean;
        });
    }
}
