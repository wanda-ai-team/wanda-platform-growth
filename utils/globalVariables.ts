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
    { platform: 'Landing Page', outputs: ['Copy']}, 
    { platform: 'Linkedin', outputs: ['Post'] },
    { platform: 'Blog', outputs: ['Post', 'Article'] },
    { platform: 'Transcript', outputs: ['Transcript'] },
    { platform: 'Summary', outputs: ['Summary'] }
];

const slackModalOutputPlatform = [
    { platform: 'Twitter Thread', outputs: ['Thread'] },
    // { platform: 'Instagram', outputs: ['Carousel', 'Post'] },
    { platform: 'Landing Page Copy', outputs: ['Copy']}, 
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

export {
    userCollection,
    automationCollection,
    customPromptsCollection,
    toneList,
    writingStyles,
    outputsWithPlatform,
    pagesWithoutHeader,
    platformsToGenerateIdeas,
    slackModalOutputPlatform
}