import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Worker } from '@react-pdf-viewer/core';
import PictoraApp from './PictoraApp';
import StoryGenerator from './components/StoryGenerator';

function App() {
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <Routes>
        <Route path="/" element={<PictoraApp />} />
        <Route path="/story-generator" element={<StoryGenerator />} />
      </Routes>
    </Worker>
  );
}

export default App;
