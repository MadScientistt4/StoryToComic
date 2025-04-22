import React, { useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';

import { Sidebar } from './components/Sidebar';
import { useNavigate } from 'react-router-dom';

const libraryItems = [
  { id: 1, title: 'Cinderella', type: 'Shared file', image: 'https://images.nightcafe.studio/jobs/wmO4nQRGP5u61j2oioi9/wmO4nQRGP5u61j2oioi9--3--byafv.jpg?tr=w-1600,c-at_max', documentText: 'Once upon a time, Cinderella lived with her stepmother and stepsisters...' },
  { id: 2, title: 'Naruto', type: 'Shared file', image: 'https://lumenor.ai/cdn-cgi/imagedelivery/F5KOmplEz0rStV2qDKhYag/51284e4d-ce43-4936-5a81-7a9159fb9300/source', documentText: 'Naruto Uzumaki is a young ninja who seeks recognition...' },
  { id: 3, title: 'Lord of the Mysteries', type: 'Shared file', image: 'https://rapi.pixai.art/img/media/433549695694775938/orig', documentText: 'In a world of steampunk and mysticism, Klein Moretti discovers...' },
  { id: 4, title: 'Harry Potter', type: 'Shared file', image: 'https://imagedelivery.net/TkcHhODAR5Y7jFoICvSX0Q/31683e38-c310-49c6-d3ae-0b8d83524300/width=480,fit=contain', documentText: 'Harry Potter is a wizard who attends Hogwarts School of Witchcraft and Wizardry...' },
  { id: 5, title: 'Star Wars', type: 'Shared file', image: 'https://imagedelivery.net/TkcHhODAR5Y7jFoICvSX0Q/dc4a5223-2a63-4840-2b80-5dce22899c00/width=480,fit=contain', documentText: 'Elizabeth Bennet navigates love and society in Regency England...' },
];



const PictoraApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const filteredItems = libraryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

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
            <Button variant="dark" onClick={() => navigate('/story-generator')}>Upload New Document</Button>
          
          </div>
        </header>
        <main className="p-4 bg-light flex-grow-1">
          <h2 className="fs-5 fw-semibold mb-4">Library</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div className="col" key={item.id}>
                  <Card
                    className="shadow-sm h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCardClick(item)}
                  >
                    <Card.Img variant="top" src={item.image} alt={item.title} style={{ height: '200px', objectFit: 'cover' }} />
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

        {/* Modal for enlarged image and document text */}
        <Modal show={showModal} onHide={handleClose} centered size="lg">
          {selectedItem && (
            <>
              <Modal.Header closeButton>
                <Modal.Title>{selectedItem.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="img-fluid mb-3"
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
                <div>
                  <h6>Document Text</h6>
                  <p className="text-secondary">{selectedItem.documentText}</p>
                </div>
              </Modal.Body>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PictoraApp;
