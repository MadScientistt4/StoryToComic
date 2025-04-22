import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Sidebar';

const StorylinesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/story/all-stories');
        if (response.data.success) {
          setStories(response.data.stories);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const getPreview = (text) => {
    if (!text) return '';
    const words = text.split(/\s+/).slice(0, 15).join(' ');
    return words + '...';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/story/story/${id}`);
      setStories(stories.filter(story => story._id !== id));
    } catch (err) {
      alert('Failed to delete story.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewImages = async (id) => {
    setSelectedStoryId(id === selectedStoryId ? null : id);
    if (id === selectedStoryId) {
      // Deselect
      setImages([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/story/stories/${id}/images`);
      setImages(res.data.images || []);
    } catch (err) {
      alert('Failed to fetch images.');
    }
  };

  if (loading) return <div className="p-4">Loading stories...</div>;
  if (error) return <div className="p-4 text-danger">Error loading stories: {error}</div>;

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-md-3 mb-4">
          <Sidebar />
        </div>
        <div className="col-md-9">
          <h2 className="mb-4">Storylines - Document Texts</h2>
          {stories.length === 0 ? (
            <div className="alert alert-info">No stories found</div>
          ) : (
            stories.map(story => (
              <div key={story._id} className="mb-4 p-3 border rounded shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div onClick={() => handleViewImages(story._id)} style={{ cursor: 'pointer' }}>
                    <h5>{story.title}</h5>
                    <p className="text-muted mb-0">{getPreview(story.originalText)}</p>
                    <small className="text-muted">
                      Created: {new Date(story.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(story._id)}
                    disabled={deletingId === story._id}
                  >
                    {deletingId === story._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                {selectedStoryId === story._id && images.length > 0 && (
                  <div className="mt-3">
                    <h6>Generated Images:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {images.map((img, idx) => (
                        <div key={idx} style={{ maxWidth: '200px' }}>
                          <img
                            src={`http://localhost:5000${img.url}`}
                            alt={`Story Image ${idx}`}
                            className="img-thumbnail mb-1"
                            style={{ width: '100%', height: 'auto' }}
                          />
                          <small className="text-muted d-block">{img.prompt.slice(0, 60)}...</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StorylinesPage;
