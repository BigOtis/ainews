const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

function buildQueryString(queryVars) {
  const queryKeys = Object.keys(queryVars);
  const queryString = queryKeys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryVars[key])}`).join('&');
  return queryString;
}

module.exports = async function scrapeGoogleNews(config) {
  const queryString = config.queryVars ? buildQueryString(config.queryVars) : '';
  const url = `https://news.google.com/search?${queryString}&q=${config.searchTerm} when:${config.timeframe || '7d'}`;
  console.log(`SCRAPING NEWS FROM: ${url}`);

  const puppeteerConfig = {
    headless: true,
    args: puppeteer.defaultArgs().concat(config.puppeteerArgs).filter(Boolean)
  };
  const browser = await puppeteer.launch(puppeteerConfig);
  const page = await browser.newPage();
  page.setViewport({ width: 1366, height: 768 });
  page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
  page.setRequestInterception(true);
  page.on('request', request => {
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
  const articles = $('article');
  let results = [];

  articles.each(function () {
    const link = $(this).find('a[href^="./article"]').attr('href').replace('./', 'https://news.google.com/') || false;
    const srcset = $(this).find('figure').find('img').attr('srcset')?.split(' ');
    const image = srcset && srcset.length ? srcset[srcset.length - 2] : $(this).find('figure').find('img').attr('src');
    const mainArticle = {
      title: $(this).find('h4').text() || $(this).find('div > div + div > div a').text(),
      link,
      image,
      source: $(this).find('div[data-n-tid]').text() || false,
      datetime: new Date($(this).find('div:last-child time').attr('datetime')) || false,
      time: $(this).find('div:last-child time').text() || false
    };
    results.push(mainArticle);
  });

  if (config.prettyURLs) {
    results = await Promise.all(results.map(async article => {
      try {
        const response = await fetch(article.link);
        const articleContent = await response.text();
        const _$ = cheerio.load(articleContent);
        article.link = _$('c-wiz a[rel=nofollow]').attr('href');
        return article;
      } catch (error) {
        console.error(`Failed to prettify URL for article: ${article.title}`);
        return article; // Return the article even if prettifying fails
      }
    }));
  }

  await page.close();
  await browser.close();

  return results.filter(result => result.title);
};
