import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function DocumentToImages() {
    const [file, setFile] = useState(null);
    const [documentText, setDocumentText] = useState('');
    const [prompts, setPrompts] = useState([]);
    const [images, setImages] = useState([]);
    const [storyId, setStoryId] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Loading states for each API call
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loadingPrompts, setLoadingPrompts] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);

    const inputRef = useRef(null);

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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange({ target: { files: e.dataTransfer.files } });
        }
    };

    const handleBrowseClick = () => {
        inputRef.current.click();
    };

    const uploadDocument = async () => {
        const formData = new FormData();
        formData.append('storyFile', file);

        setLoadingUpload(true);
        try {
            const res = await axios.post('http://localhost:5000/api/functionality/upload-story', formData);
            const { storyText, storyId: sid } = res.data;
            setDocumentText(storyText);
            setStoryId(sid);
        } catch (err) {
            alert('Upload failed');
            console.error(err);
        } finally {
            setLoadingUpload(false);
        }
    };

    const generatePrompts = async () => {
        setLoadingPrompts(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/functionality/generate-prompts/${storyId}`);
            setPrompts(res.data.prompts);
        } catch (err) {
            alert('Prompt generation failed');
            console.error(err);
        } finally {
            setLoadingPrompts(false);
        }
    };

    const generateImages = async () => {
        setLoadingImages(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/functionality/generate-images/${storyId}`);
            setImages(res.data.images);
        } catch (err) {
            alert('Image generation failed');
            console.error(err);
        } finally {
            setLoadingImages(false);
        }
    };

    const handleSavePDF = async () => {
        if (!storyId) return;
        setIsGeneratingPDF(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/pdf/generate-pdf/${storyId}`
            );
            if (response.data.success) {
                alert('PDF saved successfully!');
            }
        } catch (error) {
            console.error('PDF save failed:', error);
            alert('Failed to save PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Simple loader component
    const Loader = () => (
        <div style={{ textAlign: "center", padding: "1rem" }}>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="ms-2">Loading...</span>
        </div>
    );

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-center ">Short Story to Comic</h1>

            {/* DRAG AND DROP FILE INPUT */}
            <div
                className={`mb-3 border border-2 rounded p-4 text-center ${dragActive ? 'bg-light' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                onClick={handleBrowseClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="d-none"
                    onChange={handleFileChange}
                />
                <div>
                    <p className="mb-2">
                        {file ? (
                            <span><b>Selected:</b> {file.name}</span>
                        ) : (
                            <>Drag and drop your document here, or <span className="text-primary" style={{ textDecoration: 'underline', cursor: 'pointer' }}>browse</span></>
                        )}
                    </p>
                </div>
            </div>
            {/* END DRAG AND DROP FILE INPUT */}

            <button onClick={uploadDocument} className="btn btn-dark mb-4" disabled={loadingUpload}>
                {loadingUpload ? <Loader /> : "Upload Document"}
            </button>

            {documentText && (
                <div className="mb-4">
                    <h4>Document Text</h4>
                    <textarea className="form-control" rows="8" readOnly value={documentText}></textarea>
                    <button onClick={generatePrompts} className="btn btn-success mt-3" disabled={loadingPrompts}>
                        {loadingPrompts ? <Loader /> : "Generate Prompts"}
                    </button>
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
                    <button onClick={generateImages} className="btn btn-warning" disabled={loadingImages}>
                        {loadingImages ? <Loader /> : "Generate Images"}
                    </button>
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
                        <div className="mt-4 d-flex gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleSavePDF}
                                disabled={isGeneratingPDF}
                            >
                                {isGeneratingPDF ? <Loader /> : "Save PDF to Database"}
                            </button>

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
                </div>
            )}
        </div>
    );
}
