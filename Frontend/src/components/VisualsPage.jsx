import React from 'react';
import { Card } from 'react-bootstrap';
import { Sidebar } from './Sidebar';

const libraryItems = [
  { id: 1, title: 'Cinderella', type: 'Shared file', image: 'https://images.nightcafe.studio/jobs/wmO4nQRGP5u61j2oioi9/wmO4nQRGP5u61j2oioi9--3--byafv.jpg?tr=w-1600,c-at_max', documentText: 'Once upon a time, Cinderella lived with her stepmother and stepsisters...' },
  { id: 2, title: 'Naruto', type: 'Shared file', image: 'https://lumenor.ai/cdn-cgi/imagedelivery/F5KOmplEz0rStV2qDKhYag/51284e4d-ce43-4936-5a81-7a9159fb9300/source', documentText: 'Naruto Uzumaki is a young ninja who seeks recognition...' },
  { id: 3, title: 'Lord of the Mysteries', type: 'Shared file', image: 'https://rapi.pixai.art/img/media/433549695694775938/orig', documentText: 'In a world of steampunk and mysticism, Klein Moretti discovers...' },
  { id: 4, title: 'Harry Potter', type: 'Shared file', image: 'https://imagedelivery.net/TkcHhODAR5Y7jFoICvSX0Q/31683e38-c310-49c6-d3ae-0b8d83524300/width=480,fit=contain', documentText: 'Harry Potter is a wizard who attends Hogwarts School of Witchcraft and Wizardry...' },
  { id: 5, title: 'Star Wars', type: 'Shared file', image: 'https://imagedelivery.net/TkcHhODAR5Y7jFoICvSX0Q/dc4a5223-2a63-4840-2b80-5dce22899c00/width=480,fit=contain', documentText: 'Elizabeth Bennet navigates love and society in Regency England...' },
];

const VisualsPage = () => {
  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Visuals - All Generated Photos</h2>
      <div className="row">
        {/* Sidebar column */}
        <div className="col-md-3 mb-4">
          <Sidebar />
        </div>
        {/* Cards column */}
        <div className="col-md-9">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {libraryItems.map(item => (
              <div className="col" key={item.id}>
                <Card className="shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={item.image}
                    alt={item.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Text className="text-muted">{item.type}</Card.Text>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualsPage;
