import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Form, FormControl } from 'react-bootstrap';
import './Homepage.css';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const sampleArticles = [
    {
      id: 1,
      title: 'The Future of AI: What to Expect in 2023',
      summary: 'Discover the latest trends and predictions in the field of artificial intelligence.',
      imageUrl: 'https://th.bing.com/th/id/OIG.t.zWzQ3yMjTUDpRc1oJR?pid=ImgGn',
    },
    {
      id: 2,
      title: 'AI Ethics: Balancing Innovation and Responsibility',
      summary: 'Explore the ethical considerations surrounding AI development and implementation.',
      imageUrl: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.shutterstock.com%2Fsearch%2Fthe-word-explain%3Fimage_type%3Dphoto&psig=AOvVaw36xGZqa9XJgkFzITyS7bD6&ust=1680946683476000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCLiE_cG8l_4CFQAAAAAdAAAAABAI',
    },
    {
        id: 3,
        title: 'AI Ethics: Balancing Innovation and Responsibility',
        summary: 'Explore the ethical considerations surrounding AI development and implementation.',
        imageUrl: 'https://a57.foxnews.com/cf-images.us-east-1.prod.boltdns.net/v1/static/694940094001/99c2d3f0-ca52-4098-9181-5c055a78fc88/280113b3-7fc9-4279-a467-a3ad7e69045b/1280x720/match/896/500/image.jpg?ve=1&tl=1',
    },
    {
    id: 4,
    title: 'AI Ethics: Balancing Innovation and Responsibility',
    summary: 'Explore the ethical considerations surrounding AI development and implementation.',
    imageUrl: 'https://example.com/image2.jpg',
    },
    // Add more sample articles here
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredArticles = sampleArticles.filter((article) =>
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
                src={filteredArticles[0].imageUrl}
                alt="Latest Article Image"
                style={{ opacity: '0.65' }}
                />
                <Card.ImgOverlay className="d-flex flex-column justify-content-center">
                  <Card.Title className="latest-article-title">{filteredArticles[0].title}</Card.Title>
                  <Card.Text className="latest-article-summary">{filteredArticles[0].summary}</Card.Text>
                  <Button variant="primary" href={`/article/${filteredArticles[0].id}`}>
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
                <Card.Img variant="top" src={article.imageUrl} />
                <Card.Body>
                  <Card.Title className="article-title">{article.title}</Card.Title>
                  <Card.Text className="article-summary">{article.summary}</Card.Text>
                  <Button variant="primary" href={`/article/${article.id}`}>
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
