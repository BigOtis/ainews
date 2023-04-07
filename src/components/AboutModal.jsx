import React, { useState } from 'react';
import { Modal, Button, Container } from 'react-bootstrap';
import { InfoCircle} from 'react-bootstrap-icons';

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
            AI News and Trends is a weekly news platform dedicated to providing you with the latest updates, breakthroughs, and insights in the field of artificial intelligence. Our
            expertly curated content covers a wide range of topics, including machine learning, natural language processing, computer vision, robotics, and ethics in AI.
          </p>
          <p>
            Our mission is to educate, inform, and inspire our readers by delivering high-quality, relevant, and engaging content that keeps them at the forefront of the rapidly
            evolving AI landscape.
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
