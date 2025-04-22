import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StorylinesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  if (loading) return <div className="p-4">Loading stories...</div>;
  if (error) return <div className="p-4 text-danger">Error loading stories: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Storylines - Document Texts</h2>
      {stories.length === 0 ? (
        <div className="alert alert-info">No stories found</div>
      ) : (
        stories.map(story => (
          <div key={story._id} className="mb-4 p-3 border rounded shadow-sm bg-white d-flex justify-content-between align-items-start">
            <div>
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
        ))
      )}
    </div>
  );
};

export default StorylinesPage;
