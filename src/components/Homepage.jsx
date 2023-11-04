import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { fetchAllArticles } from '../api/articles-api';
import './Homepage.css';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const fetchedArticles = await fetchAllArticles();
      setArticles(fetchedArticles);
    };

    fetchArticles();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTitle = (title, isLatest = false) => {
    const splitTitle = title.split(":");
    if (splitTitle.length === 2) {
      return (
        <>
          <span className={isLatest ? "latest-article-title" : "main-title"}>
            {splitTitle[0]}
          </span>
          <hr />
          <span className="sub-title">{splitTitle[1]}</span>
        </>
      );
    }
    return <span className={isLatest ? "latest-article-title" : ""}>{title}</span>;
  };

  return (
    <>
      <Container fluid className="p-sm-3">
        {filteredArticles.length > 0 && (
          <Row className="mb-5">
            <Col>
              <Card className="bg-dark text-white">
                <Card.Img
                  className="latest-article-image"
                  src={filteredArticles[0].imageURL}
                  alt="Latest Article Image"
                  style={{ opacity: '0.65' }}
                />
                <Card.ImgOverlay className="d-flex justify-content-between flex-column h-100">
                  <div className="overlay-top">
                    {renderTitle(filteredArticles[0].title, true)}
                  </div>
                  <div className="overlay-bottom">
                    <Button variant="primary" href={`/article/${filteredArticles[0].titleId}`}>
                      Read More
                    </Button>
                  </div>
                </Card.ImgOverlay>
              </Card>
            </Col>
          </Row>
        )}
        <Row>
          {filteredArticles.slice(1).map((article, index) => {
            const createdAt = new Date(article.createdAt).toLocaleString();
            return (
              <Col xs={12} sm={6} md={4} key={article.id} className="mb-4">
                <Card>
                  <Card.Img variant="top" src={article.imageURL} />
                  <Card.Body>
                    {renderTitle(article.title)}
                    <Card.Text>{createdAt}</Card.Text>
                    <Button variant="primary" href={`/article/${article.titleId}`}>
                      Read More
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default Homepage;
