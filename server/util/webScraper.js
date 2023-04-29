const puppeteer = require('puppeteer');
const scrapeGoogleNews = require('./scrapeGoogleNews');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const getArticleTextWithReadability = async (html) => {
  try {
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return article.textContent;
  } catch (error) {
    console.error(`Error getting article text with Readability: ${error.message}`);
    return null;
  }
};

const getArticleTextWithPuppeteer = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();

    const articleText = await getArticleTextWithReadability(content);

    return articleText;
  } catch (error) {
    console.error(`Error getting article text with Puppeteer: ${error.message}`);
    return null;
  }
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

const main = async () => {
  const searchTerm = 'ai news';
  const timeframe = '7d';
  const articles = await getGoogleNewsArticles(searchTerm, timeframe);

  for (const article of articles) {
    console.log(`Title: ${article.title}`);
    console.log(`Link: ${article.link}`);

    const articleText = await getArticleTextWithPuppeteer(article.link);
    console.log('Content:');
    console.log(articleText);
    console.log('----------------------------------------------');
  }
};

main();
