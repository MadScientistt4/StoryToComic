import React, { useState } from 'react';
import axios from 'axios';

export default function DocumentToImages() {
    const [file, setFile] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [prompts, setPrompts] = useState([]);
    const [images, setImages] = useState([]);
    const [storyId, setStoryId] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setDocumentText(event.target.result);
            };
            reader.readAsText(selectedFile);
        } else {
            setDocumentText('Preview available after upload.');
        }
    };

    const uploadDocument = async () => {
        const formData = new FormData();
        formData.append('storyFile', file); // IMPORTANT: field name must match `upload.single('storyFile')`

        try {
            const res = await axios.post('http://localhost:5000/api/functionality/upload-story', formData);
            const { storyText, storyId: sid } = res.data;
            setDocumentText(storyText);
            setStoryId(sid);
        } catch (err) {
            alert('Upload failed');
            console.error(err);
        }
    };

    const generatePrompts = async () => {
        const res = await axios.post(`http://localhost:5000/api/functionality/generate-prompts/${storyId}`);
        setPrompts(res.data.prompts);
    };

    const generateImages = async () => {
        const res = await axios.post(`http://localhost:5000/api/functionality/generate-images/${storyId}`);
        setImages(res.data.images);
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-center ">Short Story to Comic</h1>

            <div className="mb-3">
                <input type="file" className="form-control" onChange={handleFileChange} />
            </div>

            <button onClick={uploadDocument} className="btn btn-primary mb-4">Upload Document</button>

            {documentText && (
                <div className="mb-4">
                    <h4>Document Text</h4>
                    <textarea className="form-control" rows="8" readOnly value={documentText}></textarea>
                    <button onClick={generatePrompts} className="btn btn-success mt-3">Generate Prompts</button>
                </div>
            )}

            {prompts.length > 0 && (
                <div className="mb-4">
                    <h4>Generated Prompts</h4>
                    <ul className="list-group mb-3">
                        {prompts.map((p, i) => (
                            <li className="list-group-item" key={i}>{p}</li>
                        ))}
                    </ul>
                    <button onClick={generateImages} className="btn btn-warning">Generate Images</button>
                </div>
            )}

            {images.length > 0 && (
                <div>
                    <h4 className="mb-3">Generated Images</h4>
                    <div className="row">
                        {images.map((img) => (
                            <div key={img.id} className="col-md-3 mb-4">
                                <div className="card">
                                    <img src={`http://localhost:5000${img.url}`} className="card-img-top" alt={img.prompt} />
                                    <div className="card-body">
                                        <p className="card-text">{img.prompt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <a
                            className="btn btn-danger"
                            href={`http://localhost:5000/api/story/story-pdf/${storyId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Download Comic as PDF
                        </a>

                    </div>
                </div>
            )}
        </div>
    );
}