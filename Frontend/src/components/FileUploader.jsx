import { useState } from 'react';
import { FaFilePdf, FaFileAlt, FaUpload } from 'react-icons/fa';

export const FileUploader = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => 
      ['application/pdf', 'text/plain'].includes(file.type)
    );
    
    if(validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  return (
    <div 
    className={`border-2 border-dashed p-8 text-center rounded-lg mb-8 
      ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input 
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".pdf,.txt"
        className="hidden"
        id="file-upload"
      />
      <label 
        htmlFor="file-upload" 
        className="cursor-pointer flex flex-col items-center"
      >
        <FaUpload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">
          Drag & drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: PDF, TXT (Max size: 5MB)
        </p>
      </label>
    </div>
  );
};
