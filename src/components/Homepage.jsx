import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Form, FormControl } from 'react-bootstrap';
import { useEffect } from 'react';
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
                <Card.ImgOverlay className="d-flex flex-column justify-content-center">
                  <Card.Title className="latest-article-title">{filteredArticles[0].title}</Card.Title>
                  <Button variant="primary" href={`/article/${filteredArticles[0].titleId}`}>
                    Read More
                  </Button>
                </Card.ImgOverlay>
              </Card>
            </Col>
          </Row>
        )}
        <Row>
          {filteredArticles.slice(1).map((article, index) => (
            <Col xs={12} sm={6} md={4} key={article.id} className="mb-4">
              <Card>
                <Card.Img variant="top" src={article.imageURL} />
                <Card.Body>
                  <Card.Title className="article-title">{article.title}</Card.Title>
                  <Button variant="primary" href={`/article/${article.titleId}`}>
                    Read More
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
  
};  

export default Homepage;
