import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { fetchArticleById } from '../api/articles-api';
import { Parser } from 'html-to-react';
import { format } from 'date-fns';
import './Article.css';

const NewsArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const htmlToReactParser = new Parser();

  useEffect(() => {
    const fetchArticle = async () => {
      const fetchedArticle = await fetchArticleById(id);
      setArticle(fetchedArticle);
    };

    fetchArticle();
  }, [id]);

  if (!article) {
    return <p>Loading...</p>;
  }

  const processedContent = article.content.replace(
    /<p><strong>(.*?)<\/strong><\/p>/g,
    (match, text) => {
      return `<h4>${text}</h4>`;
    }
  );

  const formattedDate = format(new Date(article.createdAt), 'EEEE, MMMM do, yyyy');

  const renderSourceArticles = () => {
    if (article.sourceArticles && article.sourceArticles.length > 0) {
      return (
        <div>
          <h5>Source Articles</h5>
          <ul>
            {article.sourceArticles.map((sourceArticle, index) => (
              <li key={index}>
                <a href={sourceArticle.link} target="_blank" rel="noopener noreferrer">
                  {sourceArticle.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="article-container">
            <Card.Header className="article-header">
              <div className="header-content">
                <h2>{article.title}</h2>
                <h5>{formattedDate}</h5>
              </div>
              {article.imageURL && <img src={article.imageURL} alt="Article" className="header-image" />}
            </Card.Header>
            <Card.Body className="article-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
            <Card.Footer>
              <h5>Summary</h5>
              <p>{article.summary}</p>
              {renderSourceArticles()}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Button variant="primary" href="/">&#8592; Back to Homepage</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NewsArticle;
