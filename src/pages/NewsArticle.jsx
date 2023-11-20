import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { fetchArticleById } from '../api/articles-api';
import { Parser } from 'html-to-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet';
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaRedditAlien, FaLink } from 'react-icons/fa';
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

  const renderSkeleton = () => (
    <>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-date"></div>
      <div className="skeleton skeleton-img"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
    </>
  );

  if (!article) {
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <Card className="article-container">
              <Card.Header className="article-header">
                {renderSkeleton()}
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Split the title into main title and subtitle if there's a colon
  const titleParts = article.title.split(':');
  const mainTitle = titleParts[0];
  const subTitle = titleParts.length > 1 ? titleParts.slice(1).join(':').trim() : '';

  const processedContent = article.content.replace(
    /<p><strong>(.*?)<\/strong><\/p>/g,
    (match, text) => `<h4>${text}</h4>`
  );

  const formattedDate = format(new Date(article.createdAt), 'EEEE, MMMM do, yyyy');

  const shareUrl = window.location.href; // This gets the current URL to share

  // Function to handle copying the link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!'); // You might want to replace this with a less intrusive notification
    });
  };

  // Social sharing component
  const SocialSharing = () => {
    return (
      <div className="social-sharing">
        <button onClick={copyToClipboard} title="Copy link"><FaLink /></button>
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')} title="Share on Twitter"><FaTwitter /></button>
        <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')} title="Share on Facebook"><FaFacebookF /></button>
        <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')} title="Share on LinkedIn"><FaLinkedinIn /></button>
        <button onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}`, '_blank')} title="Share on Reddit"><FaRedditAlien /></button>
      </div>
    );
  };

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
      <Helmet>
        <title>{`${mainTitle}${subTitle ? `: ${subTitle}` : ''}`}</title>
        <meta name="description" content={article.description} />
      </Helmet>
      <Row>
        <Col>
          <Card className="article-container">
            {article.imageURL && (
              <div className="article-image-wrapper">
                <Image
                  src={article.imageURL}
                  alt="Article"
                  className="article-image"
                  fluid
                />
              </div>
            )}
            <Card.Header className="article-header">
              <div className="title-container">
                <h2>{mainTitle}</h2>
                {subTitle && <h5 className="article-subtitle">{subTitle}</h5>}
                <h5 className="article-date">{formattedDate}</h5>
                <SocialSharing />
              </div>
            </Card.Header>
            <Card.Body className="article-content">
              {htmlToReactParser.parse(processedContent)}
            </Card.Body>
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
