import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { DocumentCard } from './components/DocumentCard';
import { DocumentViewer } from './components/DocumentViewer';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Document Manager</h1>
      
      <FileUploader onUpload={handleUpload} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <DocumentCard
            key={index}
            file={file}
            onClick={setSelectedFile}
          />
        ))}
      </div>

      {selectedFile && (
        <DocumentViewer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}
