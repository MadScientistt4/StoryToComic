import { useState } from 'react';

export const Tabs = ({ defaultTab, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="tabs">
      <div className="flex border-b">
        {children.map((child, index) => (
          <button
            key={index}
            className={`px-4 py-2 mr-1 hover:bg-grey-70 font-medium ${activeTab === index ? 'border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {children[activeTab]}
      </div>
    </div>
  );
};