import { Card, Container, Row, Col, Placeholder } from 'react-bootstrap';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'detail';
  count?: number;
}

const SkeletonLoader = ({ type, count = 3 }: SkeletonLoaderProps) => {
  if (type === 'card') {
    return (
      <Container>
        <Row>
          {Array.from({ length: count }).map((_, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card>
                <Card.Body>
                  <Placeholder as={Card.Title} animation="glow">
                    <Placeholder xs={7} />
                  </Placeholder>
                  <Placeholder as={Card.Text} animation="glow">
                    <Placeholder xs={4} /> <Placeholder xs={4} /> <Placeholder xs={6} />
                    <Placeholder xs={8} />
                  </Placeholder>
                  <Placeholder.Button variant="outline-primary" xs={4} className="me-2" />
                  <Placeholder.Button variant="outline-secondary" xs={3} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (type === 'list') {
    return (
      <Container>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Placeholder
                    style={{ width: '100%', height: '120px' }}
                    className="bg-secondary rounded"
                  />
                </Col>
                <Col md={9}>
                  <Placeholder as="h5" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={7} /> <Placeholder xs={4} />
                    <Placeholder xs={4} /> <Placeholder xs={6} />
                  </Placeholder>
                  <Placeholder.Button variant="primary" xs={3} className="me-2" />
                  <Placeholder.Button variant="outline-secondary" xs={2} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </Container>
    );
  }

  if (type === 'detail') {
    return (
      <Container>
        <Row>
          <Col md={6}>
            <Card>
              <Placeholder
                style={{ width: '100%', height: '300px' }}
                className="bg-secondary"
              />
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Placeholder as="h2" animation="glow">
                  <Placeholder xs={8} />
                </Placeholder>
                <Placeholder as="p" animation="glow">
                  <Placeholder xs={6} /> <Placeholder xs={8} />
                  <Placeholder xs={7} /> <Placeholder xs={5} />
                  <Placeholder xs={9} />
                </Placeholder>
                <div className="mb-3">
                  <Placeholder.Button variant="secondary" xs={4} className="me-2" />
                  <Placeholder.Button variant="info" xs={3} />
                </div>
                <div className="d-grid gap-2">
                  <Placeholder.Button variant="primary" />
                  <Placeholder.Button variant="outline-primary" />
                  <Placeholder.Button variant="outline-secondary" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return null;
};

export default SkeletonLoader;