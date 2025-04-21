import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { FaTimes} from 'react-icons/fa';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const DocumentViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if(file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => setTextContent(e.target.result);
      reader.readAsText(file);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{file.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[70vh]">
          {file.type === 'application/pdf' ? (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} />
            </Document>
          ) : (
            <pre className="whitespace-pre-wrap font-mono">
              {textContent}
            </pre>
          )}
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          {file.type === 'application/pdf' && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
              >
                Previous
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
              >
                Next
              </button>
            </div>
          )}
          <a
            href={URL.createObjectURL(file)}
            download={file.name}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};
