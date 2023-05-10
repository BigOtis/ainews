export const fetchAllArticles = async () => {
    try {
      const response = await fetch('/api/latest-articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const articles = await response.json();
      return articles;
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  
  export const fetchArticleById = async (id) => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const article = await response.json();
      return article;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
   