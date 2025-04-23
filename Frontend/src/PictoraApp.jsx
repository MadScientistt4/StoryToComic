import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { Sidebar } from './components/Sidebar';
import { useNavigate } from 'react-router-dom';

const PictoraApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [selectedVisual, setSelectedVisual] = useState(null);

  // Comics section state
  const [comicPreviews, setComicPreviews] = useState([]);
  const [loadingComics, setLoadingComics] = useState(true);
  const [selectedComicId, setSelectedComicId] = useState(null);
  const [comicImages, setComicImages] = useState([]);
  const [showComicModal, setShowComicModal] = useState(false);

  const navigate = useNavigate();

  // Static library visuals
  const libraryItems = [
    { id: 1, title: 'Cinderella', type: 'Shared file', image: 'https://images.nightcafe.studio/jobs/wmO4nQRGP5u61j2oioi9/wmO4nQRGP5u61j2oioi9--3--byafv.jpg?tr=w-1600,c-at_max', documentText: 'Once upon a time, Cinderella lived with her stepmother and stepsisters...' },
    { id: 2, title: 'Naruto', type: 'Shared file', image: 'https://lumenor.ai/cdn-cgi/imagedelivery/F5KOmplEz0rStV2qDKhYag/51284e4d-ce43-4936-5a81-7a9159fb9300/source', documentText: 'Naruto Uzumaki is a young ninja who seeks recognition...' },
    { id: 3, title: 'Lord of the Mysteries', type: 'Shared file', image: 'https://rapi.pixai.art/img/media/433549695694775938/orig', documentText: 'In a world of steampunk and mysticism, Klein Moretti discovers...' },
    { id: 4, title: 'Harry Potter', type: 'Shared file', image: 'https://imagedelivery.net/TkcHhODAR5Y7jFoICvSX0Q/31683e38-c310-49c6-d3ae-0b8d83524300/width=480,fit=contain', documentText: 'Harry Potter is a wizard who attends Hogwarts School of Witchcraft and Wizardry...' },
    { id: 5, title: 'Star Wars', type: 'Shared file', image: 'https://imagedelivery.net/TkcHhODAR5Y7jFoICvSX0Q/dc4a5223-2a63-4840-2b80-5dce22899c00/width=480,fit=contain', documentText: 'Elizabeth Bennet navigates love and society in Regency England...' },
  ];

  // Fetch comic previews on mount
  useEffect(() => {
    const fetchComics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/story/all-stories');
        const stories = res.data.stories;
        const previews = await Promise.all(
          stories.map(async story => {
            const imgsRes = await axios.get(`http://localhost:5000/api/story/stories/${story._id}/images`);
            const imgs = imgsRes.data.images;
            return {
              _id: story._id,
              title: story.title,
              previewUrl: imgs[0] ? `http://localhost:5000${imgs[0].url}` : null
            };
          })
        );
        setComicPreviews(previews);
      } catch (err) {
        console.error('Error loading comics:', err);
      } finally {
        setLoadingComics(false);
      }
    };
    fetchComics();
  }, []);

  const handleVisualClick = (item) => {
    setSelectedVisual(item);
    setShowVisualModal(true);
  };

  const handleVisualClose = () => {
    setShowVisualModal(false);
    setSelectedVisual(null);
  };

  const handleComicClick = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/story/stories/${id}/images`);
      const imgs = res.data.images.map(img => ({
        ...img,
        fullUrl: `http://localhost:5000${img.url}`
      }));
      setComicImages(imgs);
      setSelectedComicId(id);
      setShowComicModal(true);
    } catch (err) {
      console.error('Error fetching comic pages:', err);
    }
  };

  const handleComicClose = () => {
    setShowComicModal(false);
    setSelectedComicId(null);
    setComicImages([]);
  };

  // Filter visuals by search
  const filteredVisuals = libraryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
          <Form.Control
            type="text"
            placeholder="Search visuals..."
            className="w-25"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div>
            <Button variant="dark" onClick={() => navigate('/story-generator')}>Upload New Document</Button>
          </div>
        </header>

        <main className="p-4 bg-light flex-grow-1 overflow-auto">
          {/* Comics Section */}
          <section className="mb-5">
            <h2 className="fs-5 fw-semibold mb-3">Comics</h2>
            {loadingComics ? (
              <p>Loading comics...</p>
            ) : (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {comicPreviews.map(item => (
                  <div className="col" key={item._id}>
                    <Card
                      className="shadow-sm h-100"
                      onClick={() => handleComicClick(item._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.previewUrl ? (
                        <Card.Img
                          variant="top"
                          src={item.previewUrl}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                          No Preview
                        </div>
                      )}
                      <Card.Body>
                        <Card.Title>{item.title}</Card.Title>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Visuals Section */}
          <section>
            <h2 className="fs-5 fw-semibold mb-3">Visuals</h2>
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {filteredVisuals.length > 0 ? (
                filteredVisuals.map(item => (
                  <div className="col" key={item.id}>
                    <Card
                      className="shadow-sm h-100"
                      onClick={() => handleVisualClick(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Img variant="top" src={item.image} style={{ height: '200px', objectFit: 'cover' }} />
                      <Card.Header as="h5">{item.title}</Card.Header>
                      <Card.Body>
                        <Card.Text className="text-secondary">{item.type}</Card.Text>
                      </Card.Body>
                    </Card>
                  </div>
                ))
              ) : (
                <p>No visuals found</p>
              )}
            </div>
          </section>
        </main>

        {/* Modal for Visuals */}
        <Modal show={showVisualModal} onHide={handleVisualClose} centered size="lg">
          {selectedVisual && (
            <>
              <Modal.Header closeButton>
                <Modal.Title>{selectedVisual.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <img
                  src={selectedVisual.image}
                  alt={selectedVisual.title}
                  className="img-fluid mb-3"
                  style={{ maxHeight: '400px', objectFit: 'contain', width: '100%' }}
                />
                <h6>Document Text</h6>
                <p className="text-secondary">{selectedVisual.documentText}</p>
              </Modal.Body>
            </>
          )}
        </Modal>

        {/* Modal for Comics */}
        <Modal show={showComicModal} onHide={handleComicClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Comicbook View</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {comicImages.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {comicImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.fullUrl}
                    alt={`Page ${idx + 1}`}
                    className="img-fluid"
                  />
                ))}
              </div>
            ) : (
              <p>No pages to display</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleComicClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default PictoraApp;
