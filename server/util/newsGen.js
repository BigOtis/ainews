const axios = require('axios');
const cheerio = require('cheerio');
const { insertArticle } = require('../controllers/articleController');
const { MongoClient } = require('mongodb');
const { Configuration, OpenAIApi } = require("openai");

const model = "gpt-3.5-turbo"; // Use gpt-4 for production

const googleNewsSearchUrl = 'https://www.google.com/search?q=ai+news&tbm=nws';

const getArticleText = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const text = $('body').text();
    return text;
  } catch (error) {
    console.error(`Error fetching article text: ${error.message}`);
    return '';
  }
};

const generateArticleContent = async (sourceArticles) => {
    console.log('Generating article content...')
    const configuration = new Configuration({
        apiKey: process.env.API_KEY_VALUE,
    });

  const openai = new OpenAIApi(configuration);

  try {
    const chooseArticlesResponse = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in choosing the three most interesting articles from a list of articles.",
        },
        {
          role: "user",
          content: `Choose the three most interesting articles from this list: ${JSON.stringify(sourceArticles)}`,
        },
      ],
    });

    const chosenIndexes = JSON.parse(chooseArticlesResponse.data.choices[0].message.content);
    const chosenArticles = chosenIndexes.map(index => sourceArticles[index]);

    const contentResponse = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in writing weekly AI news articles based on provided sources.",
        },
        {
          role: "user",
          content: `Write an article about the status of AI this week based on the following articles: ${JSON.stringify(chosenArticles)}`,
        },
      ],
    });

    const generatedArticle = contentResponse.data.choices[0].message.content;

    const titleAndSummaryResponse = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in creating unique titles and short summaries for AI news articles.",
        },
        {
          role: "user",
          content: "Generate a unique title and a short summary for the following AI news article content: " + generatedArticle,
        },
      ],
    });

    const titleAndSummary = titleAndSummaryResponse.data.choices[0].message.content.split('\n');
    const title = titleAndSummary[0];
    const summary = titleAndSummary[1];

    return { content: generatedArticle, title, summary };
  } catch (error) {
    console.error(`Error generating article content: ${error.message}`);
    return { content: '', title: '', summary: '' };
  }
};

const createWeeklyAINewsArticle = async () => {
    try {
      const { data } = await axios.get(googleNewsSearchUrl);
      const $ = cheerio.load(data);
      const articles = [];
  
      $('a').each((index, element) => {
        const title = $(element).text();
        const link = $(element).attr('href');
        if (link.startsWith('/url?q=')) {
          const url = link.slice(7);
          articles.push({ title, url });
        }
      });
  
      const workableArticles = [];
      for (const article of articles) {
        const text = await getArticleText(article.url);
        if (text) {
          workableArticles.push({ ...article, text });
          if (workableArticles.length === 6) {
            break;
          }
        }
      }
  
      const { content, title, summary } = await generateArticleContent(workableArticles);
  
      const mongoClient = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
      await mongoClient.connect();
  
      const article = {
        title,
        summary,
        content,
        imageURL: 'https://example.com/default_image.jpg',
        createdAt: new Date(),
      };
  
      await insertArticle(mongoClient.db(process.env.DB_NAME), article);
      await mongoClient.close();
    } catch (error) {
      console.error(`Error creating weekly AI news article: ${error.message}`);
    }
  };
  
  createWeeklyAINewsArticle();
  
