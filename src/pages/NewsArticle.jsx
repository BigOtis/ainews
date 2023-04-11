import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const NewsArticle = () => {
  const { id } = useParams();

  // Replace this with an API call to fetch the article by its ID
  const sampleArticle = {
    id: 1,
    title: 'The Future of AI: What to Expect in 2023',
    summary: 'Discover the latest trends and predictions in the field of artificial intelligence.',
    imageUrl: 'https://www.shutterstock.com/image-photo/example-word-written-on-wooden-260nw-1765482248.jpg',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque et feugiat lacus. Fusce vitae orci et lacus ullamcorper euismod id id turpis. Maecenas interdum augue vel consequat mollis. Donec feugiat orci nibh, vel gravida justo tempor vel. Mauris in elit vitae elit lacinia dapibus. Proin pretium nisi eu sem egestas, vitae vestibulum metus bibendum. Duis venenatis ullamcorper sapien, id pellentesque purus porta ac.

Sed egestas orci vitae suscipit cursus. Curabitur id sollicitudin orci. Sed eget mi tellus. Aliquam eu odio venenatis, aliquam neque eget, blandit ante. Sed vestibulum sagittis odio, a laoreet urna egestas ac. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed bibendum metus est.`,
    author: 'John Doe',
    date: '2023-04-07',
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Img variant="top" src={sampleArticle.imageUrl} />
            <Card.Body>
              <Card.Title>{sampleArticle.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                By {sampleArticle.author} - {sampleArticle.date}
              </Card.Subtitle>
              <Card.Text>{sampleArticle.content}</Card.Text>
            </Card.Body>
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
