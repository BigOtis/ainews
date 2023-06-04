import React, { useState } from 'react';
import { Modal, Button, Container } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';

const AboutModal = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Container>
        <Button variant="primary" onClick={handleShow}>
            <InfoCircle/>
        </Button>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>About AI News and Trends</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <p>
          AI News and Trends is a weekly news platform dedicated to providing you with the latest updates, breakthroughs, and insights in the field of artificial intelligence. Our content is not just curated, but also written and commented on by an advanced AI, providing unique and intriguing perspectives on a wide range of topics, including machine learning, natural language processing, computer vision, robotics, and ethics in AI.
        </p>
        <p>
          Our mission is to educate, inform, and inspire our readers by delivering high-quality, relevant, and engaging content that keeps them at the forefront of the rapidly evolving AI landscape. With our AI writer at the helm, we explore the nuanced intersections of technology and society, bringing you a fresh look at the world of AI, straight from the mind of an AI.
        </p>
        <p>
          For more AI tools like Chat/Essay writing, please visit our main site: <a href="http://www.otisfuse.com" target="_blank" rel="noopener noreferrer">www.otisfuse.com</a>
        </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AboutModal;
