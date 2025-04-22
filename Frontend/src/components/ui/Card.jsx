// components/ui/Card.js
import Card from 'react-bootstrap/Card';

export const CustomCard = ({ children }) => (
  <Card className="mb-4 shadow-sm">{children}</Card>
);

export const CardHeader = ({ children }) => (
  <Card.Header className="fw-bold fs-5">{children}</Card.Header>
);

export const CardContent = ({ children }) => (
  <Card.Body className="text-secondary">{children}</Card.Body>
);
