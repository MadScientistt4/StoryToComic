import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Sidebar } from './components/Sidebar';
import { useNavigate } from 'react-router-dom';

const libraryItems = [
  { id: 1, title: 'Cinderella', type: 'Shared folder' },
  { id: 2, title: 'Naruto', type: 'Shared folder' },
  { id: 3, title: 'Lord of the Mysteries', type: 'Shared file' },
  { id: 4, title: 'Harry Potter', type: 'Shared folder' },
  { id: 5, title: 'Pride and Prejudice', type: 'Shared file' },
];

const PictoraApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredItems = libraryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <header className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
          <Form.Control
            type="text"
            placeholder="Search files..."
            className="w-25"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="d-flex gap-2">
            <Button variant="dark" onClick={() => navigate('/story-generator')}>Create</Button>
            <Button variant="outline-secondary">Upload</Button>
            <Button variant="outline-secondary">Create Folder</Button>
            <Button variant="outline-secondary">Record</Button>
          </div>
        </header>
        <main className="p-4 bg-light flex-grow-1">
          <h2 className="fs-5 fw-semibold mb-4">Library</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div className="col" key={item.id}>
                  <Card className="shadow-sm">
                    <Card.Header as="h5">{item.title}</Card.Header>
                    <Card.Body>
                      <Card.Text className="text-secondary">{item.type}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PictoraApp;
