import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Modal, Button, Form } from 'react-bootstrap';
import { Sidebar } from './Sidebar';

const ComicsPage = () => {
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPreviews = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/story/all-stories');
        const stories = res.data.stories;
        const previewsData = await Promise.all(
          stories.map(async (story) => {
            const imgsRes = await axios.get(
              `http://localhost:5000/api/story/stories/${story._id}/images`
            );
            const imgs = imgsRes.data.images;
            return {
              _id: story._id,
              title: story.title,
              previewUrl: imgs[0] ? `http://localhost:5000${imgs[0].url}` : null
            };
          })
        );
        setPreviews(previewsData);
      } catch (err) {
        console.error('Error fetching previews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviews();
  }, []);

  const handleCardClick = async (id) => {
    if (id === selectedStoryId) {
      setSelectedStoryId(null);
      setImages([]);
      setShowModal(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/story/stories/${id}/images`
      );
      const imgs = res.data.images.map((img) => ({
        ...img,
        fullUrl: `http://localhost:5000${img.url}`
      }));

      setImages(imgs);
      setSelectedStoryId(id);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching story images:', err);
    }
  };

  // Filter comics by search term
  const filteredPreviews = previews.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Full-height Sidebar */}
        <div className="col-md-3 vh-100 position-sticky top-0 bg-white border-end p-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 p-4">
          {/* Page Title above search bar */}
          <h2 className="mb-4">Comicbook Gallery</h2>

          {/* Search Bar */}
          <Form.Control
            type="text"
            placeholder="Search comics..."
            className="mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Preview Cards */}
          {loading ? (
            <div>Loading previews...</div>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {filteredPreviews.map((item) => (
                <div className="col" key={item._id}>
                  <Card
                    className="shadow-sm h-100"
                    onClick={() => handleCardClick(item._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.previewUrl ? (
                      <Card.Img
                        variant="top"
                        src={item.previewUrl}
                        alt={item.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: '200px' }}
                      >
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
        </div>
      </div>

      {/* Modal to show full comic */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Comicbook View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {images.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.fullUrl}
                  alt={`Page ${idx + 1}`}
                  className="img-fluid"
                />
              ))}
            </div>
          ) : (
            <div>No images to display.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ComicsPage;
