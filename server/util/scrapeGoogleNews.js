const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

function buildQueryString(queryVars) {
    const queryKeys = Object.keys(queryVars);
    const queryString = queryKeys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryVars[key])}`).join('&');
    return queryString;
  }
  
module.exports = async function scrapeGoogleNews(config) {
  const queryString = config.queryVars ? buildQueryString(config.queryVars) : '';
  const url = `https://news.google.com/search?${queryString}&q=${config.searchTerm} when:${config.timeframe || '7d'}`;

  const puppeteerConfig = {
    headless: true,
    args: puppeteer.defaultArgs().concat(config.puppeteerArgs).filter(Boolean),
  };
  const browser = await puppeteer.launch(puppeteerConfig);
  const page = await browser.newPage();
  page.setViewport({ width: 1366, height: 768 });
  page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
  page.setRequestInterception(true);
  page.on('request', (request) => {
    if (!request.isNavigationRequest()) {
      request.continue();
      return;
    }
    const headers = request.headers();
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3';
    headers['Accept-Encoding'] = 'gzip';
    headers['Accept-Language'] = 'en-US,en;q=0.9,es;q=0.8';
    headers['Upgrade-Insecure-Requests'] = 1;
    headers['Referer'] = 'https://www.google.com/';
    request.continue({ headers });
  });
  await page.setCookie({
    name: 'CONSENT',
    value: `YES+cb.${new Date().toISOString().split('T')[0].replace(/-/g, '')}-04-p0.en-GB+FX+667`,
    domain: '.google.com',
  });
  await page.goto(url, { waitUntil: 'networkidle2' });

  const content = await page.content();
  const $ = cheerio.load(content);
  const articles = $('a[href^="./article"]').closest('div[jslog]');
  const results = [];
  const urlChecklist = [];

  let count = 0; // Keep track of the number of articles
  const maxArticles = config.maxArticles || 10; // Set the maximum number of articles based on config input or default to 10

  articles.each(function () {
    // Stop processing articles if the maxArticles threshold has been met
    if (count >= maxArticles) {
      return false;
    }
    const link = $(this).find('a[href^="./article"]').attr('href').replace('./', 'https://news.google.com/') || false;
    link && urlChecklist.push(link);
    const mainArticle = {
      title: $(this).find('h3').text() || false,
      link,
      image: $(this).find('figure').find('img').attr('src') || false,
      source: $(this).find('div:last-child svg+a').text() || false,
      datetime: new Date($(this).find('div:last-child time').attr('datetime')) || false,
      time: $(this).find('div:last-child time').text() || false,
      related: [],
    };
    console.log(mainArticle);
    const subArticles = $(this).find('div[jsname]').find('article');
    subArticles.each(function () {
      const subLink = $(this).find('a').first().attr('href').replace('./', 'https://news.google.com/') || false;
      if (subLink && !urlChecklist.includes(subLink)) {
        mainArticle.related.push({
            title: $(this).find('h4').text() || $(this).find('h4 a').text() || false,
            link: subLink,
            source: $(this).find('div:last-child svg+a').text() || false,
            time: $(this).find('div:last-child time').text() || false,
          });
        }
      });
      results.push(mainArticle);
      count++;
    });
  
    if (config.prettyURLs) {
      const prettyResults = [];
      for (const article of results) {
        try {
          const res = await axios.get(article.link);
          const _$ = cheerio.load(res.data);
          article.link = _$('c-wiz a[rel=nofollow]').attr('href');
          prettyResults.push(article);
        } catch (error) {
          console.error(`Failed to prettify URL for article: ${article.title}`);
        }
      }
      results = prettyResults;
    }
  
    await page.close();
    await browser.close();
  
    return results.filter(result => result.title);
  }
          