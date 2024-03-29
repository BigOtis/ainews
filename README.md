# AI News
![image](https://github.com/BigOtis/ainews/assets/6844863/e4116694-01c0-4dea-8cf3-13efc3095711)

## Prerequisites

Before running this application, ensure you have [Node.js](https://nodejs.org/) installed on your system.

## Article Generation

The main line code for scraping and then generating news articles with GPT4 is in newsGen.js

Simply setup your API key envars (see below) and then run newsGen.js to generate a news article on demand

## Website Installation

Follow these steps to set up the Imaginary Chat Application:

1. Clone the repository:

```
git clone https://github.com/BigOtis/ainews.git
cd ainews
```

2. Install the dependencies:

```
npm install
```

3. Set up the OpenAI API key:

4. Create a .env file in the root of the project directory, and add your OpenAI API key and a MongoDB key:

```
API_KEY_VALUE=your_api_key_here
MONGO_URL=your_mongo_url_credentials

Replace your_api_key_here / your_mongo_url_credentials with your actual OpenAI / MongoDB API key.
Running the application
```
5. Start the development server:


```
npm run server
```

This command will start the server required for the OpenAI API integration. Keep this terminal window open.

6. In a new terminal window, start the React development server:
```
npm start
```

This command will open the news webpage. The application should be running on http://localhost:3000/.

Now, you can generate an AI perspective on the latest news with the click of a button.

To generate new articles to populate your database, run the newsGen script standalone:
```
node server/util/newsGen.js
```
