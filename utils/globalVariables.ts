const userCollection = "users";
const documentCollection = "documents";
const automationCollection = "autoRepos";
const customPromptsCollection = "customPrompts";


const toneList = [
    "Default",
    "Authoritative",
    "Caring",
    "Casual",
    "Cheerful",
    "Coarse",
    "Conservative",
    "Conversational",
    "Creative",
    "Dry",
    "Edgy",
    "Enthusiastic",
    "Expository",
    "Formal",
    "Frank",
    "Friendly",
    "Fun",
    "Funny",
    "Humorous",
    "Informative",
    "Irreverent",
    "Journalistic",
    "Matter of fact",
    "Nostalgic",
    "Objective",
    "Passionate",
    "Poetic",
    "Playful",
    "Professional",
    "Provocative",
    "Quirky",
    "Respectful",
    "Romantic",
    "Sarcastic",
    "Serious",
    "Smart",
    "Snarky",
    "Subjective",
    "Sympathetic",
    "Trendy",
    "Trustworthy",
    "Unapologetic",
    "Upbeat",
    "Witty"
];

const writingStyles = [
    "Default",
    "Academic",
    "Analytical",
    "Argumentative",
    "Conversational",
    "Creative",
    "Critical",
    "Descriptive",
    "Epigrammatic",
    "Epistolary",
    "Expository",
    "Informative",
    "Instructive",
    "Journalistic",
    "Metaphorical",
    "Narrative",
    "Persuasive",
    "Poetic",
    "Satirical",
    "Technical"
];

const outputsWithPlatform = [
    { platform: 'Twitter', outputs: ['Thread'] },
    // { platform: 'Instagram', outputs: ['Carousel', 'Post'] },
    // { platform: 'Landing Page', outputs: ['Copy'] },
    { platform: 'Linkedin', outputs: ['Post'] },
    { platform: 'Blog', outputs: ['Post'] },
    // { platform: 'Email', outputs: ['Follow-up'] },
    { platform: 'Transcript', outputs: ['Transcript'] },
    { platform: 'Summary', outputs: ['Summary'] }
];

const slackModalOutputPlatform = [
    { platform: 'Twitter Thread', outputs: ['Thread'] },
    // { platform: 'Instagram', outputs: ['Carousel', 'Post'] },
    { platform: 'Landing Page Copy', outputs: ['Copy'] },
    { platform: 'Linkedin Post', outputs: ['Post'] },
    { platform: 'Blog Post', outputs: ['Post', 'Article'] },
];

const platformsToGenerateIdeas = [
    "Twitter",
    "Blog",
];

const pagesWithoutHeader = [
    "/login",
    "/signup",
    "/payment",
    "/auth/gong",
    "/auth/slack",
];

const industriesICP = [
    "Aerospace & Defense",
    "Air Freight & Logistics",
    "Airlines",
    "Automotive",
    "Banks",
    "Beverages",
    "Biotechnology",
    "Building Materials",
    "Capital Goods",
    "Capital Markets",
    "Chemicals",
    "Commercial Services & Supplies",
    "Communications Equipment",
    "Construction & Engineering",
    "Consumer Discretionary",
    "Consumer Goods",
    "Consumer Services",
    "Consumer Staples",
    "Containers & Packaging",
    "Distributors",
    "Diversified Consumer Services",
    "Diversified Financial Services",
    "Diversified Telecommunication Services",
    "Education Services",
    "Electric Utilities",
    "Electrical Equipment",
    "Electronic Equipment, Instruments & Components",
    "Family Services",
    "Food & Staples Retailing",
    "Food Products",
    "Gas Utilities",
    "Health Care Equipment & Supplies",
    "Health Care Providers & Services",
    "Hotels, Restaurants & Leisure",
    "Household Durables",
    "Industrial Conglomerates",
    "Industrials",
    "Insurance",
    "Internet Software & Services",
    "IT Services",
    "Leisure Products",
    "Life Sciences Tools & Services",
    "Machinery",
    "Marine",
    "Media",
    "Metals & Mining",
    "Paper & Forest Products",
    "Personal Products",
    "Pharmaceuticals",
    "Professional Services",
    "Real Estate",
    "Renewable Electricity",
    "Retailing",
    "Road & Rail",
    "Semiconductors & Semiconductor Equipment",
    "Specialized Consumer Services",
    "Specialty Retail",
    "Technology Hardware, Storage & Peripherals",
    "Textiles, Apparel & Luxury Goods",
    "Tobacco",
    "Trading Companies & Distributors",
    "Transportation",
    "Utilities",
    "Wireless Telecommunication Services"
];

const employsICP = [
    "1-10",
    "11-50",
    "51-250",
    "251-1K",
    "1K-5K",
    "5K-10K",
    "10K-50K",
    "50K-100K",
    "100K+"
]

const businessModelICP = [
    "B2B",
    "B2C"
]

const countriesICP = [
    "Afghanistan",
    "Aland Islands",
    "Albania",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia, Plurinational State of",
    "Bonaire, Sint Eustatius and Saba",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "British Indian Ocean Territory",
    "Brunei Durussalam",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cape Verde",
    "Cayman Islands",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Cocos (Keeling) Islands",
    "Colombia",
    "Comoros",
    "Congo",
    "Congo, the Democratic Republic of the",
    "Cook Islands",
    "Costa Rica",
    "Cote d'Ivoire",
    "Croatia",
    "Cuba",
    "Curaçao",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Falkland Islands (Malvinas)",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "French Polynesia",
    "French Southern Territories",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guadeloupe",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Holy See",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran, Islamic Republic of",
    "Iraq",
    "Ireland",
    "Isle of Man",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, Democratic People's Republic of",
    "Korea, Republic of",
    "Kuwait",
    "Kyrgyzstan",
    "Lao People's Democratic Republic",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macao",
    "Macedonia, the former Yugoslav Republic of",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Martinique",
    "Mauritania",
    "Mauritius",
    "Mayotte",
    "Mexico",
    "Micronesia (Federated States of)",
    "Moldova, Republic of",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Niue",
    "Norfolk Island",
    "Northern Mariana Islands",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Pitcairn",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Reunion",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Barthélemy",
    "Saint Helena, Ascension and Tristan da Cunha",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Martin (French part)",
    "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Sint Maarten",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Svalbard and Jan Mayen",
    "Sweden",
    "Switzerland",
    "Syrian Arab Republic",
    "Taiwan",
    "Tajikistan",
    "Tanzania, the United Republic of",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks and Caicos Islands",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela, Bolivarian Republic of",
    "Vietnam",
    "Virgin Islands (U.S.)",
    "Virgin Islands, British",
    "Wallis and Futuna",
    "Western Sahara",
    "Yemen",
    "Zambia",
    "Zimbabwe"
];

const fundingRaisedICP = [
    "$0-$1M",
    "$1M-$10M",
    "$10M-$50M",
    "$50M-$100M",
    "$100M+"
]

const companyTypeICP = [
    "education",
    "government",
    "non-profit",
    "private",
    "public"
]

const techUsedICP = [
    "1&1 Hosting",
    "3d Cart",
    "Acquia",
    "Acquisio",
    "Act On",
    "Action Network",
    "Active Demand",
    "Activecampaign",
    "Add To Any",
    "Adform Advertiser",
    "Admeld",
    "Adobe Business Catalyst",
    "Adobe Connect",
    "Adobe Dynamic Tag Management",
    "Adobe Experience Manager",
    "Adobe Marketing Cloud",
    "ADP",
    "AdRoll",
    "Adscale",
    "Aggregate Knowledge",
    "Airbrake",
    "Akamai",
    "Akamai DNS",
    "Alexa",
    "Algolia",
    "Alteryx",
    "Altocloud",
    "Amazon Associates",
    "Amazon Payments",
    "Amazon S3",
    "Amazon Simple Email Service",
    "amCharts",
    "Amplitude",
    "Android",
    "Apache",
    "Apache Apex",
    "Apache Cassandra",
    "Apache Hadoop",
    "Apache Http Server",
    "Apache Kafka",
    "Apache Maven",
    "Apache Nifi",
    "Apache Spark",
    "Apache Storm",
    "Apache Tomcat",
    "App Nexus",
    "Appboy",
    "Appcues",
    "AppDynamics",
    "Appier",
    "Applepay",
    "Appnexus",
    "Apteligent",
    "ASP.Net",
    "Atlassian Confluence",
    "Atlassian Crowd",
    "Atlassian Crucible",
    "Atlassian Fisheye",
    "Atlassian Jira",
    "Attraqt",
    "Attribution",
    "Authorizenet",
    "Autopilot",
    "Aweber",
    "AWS Cloudwatch",
    "AWS Dynamodb",
    "Amazon Web Services",
    "AWS IAM",
    "AWS Kinesis",
    "AWS Lambda",
    "AWS Redshift",
    "Route 53",
    "Baidu Analytics",
    "Bamboohr",
    "Basecamp",
    "Bazaarvoice",
    "Benchmarkemail",
    "Big Cartel",
    "Bigcommerce",
    "Bing Ads",
    "Bing Advertiser",
    "Bing Maps",
    "Bloomreach",
    "Bluehost Hosting",
    "Bluekai",
    "Bold Commerce",
    "Braintree",
    "Branch",
    "Image and Video Services",
    "Bronto",
    "Bug Herd",
    "Bugsnag",
    "C3 Metrics",
    "Callrail",
    "Calq",
    "Campaignmonitor",
    "Castle",
    "CentOS",
    "Ceridian",
    "Chargify",
    "Chart Beat",
    "Chartio",
    "Chatlio",
    "Chownow",
    "Cision",
    "CJ Affiliate",
    "Classy",
    "Clearslide",
    "ClickFunnels",
    "Clicktale",
    "Clicky",
    "Cloud Flare",
    "Cloudera",
    "Cloudinary",
    "Cludo",
    "Commerce Sciences",
    "Confluence",
    "Constant Contact",
    "Contentful",
    "Contently",
    "Conversio",
    "Convert Kit",
    "Convertro",
    "Convio",
    "Couchbase",
    "Couchdb",
    "Coveo",
    "Crazy Egg",
    "Criteo",
    "Crowdskout",
    "Customer.io",
    "Cyberark",
    "Cybersource",
    "Dailymotion",
    "Datadog",
    "Db2",
    "DC Storm",
    "Debian",
    "Dell Boomi Atomsphere",
    "Demandbase",
    "Demandware",
    "Demandware Analytics",
    "Digital Ocean",
    "Disqus",
    "Django",
    "DNS Made Easy",
    "Dotmailer",
    "DoubleClick Ads",
    "DoubleClick Advertiser",
    "DreamHost Hosting",
    "Drift",
    "Drip",
    "Dropbox",
    "Drupal",
    "Drupal Commerce",
    "Dstillery",
    "Dwolla",
    "Dyn DNS",
    "Dynamic Yield",
    "Dynatrace",
    "Ecwid",
    "ElasticEmail",
    "Elevio",
    "Eloqua",
    "Emarsys",
    "Ember",
    "Emma",
    "Engagio",
    "Entrust",
    "Errorception",
    "Express",
    "Facebook Advertiser",
    "Facebook Beacon",
    "Facebook Comments",
    "Facebook Connect",
    "Facebook Conversion Tracking",
    "Facebook Like Button",
    "Facebook Social Plugins",
    "Facebook Workplace",
    "Factset",
    "Fedora",
    "Filemaker Pro",
    "Flexera Software",
    "Flowplayer",
    "Formstack",
    "FreeBSD",
    "Freshdesk",
    "Fullcontact",
    "Fullstory",
    "FusionCharts",
    "Gauges",
    "Get Response",
    "Get Satisfaction",
    "Gigya",
    "Github",
    "Gitlab",
    "Go Squared",
    "Gocardless",
    "GoDaddy Hosting",
    "Godaddy Nameserver",
    "Goldengate",
    "Goldmine",
    "Google Adsense",
    "Google Adwords",
    "Google Affiliate Network",
    "Google Analytics",
    "Google Apps",
    "Google Charts",
    "Google Cloud",
    "Google Forms",
    "Google Maps",
    "Google_places",
    "Google_remarketing",
    "Google Search Appliance",
    "Google Tag Manager",
    "Google Website Optimizer",
    "Google Widgets",
    "Gotomeeting",
    "Grafana",
    "GraphIQ",
    "Gravity Forms",
    "Greenhouse",
    "GroupBy",
    "Hbase",
    "Heap",
    "Hello Bar",
    "Help Scout",
    "Heroku",
    "Highcharts",
    "Hive",
    "Hootsuite",
    "Hotjar",
    "Hoverowl",
    "HP Servers",
    "HubSpot",
    "IBM Cognos",
    "IBM Infosphere",
    "IBM Infosphere Datastage",
    "IBM Lotus Domino",
    "IBM Lotus Notes",
    "IBM Websphere",
    "IBM Websphere Commerce",
    "Icims",
    "Indicative",
    "Influitive",
    "Informatica",
    "Information Builders",
    "Infusionsoft",
    "Inside Sales",
    "Inspectlet",
    "Instagram",
    "Instagram Links",
    "Instart Logic",
    "Intense Debate",
    "Intercom",
    "Interspire",
    "Invoca",
    "ios",
    "Iponweb Bidswitch",
    "Iterable",
    "Jabmo",
    "Janrain",
    "Jaspersoft",
    "Java",
    "Jha Payment Solutions",
    "Jobvite",
    "Joomla",
    "Justuno",
    "Jw Player",
    "Kaltura",
    "Kapost",
    "Keen IO",
    "Kissmetrics",
    "Klaviyo",
    "Klevu",
    "Knowtify",
    "Kronos",
    "Lawpay",
    "Lead Dyno",
    "Lever",
    "Lightspeed",
    "LinkedIn Advertiser",
    "Linkwithin",
    "Linode Hosting",
    "Litespeed",
    "Live Chat",
    "Livefyre",
    "Liveramp",
    "LKQD",
    "Localytics",
    "Logrocket",
    "Looker",
    "Lucky Orange",
    "Mad Kudu",
    "Madison Logic",
    "Magento",
    "Magento Enterprise",
    "Magento V1",
    "Magento V2",
    "Mailchimp",
    "Mailer Lite",
    "Mailgun",
    "Mailjet",
    "Mandrill",
    "Marchex",
    "Marin",
    "Marketo",
    "Matomo",
    "Mavenlink",
    "Maxmind",
    "Medallia",
    "Media.net",
    "Mediamath",
    "Meltwater",
    "Microsoft Azure",
    "Microsoft Dynamics",
    "Microsoft Exchange Online",
    "Microsoft Office 365",
    "Microsoft Power BI",
    "Microsoft Project",
    "Microsoft Sql Server",
    "Microsoft Team Foundation Server",
    "Microsoft Teams",
    "Microstrategy",
    "Mindbody",
    "Mixpanel",
    "Mode",
    "Mongodb",
    "Monstercommerce",
    "MoonClerk",
    "Mouseflow",
    "Mousestats",
    "mrp",
    "My Site Auditor",
    "Mysql",
    "Namecheap Dns",
    "NationBuilder",
    "Ncr Retail",
    "Neo4J",
    "Netsuite",
    "Netsuite CRM",
    "Netsuite Suitecommerce",
    "Neustar",
]

export {
    userCollection,
    automationCollection,
    customPromptsCollection,
    toneList,
    writingStyles,
    outputsWithPlatform,
    pagesWithoutHeader,
    platformsToGenerateIdeas,
    slackModalOutputPlatform,
    industriesICP,
    employsICP,
    businessModelICP,
    countriesICP,
    fundingRaisedICP,
    companyTypeICP,
    techUsedICP,
}