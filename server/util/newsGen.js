const scrapeGoogleNews = require('./scrapeGoogleNews');
const { insertArticle } = require('../controllers/articleController');
const { MongoClient } = require('mongodb');
const { Configuration, OpenAIApi } = require("openai");

const model = "gpt-3.5-turbo"; // Use gpt-4 for production

const getGoogleNewsArticles = async (searchTerm, timeframe, maxArticles=10) => {
  try {
    const articles = await scrapeGoogleNews({
      searchTerm: searchTerm,
      prettyURLs: false,
      queryVars: {
        hl: 'en-US',
        gl: 'US',
        ceid: 'US:en',
      },
      timeframe: timeframe,
      puppeteerArgs: [],
      maxArticles: maxArticles,
    });

    return articles;
  } catch (error) {
    console.error(`Error scraping Google News: ${error.message}`);
    return [];
  }
};


const generateArticleContent = async (sourceArticles) => {
  console.log('Generating article content...')
  const configuration = new Configuration({
    apiKey: process.env.API_KEY_VALUE,
  });

  const openai = new OpenAIApi(configuration);

  try {
    // Limit the source articles to a maximum of 10 and map them to their titles
    const titles = sourceArticles.slice(0, 10).map(article => article.title);
    console.log("Reviewing articles: " + JSON.stringify(titles));

    const chooseArticlesResponse = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in choosing the three most interesting articles from a list of article titles.",
        },
        {
          role: "user",
          content: `Here is a list of article titles: ${JSON.stringify(titles)}. Please provide the indexes of the three most interesting articles in JSON format.`,
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
    console.log(`Created Title: ${title}`);

    return { content: generatedArticle, title, summary };
  } catch (error) {
    console.error(`Error generating article content: ${error.message}`);
    return { content: '', title: '', summary: '' };
  }
};

const createWeeklyAINewsArticle = async () => {
  try {
    const articles = await getGoogleNewsArticles("AI News", "7d");

    const workableArticles = [];
    for (const article of articles) {
      const text = article.content;
      if (text) {
        console.log(`Workable Article text: ${text}`);
        workableArticles.push({ ...article, text });
        if (workableArticles.length === 6) {
          break;
        }
      }
    }

    console.log("Creating article content...");
    const { content, title, summary } = await generateArticleContent(workableArticles);

    console.log("Add articles to database...");
    const mongoClient = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();

    const article = {
      title,
      summary,
      content,
      imageURL: 'https://example.com/default_image.jpg',
      createdAt: new Date(),
    };

    await insertArticle(mongoClient.db("ainews"), article);
    await mongoClient.close();
  } catch (error) {
    console.error(`Error creating weekly AI news article: ${error.message}`);
  }
};
  
  createWeeklyAINewsArticle();
  
