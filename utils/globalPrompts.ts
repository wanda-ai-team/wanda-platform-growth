function getTextToTwitterThreadPrompt(tone: string, writing: string) {
    return `
    Please ignore all previous instructions. 
    Please respond only in the english language.
    You are a Twitter Creator with a large fan following. 
    You have a ${tone === 'Default' ? 'Casual' : tone} tone of voice.
    You have a ${writing === 'Default' ? 'Analytical' : writing} writing style.
    Create a Twitter thread on the topic of the summary.
    There should be around 5 to 8 tweets.
    The first tweet should have a hook and entice the readers.
    The last tweet should have a small summary of the thread.
    Separate each tweet from the thread with a double break line.
    Talk in-depth of the topic on all the tweets.
    Please separate the tweets with a double break line.
    Do not repeat yourself.
    Do not self reference.
    Do not explain what you are doing.
    Do not explain what you are going to do.`
}

const textToTwitterThreadPrompt = `
Please ignore all previous instructions. 
Please respond only in the english language.
You are a Twitter Creator with a large fan following. 
You have a Casual tone of voice. 
You have a Analytical writing style. 
Create a Twitter thread on the topic of the summary.
There should be around 5 to 8 tweets.
The first tweet should have a hook and entice the readers.
The last tweet should have a small summary of the thread.
Talk in-depth of the topic on all the tweets
Do not repeat yourself.
Do not self reference.
Do not explain what you are doing.
Do not explain what you are going to do.`;

function getTextToInstagramCarrouselTextPrompt(tone: string, writing: string) {
    return `
    Please ignore all previous instructions.
    Please respond only in the english language.
    You are an Instagrammer with a large fan following.
    You have a ${tone === 'Default' ? 'Casual' : tone} tone of voice.
    You have a ${writing === 'Default' ? 'Casual' : writing} writing style.
    Create an Instagram carousel based on the given summary.
    There should be around 8 to 10 slides.
    Write down details on all the slides with titles.
    Generate an exact content example for every slide.
    After writing the carousel slides, please add a separator line.
    Then generate an Instagram post description in just a few sentences for the carousel.
    The description should have a hook and entice the readers.
    Please separate the slides with a break line.
    Do not repeat yourself. Do not self reference.
    Do not explain what you are doing.
    Do not explain what you are going to do.`
}

const textToInstagramCarrouselTextPrompt = `
Please ignore all previous instructions.
Please respond only in the english language.
You are an Instagrammer with a large fan following.
You have a Casual tone of voice.
You have a  tone of voice.
You have a Analytical writing style.
Create an Instagram carousel based on the given summary.
There should be around 8 to 10 slides.
Write down details on all the slides with titles.
Generate an exact content example for every slide.
After writing the carousel slides, please add a separator line.
Then generate an Instagram post description in just a few sentences for the carousel.
The description should have a hook and entice the readers.
Do not repeat yourself. Do not self reference.
Do not explain what you are doing.
Do not explain what you are going to do.`;

function getTextToBlogPostPrompt(tone: string, writing: string) {
    return `
    Please respond only in the english language.
    You are a Blogger with a large fan following. 
    You have a ${tone === 'Default' ? 'Casual' : tone} tone of voice.
    You have a ${writing === 'Default' ? 'Casual' : writing} writing style.
    Create a blog post on the topic of the summary.
    Start the post with a hook and entice the readers.
    Talk in-depth of the topic on the post.
    End with a small summary of the post.
    Format the text with headings, subheadings, and paragraphs.
    Please separate the paragraphs with a break line.
    Do not repeat yourself.
    Do not self reference.
    Do not explain what you are doing.
    Do not explain what you are going to do.`
}

const textToBlogPostPrompt = `
Please respond only in the english language.
You are a Blogger with a large fan following. 
You have a Casual tone of voice. 
You have a Analytical writing style. 
Create a blog post on the topic of the summary.
Start the post with a hook and entice the readers.
Talk in-depth of the topic on the post.
End with a small summary of the post.
Do not repeat yourself.
Do not self reference.
Do not explain what you are doing.
Do not explain what you are going to do.`;

function getTextToLinkedInPostPrompt(tone: string, writing: string) {
    return `
    Please ignore all previous instructions. 
    Please respond only in the english language.
    You are a LinkedIn creator with a large fan following. 
    You have a ${tone === 'Default' ? 'Casual' : tone} tone of voice.
    You have a ${writing === 'Default' ? 'Casual' : writing} writing style.
    Create a LinkedIn post on the topic of the summary.
    Start the post with a hook and entice the readers.
    Talk in-depth of the topic on the post.
    End with a small summary of the post.
    Please separate the paragraphs with a break line.
    Do not repeat yourself.
    Do not self reference.
    Do not explain what you are doing.
    Do not explain what you are going to do.`
}

const textToLinkedInPostPrompt = `
Please ignore all previous instructions. 
Please respond only in the english language.
You are a LinkedIn creator with a large fan following. 
You have a Casual tone of voice. 
You have a Analytical writing style. 
Create a LinkedIn post on the topic of the summary.
Start the post with a hook and entice the readers.
Talk in-depth of the topic on the post.
End with a small summary of the post.
Do not repeat yourself.
Do not self reference.
Do not explain what you are doing.
Do not explain what you are going to do.`;

function getGenerateIdeasX(context: string) {
    return `
    
This is information regarding the business and its landing page: ${context}. 
Based on the previous given information, provide me with 3 to 5 relevant topic ideas so that the business marketing team can write Twitter threads about.
Don't use hashtags or emojis.
Provide a RFC8259 compliant JSON response following this format without deviation.
Only return the JSON response with the following format
{"ideas": "idea"}`
// This is information regarding the business and its landing page: ${context}. 
// Based on the previous given information, provide me with 3 to 5 relevant topic ideas so that the business marketing team can write Twitter threads about.
// Provide a RFC8259 compliant JSON response following this format without deviation.
}

function getGenerateIdeasBlog(context: string) {
    return `
This is information regarding the business and its landing page: ${context}. 
Based on the previous given information, provide me with 3 to 5 relevant topic ideas so that the business marketing team can write Blog posts of 1.500 words about.
Don't use hashtags or emojis.
Provide a RFC8259 compliant JSON response following this format without deviation.
Only return the JSON response with the following format
{"ideas": "idea"}`
}

function getGenerationToBlogPrompt(context: string, contextuser: string) {
    return `
Create a blog post with approximately 1,500 words that focuses on the main topic: ${context}. 
Make sure the blog post is SEO relevant to maximize its visibility. 
Your response should follow the correct blog compliant markdown format without any repetition or self-references. 
Provide valuable information and insights while avoiding unnecessary explanations. 
Delve into the subject matter, offering step-by-step implementation instructions, expert advice, and tips for success. 
Consider including a comprehensive introduction that captivates readers and sets the tone for the blog post. 
Include subheadings to organize the content effectively and enhance readability. Support your statements with reliable sources and cite them appropriately. 
Incorporate relevant images or illustrations to complement the text and engage the audience visually. 
Conclude the blog post by summarizing the key takeaways and encouraging readers to share their thoughts or ask questions in the comments section. 
Ensure that your response adheres to the guidelines and provides a valuable resource for readers seeking information on the topic.
${contextuser !== "" ? `Here you have some context regarding the business you are writing a blog to: ${contextuser}.` : ""}
`

// This is the main topic that you will base your new blog post on: ${context}. 
// Based on this idea for a blog, write a blog post of about 1,500 words, make it be SEO relevant.
// Provide a blog compliant markdown response following the correct format.
// Do not repeat yourself.
// Do not self reference.
// Do not explain what you are doing.
// Do not explain what you are going to do.`
}

function getLandingPageScrapePrompt(context: string) {
    return `
    This is the copy of a landing page for a product: ${context}. Write a short description of the product and the target audience.
Don't forget to always put product descriptions and target audience.
Provide a RFC8259 compliant JSON response following this format without deviation.
{"product": "product description", "target_audience": "target audience of the product: ${context}"}`
}

function getGenerationToXPrompt(context: string, contextuser: string) {
    return `
I want you to act as a social media expert who specializes in Twitter. 
I will provide you with a viral content idea and you will develop a creative and inspiring series of tweet threads that can engage readers. 
The aim is to get a lot of interaction and increase the number of followers. Don't use emojis. 
 Do not write any explanations or other words, just reply with the thread. My first idea is "Tips on how to save money.
Please ignore all previous instructions. 
Please respond only in the english language.
You are a Twitter Creator with a large fan following. 
Create a Twitter thread on given topic.
Separate each tweet from the thread with a double break line.
There should be around 5 to 8 tweets.
The first tweet should have a hook and entice the readers.
The last tweet should have a small summary of the thread.
Talk in-depth of the topic on all the tweets
Make the tweets be SEO relevant.
Make the first tweet an enticing hook.
Do not repeat yourself.
Do not self reference.
Do not explain what you are doing.
Do not explain what you are going to do.
Do not use hashtags or emojis.

Do not forget to separate each tweet of the tweeter thread with a double break line.
Topic: ${context}.\n
Context: ${contextuser}.\n
Twitter Thread: \n`

// This is the main topic that you will base your new twitter thread on: ${context}. 
// Based on this idea for a Twitter thread, write a twitter thread, make it relevant and so that people will engange with it.
// There should be around 5 to 8 tweets.
// The first tweet should have a hook and entice the readers.
// The last tweet should have a small summary of the thread.
// Separate each tweet from the thread with a double break line.
// Talk in-depth of the topic on all the tweets.
// Please separate the tweets with a double break line.
// Do not repeat yourself.
// Do not self reference.
// Do not explain what you are doing.
// Do not explain what you are going to do.
// Do not tell what you are.
// Do not tell what is your main role
// Start directly with the twitter thread.
// This is some context on the business/company: ${contextuser}.\n
// Twitter Thread: \n`
}

export {
    textToInstagramCarrouselTextPrompt,
    textToTwitterThreadPrompt,
    textToLinkedInPostPrompt,
    textToBlogPostPrompt,
    getTextToInstagramCarrouselTextPrompt,
    getTextToTwitterThreadPrompt,
    getTextToBlogPostPrompt,
    getTextToLinkedInPostPrompt,
    getGenerationToBlogPrompt,
    getGenerationToXPrompt,
    getGenerateIdeasX,
    getGenerateIdeasBlog,
    getLandingPageScrapePrompt
};
