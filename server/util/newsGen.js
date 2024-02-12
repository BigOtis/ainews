const fs = require('fs');
const path = require('path');
const scrapeGoogleNews = require('./scrapeGoogleNews');
const { insertArticle } = require('../controllers/articleController');
const { MongoClient } = require('mongodb');
const { chooseInterestingArticles, writeArticle, generateTitleAndSummary, summarizeArticles } = require('./openaiUtils');
const { getArticleTextWithPuppeteer } = require('./webScraper');
const { searchGoogleImages } = require('./googleImageScraper');

const CACHE_FILE_PATH = path.join(__dirname, 'workableArticlesCache.json');

// Helper function to read cache
const readCache = () => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE_PATH, 'utf-8'));
  } catch (error) {
    return {};
  }
};

// Helper function to write cache
const writeCache = (data) => {
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data), 'utf-8');
};

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

const insertImages = async (content) => {
  const regex = /\{Image=(.*?)\}/g;

  let match;
  let processedContent = content;

  while ((match = regex.exec(content)) !== null) {
    const searchTerm = match[1];
    console.log(`Searching for image: ${searchTerm}`);
    const imageUrl = await searchGoogleImages(searchTerm);
    const imageTag = imageUrl ? `<img src="${imageUrl}" alt="${searchTerm}"/>` : '';

    processedContent = processedContent.replace(match[0], imageTag);
  }

  return processedContent;
};


const generateArticleContent = async (sourceArticles) => {
  console.log('Generating article content...');

  try {
    const titles = sourceArticles.slice(0, 10).map(article => article.title);
    console.log("Reviewing articles: " + JSON.stringify(titles));

    const chosenIndexes = await chooseInterestingArticles(titles);
    const chosenArticles = chosenIndexes.interesting_articles.map(index => sourceArticles[index]);

    const summarizedArticles = await summarizeArticles(chosenArticles);
    const generatedArticle = await writeArticle(summarizedArticles);

    const { title, summary } = await generateTitleAndSummary(generatedArticle);
    console.log(`Created Title: ${title}`);

    //console.log("Inserting images...");
    //const processedContent = await insertImages(generatedArticle);

    return { content: generatedArticle, title, summary, chosenArticles };
  } catch (error) {
    console.error(`Error generating article content: ${error.message}`);
    return { content: '', title: '', summary: '' };
  }
};

const createWeeklyNewsArticle = async (topic = "AI News") => {
  try {
    const currentDate = new Date().toISOString().slice(0, 10);
    let workableArticles = [];
    
    const cache = readCache();
    
    if (cache[currentDate]) {
      workableArticles = cache[currentDate];
    } else {
      const articles = await getGoogleNewsArticles(topic, "7d");

      for (const article of articles) {
        const text = await getArticleTextWithPuppeteer(article.link);
        if (text) {
          console.log(`Workable Article text: ${text}`);
          workableArticles.push({ ...article, text });
          if (workableArticles.length === 6) {
            break;
          }
        }
      }
      
      // Update cache
      cache[currentDate] = workableArticles;
      writeCache(cache);
    }

    console.log("Creating article content...");
    const { content, title, summary, chosenArticles } = await generateArticleContent(workableArticles);

    console.log("Add articles to database...");

    const sourceArticlesData = chosenArticles.map(article => ({
      title: article.title,
      link: article.link
    }));

    const mongoClient = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();

    const titleId = encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    const article = {
      title,
      titleId,
      summary,
      content,
      imageURL: 'https://i.imgur.com/NnRU67o.png',
      sourceArticles: sourceArticlesData,
      createdAt: new Date(),
    };

    await insertArticle(mongoClient.db("ainews"), article);
    await mongoClient.close();
  } catch (error) {
    console.error(`Error creating weekly news article: ${error.message}`);
  }
};

createWeeklyNewsArticle("AI News"); 
