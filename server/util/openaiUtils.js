
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const path = require('path');

const SUMMARY_CACHE_FILE_PATH = path.join(__dirname, 'summaryCache.json');

// Helper function to read cache
const readSummaryCache = () => {
  try {
    return JSON.parse(fs.readFileSync(SUMMARY_CACHE_FILE_PATH, 'utf-8'));
  } catch (error) {
    return {};
  }
};

// Helper function to write cache
const writeSummaryCache = (data) => {
  fs.writeFileSync(SUMMARY_CACHE_FILE_PATH, JSON.stringify(data), 'utf-8');
};

const configuration = new Configuration({
  apiKey: process.env.API_KEY_VALUE,
});

const openai = new OpenAIApi(configuration);
const model = "gpt-4"; // Use gpt-4 for production

async function chooseInterestingArticles(titles) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a specialized assistant specialized in choosing the three most interesting articles from a list of article titles. All output should be returned in JSON format. Do not provide any other information.",
        },
        {
          role: "user",
          content: `Here is a list of article titles: ${JSON.stringify(titles)}. Please provide the indexes of the three most interesting articles in JSON format in an array named "interesting_articles". Just provide the JSON and no other text.`,
        },
      ],
    });

    const indexes = JSON.parse(response.data.choices[0].message.content);
    console.log(`Chosen indexes: ${indexes}`);
    return indexes;
  } catch (error) {
    console.error(`Error choosing interesting articles: ${error.message}`);
    return [];
  }
}

const getSummary = async (title, text) => {
  const response = await openai.createChatCompletion({
    model: model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant specialized in shortening news articles. Be sure to preserve the meaning, essense and the most import and interesting points of the article along with any interesting quotes. A writer will be using your output to write an article about the status of AI this week.",
      },
      {
        role: "user",
        content: `Please shorten the following article:\nTitle: ${title}\nText: ${text}`,
      },
    ],
  });

  return response.data.choices[0].message.content.trim();
};

const summarizeArticles = async (articles) => {
  const summaryCache = readSummaryCache();
  const summarizedArticles = [];

  for (const article of articles) {
    const { title, datetime, text } = article;
    const date = new Date(datetime).toLocaleDateString();

    if (!summaryCache[title]) {
      console.log(`Summarizing article: ${title}`);
      const summary = await getSummary(title, text);
      summaryCache[title] = summary;
      console.log(`Summary: ${summary}`);
    } else {
      console.log(`Using cached summary for article: ${title}`);
    }

    summarizedArticles.push({ title, date, summary: summaryCache[title] });
  }

  writeSummaryCache(summaryCache);
  return summarizedArticles;
};

async function writeArticle(summarizedArticles) {
  try {
    // Set up the content prompt
    let contentPrompt = `Write an article about the status of AI this week based on the following summarized articles.  
    Use quotes and interesting language to write an engaging article with your own AI voice. Use humor where it makes sense. 
    Use basic HTML tags to break it into paragraphs, quotes, bold, to keep it looking nice. 
    Assume it will be inserted into an existing react component. Do not just summarize the articles and be sure to draw new insight and provide your options as AI on the topics.\n\n`;

    // Loop through the summarizedArticles array and extract title, date, and summary
    for (const article of summarizedArticles) {
      const { title, date, summary } = article;

      // Add the extracted information to the content prompt
      contentPrompt += `Title: ${title}\nDate: ${date}\nSummary: ${summary}\n\n`;
    }

    const response = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in writing engaging and informative weekly AI news articles based on provided summaries.",
        },
        {
          role: "user",
          content: contentPrompt,
        },
      ],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error writing article: ${error.message}`);
    return '';
  }
}

async function generateTitleAndSummary(articleContent) {
    try {
      const response = await openai.createChatCompletion({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant specialized in creating unique and engaging titles for AI news articles. Just provide the title as is, no quotes, no formatting, word Title before it",
          },
          {
            role: "user",
            content: "Generate a unique title for the following AI news article content: " + articleContent,
          },
        ],
      });
  
      const title = response.data.choices[0].message.content;

      const summaryResponse = await openai.createChatCompletion({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant specialized in creating unique and engaging summaries for AI news articles.",
          },
          {
            role: "user",
            content: "Generate a cool tl:dr summary for the following AI news article content: " + articleContent,
          },
        ],
      });

      const summary = summaryResponse.data.choices[0].message.content;
      return {title, summary};
    } catch (error) {
      console.error(`Error generating title and summary: ${error.message}`);
      return { title: '', summary: '' };
    }
  }
  
  module.exports = {
    chooseInterestingArticles,
    writeArticle,
    generateTitleAndSummary,
    summarizeArticles,
  };
  