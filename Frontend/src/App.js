import './App.css';
import StoryGenerator from './components/StoryGenerator'
import { Route, Routes } from 'react-router-dom';
import { Worker } from '@react-pdf-viewer/core';
function App() {
  return (
    <>
     <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <Routes>
        <Route path='/' element={<StoryGenerator/>}/>
      </Routes>
     </Worker>
    </>
  );
}

export default App;
