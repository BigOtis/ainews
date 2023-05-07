const fetch = require("node-fetch");

const searchGoogleImages = async (searchTerm) => {
    // load the api key from the environment variables
    const apiKey = process.env.GOOGLE_IMAGE_KEY;
    const cx = "b0b624769748b4791";
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${searchTerm} wikipedia&searchType=image&num=1`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data.items && data.items[0] ? data.items[0].link : null;
    } catch (error) {
      console.error("Error fetching Google Images API:", error);
      return null;
    }
  };

module.exports = {
    searchGoogleImages
  };