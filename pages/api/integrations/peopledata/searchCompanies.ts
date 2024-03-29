import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import PDLJS from 'peopledatalabs';
import getDBEntry from "@/utils/api/db/getDBEntry";
import { IFTTTWebhook } from "langchain/tools";

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

        // Create a client, specifying your API key
        const PDLJSClient = new PDLJS({ apiKey: process.env.PEOPLE_DATA_LABS_API_KEY as string });

        // Create an SQL query

        let ICPInfo = await getDBEntry("userICP", ["email"], ["=="], [session.user.email], 1);
        ICPInfo = ICPInfo[0].data;

        console.log(ICPInfo);

        let sqlQuery = `SELECT * FROM company WHERE `;


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
        // }



        console.log(sqlQuery);
        return res.status(200).json({
            status: 200, data: [
                {
                    name: 'kerr mcgee chemical',
                    display_name: 'Kerr McGee Chemical',
                    size: '10001+',
                    employee_count: 2,
                    id: 'kerr-mcgee-chemical',
                    founded: 1900,
                    industry: 'chemicals',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '11437783',
                    linkedin_url: 'linkedin.com/company/kerr-mcgee-chemical',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: null,
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'kerr mcgee is an oil & gas and specialty materials company, headquartered in oklahoma city, ok',
                    tags: null,
                    headline: 'Kerr McGee is a $20 Billion Oil & Gas Company; its chemical division, the leader in manufacturing of titanium dioxide.',
                    alternative_names: [Array],
                    alternative_domains: [],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'newell rubbermaid',
                    display_name: 'Newell Rubbermaid',
                    size: '10001+',
                    employee_count: 11,
                    id: 'newell-rubbermaid',
                    founded: null,
                    industry: 'consumer goods',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: null,
                    linkedin_url: 'linkedin.com/company/newell-rubbermaid',
                    facebook_url: 'facebook.com/newellrubbermaid',
                    twitter_url: 'twitter.com/nwlrubbermaid',
                    profiles: [Array],
                    website: null,
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'newell rubbermaid is a global marketer of consumer and professional products that touch the lives of people where they live, learn and work. we are committed to building brands that matter in the lives of the users of our products. we are also committed to leveraging the scale of our company to bring the power of a multi-billion dollar business to bear on each of the business segments through shared expertise, operating efficiencies, and a culture of innovation. our global sales are approximately $6 billion and we have a strong portfolio of globally recognized brands including sharpie, paper mate, dymo, expo, waterman, parker, irwin, lenox, rubbermaid, graco, calphalon, goody, levolor, kirsch and teutonia. we are headquartered in atlanta, georgia.',
                    tags: [Array],
                    headline: null,
                    alternative_names: [],
                    alternative_domains: [],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'bp chemicals',
                    display_name: 'BP Chemicals',
                    size: '10001+',
                    employee_count: 18,
                    id: 'bp-chemicals',
                    founded: null,
                    industry: 'chemicals',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '1390',
                    linkedin_url: 'linkedin.com/company/bp-chemicals',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: null,
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'learn about working at bp chemicals. join linkedin today for free. see who you know at bp chemicals, leverage your professional network, and get hired.',
                    tags: null,
                    headline: null,
                    alternative_names: [Array],
                    alternative_domains: [Array],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'pfister faucets',
                    display_name: 'Pfister Faucets',
                    size: '10001+',
                    employee_count: 14,
                    id: 'pfister-faucets',
                    founded: 1910,
                    industry: 'consumer goods',
                    naics: [Array],
                    sic: [Array],
                    location: [Object],
                    linkedin_id: '40882323',
                    linkedin_url: 'linkedin.com/company/pfister-faucets',
                    facebook_url: 'facebook.com/bv_rr_pfister',
                    twitter_url: 'twitter.com/pfisterfaucets',
                    profiles: [Array],
                    website: 'pfisterfaucets.com',
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: "we're faucet people. we’ve been making plumbing fixtures for over 100 years, so we know a few things about how to get water right where you want it. we were the first to market a lot of innovations that are standard today, and we have the awards to show for it. but the whole regular people thing is the true key to our success. because faucets are a part of our real, everyday lives, just like they're part of yours.",
                    tags: [Array],
                    headline: 'Faucets are a part of our real, everyday lives, just like they’re part of yours.',
                    alternative_names: [Array],
                    alternative_domains: [],
                    affiliated_profiles: [Array],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'lyondellbasell',
                    display_name: 'LyondellBasell',
                    size: '10001+',
                    employee_count: 14,
                    id: 'lyondellbasell-equistar-pipe',
                    founded: null,
                    industry: 'chemicals',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '5733833',
                    linkedin_url: 'linkedin.com/company/lyondellbasell-equistar-pipe',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: null,
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'lyondellbasell is a chemicals company based out of p.o. box 95, mont belvieu, texas, united states.',
                    tags: null,
                    headline: null,
                    alternative_names: [Array],
                    alternative_domains: [Array],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'caddy daddy',
                    display_name: 'CADDY DADDY',
                    size: '10001+',
                    employee_count: 5,
                    id: 'caddy-daddy',
                    founded: null,
                    industry: 'automotive',
                    naics: [Array],
                    sic: [Array],
                    location: [Object],
                    linkedin_id: '16052358',
                    linkedin_url: 'linkedin.com/company/caddy-daddy',
                    facebook_url: 'facebook.com/caddydaddyvintagecadillac',
                    twitter_url: null,
                    profiles: [Array],
                    website: 'caddydaddy.com',
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'throughout the years, caddy daddy has kept up with the demand for quality parts by staying current with the times. we have been selling classic cadillac parts and accessories for over 35 years. caddy daddy presents is a media outlet that documents cadillacs and lifestyles. our goal is to provide people the entertainment and education they wish to see, by creating and sharing original content for all platforms. we also help promote other businesses and non-profits using various marketing solutions.',
                    tags: [Array],
                    headline: 'Quality car parts and entertainment for Cadillac enthusiasts.',
                    alternative_names: [],
                    alternative_domains: [],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'eurofins safer@work™ us',
                    display_name: 'Eurofins SAFER@WORK™ US',
                    size: '10001+',
                    employee_count: 1,
                    id: 'eurofins-safer-at-work-covid-testing',
                    founded: null,
                    industry: 'biotechnology',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '68330509',
                    linkedin_url: 'linkedin.com/company/eurofins-safer-at-work-covid-testing',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: null,
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'as we look to getting back to work, or continuing business as usual, proactive solutions to contribute to the safety of our staff, our customers and indirectly their families is a top priority for all businesses. the eurofins safer@work™ program is designed to help you to set up advanced risk management protocols to contribute to limiting the impact of covid-19 on your workplace. eurofins safer@work™ programs are designed and implemented by our experts and consulting partners, and testing is carried out in eurofins government licensed clinical laboratories, in compliance with local regulations. by combining workplace surfaces and wastewater testing together with risk-based clinical testing, as well as relevant consultative, audit, and assurance services, eurofins safer@work™ programs allow for a focus on human clinical testing where virus presence is likelier. this approach reduces cost and supports health authorities to allocate capacity constrained human covid-19 testing where it is ',
                    tags: [Array],
                    headline: 'Easy, Fast, Reliable COVID-19 testing & monitoring solutions to help you limit the impact of COVID-19 on your business.',
                    alternative_names: [],
                    alternative_domains: [Array],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'ove.com',
                    display_name: 'OVE.com',
                    size: '10001+',
                    employee_count: 25,
                    id: 'ove.com',
                    founded: null,
                    industry: 'automotive',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '16788',
                    linkedin_url: 'linkedin.com/company/ove.com',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: 'ove.com',
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'learn about working at ove.com. join linkedin today for free. see who you know at ove.com, leverage your professional network, and get hired.',
                    tags: null,
                    headline: null,
                    alternative_names: [Array],
                    alternative_domains: [Array],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'caliber collision',
                    display_name: 'Caliber Collision',
                    size: '10001+',
                    employee_count: 4483,
                    id: 'calibercollision',
                    founded: 1997,
                    industry: 'automotive',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '89520',
                    linkedin_url: 'linkedin.com/company/calibercollision',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: 'caliber.com',
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: "like no place you’ve ever worked. at caliber, you have limitless opportunities to drive your career forward and you are empowered to create the roadmap for your future. enjoy a purpose-driven, team-driven culture that supports you to reach your full potential. you’ll be part of a dedicated team and receive mentoring from some of the brightest minds in the industry. when you join our team, you join our dream! join us in delivering on our purpose of restoring the rhythm of your life®. we are proud to offer industry-leading pay and a comprehensive day-one benefits program to ensure you feel as rewarded in your personal life as you do at work. founded in 1997, the caliber portfolio of brands has grown to more than 1,600 centers nationwide and features a full range of complementary automotive services, including caliber collision, one of the nation's largest auto collision repair providers across more than 40 states, caliber auto care for mechanical repair and quick oil change services and ",
                    tags: null,
                    headline: 'Restoring the Rhythm of Your Life®',
                    alternative_names: [Array],
                    alternative_domains: [Array],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                },
                {
                    name: 'fiat chrysler automobiles (fca)',
                    display_name: 'Fiat Chrysler Automobiles (FCA)',
                    size: '10001+',
                    employee_count: 14,
                    id: 'fiat-chrysler-automobiles',
                    founded: 1925,
                    industry: 'automotive',
                    naics: null,
                    sic: null,
                    location: [Object],
                    linkedin_id: '1279115',
                    linkedin_url: 'linkedin.com/company/fiat-chrysler-automobiles',
                    facebook_url: null,
                    twitter_url: null,
                    profiles: [Array],
                    website: null,
                    ticker: null,
                    gics_sector: null,
                    mic_exchange: null,
                    type: 'private',
                    summary: 'chrysler group llc, formed in 2009 to establish a global strategic alliance with fiat s.p.a., designs, engineers, manufactures, distributes and sells vehicles under the chrysler, jeep, dodge, ram and fiat brands, and the srt performance vehicle designation. the company also distributes the alfa romeo 4c and mopar products. with the resources, technology and worldwide distribution network required to compete on a global scale, the alliance builds on chrysler group’s culture of innovation, first established by walter p. chrysler in 1925, and fiat’s complementary technology that dates back to its founding in 1899. chrysler group became a wholly owned subsidiary of fiat on jan. 21, 2014.\n' +
                        '\n' +
                        " headquartered in auburn hills, michigan, chrysler group’s product lineup features some of the world's most recognizable vehicles, including the chrysler 300 and town & country, jeep wrangler and grand cherokee, dodge challenger and viper srt, ram 1500 and fiat 500. fiat contributes world-class technology",
                    tags: null,
                    headline: null,
                    alternative_names: [],
                    alternative_domains: [Array],
                    affiliated_profiles: [],
                    employee_count_by_country: [Object]
                }
            ],
        });

        // Create a parameters JSON object
        const params = {
            searchQuery: sqlQuery,
            size: 10,
            pretty: true
        }

        // Pass the parameters object to the Company Search API
        PDLJSClient.company.search.sql(params).then((data) => {
            // console.log(data);
            console.log(data);
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