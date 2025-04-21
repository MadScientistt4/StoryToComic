import { FaFilePdf, FaFileAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

export const DocumentCard = ({ file, onClick }) => {
  const getIcon = () => file.type?.includes('pdf') ? 
    <FaFilePdf className="w-12 h-12 text-red-500" /> : 
    <FaFileAlt className="w-12 h-12 text-blue-500" />;

  const fileExtension = file.name.split('.').pop().toUpperCase();
  const fileSizeKB = (file.size / 1024).toFixed(1);

  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(file)}
    >
      <div className="flex flex-col items-center">
        {getIcon()}
        <h3 className="mt-2 font-medium text-center truncate w-full">
          {file.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {fileExtension} • {fileSizeKB}KB
        </p>
      </div>
    </div>
  );
};



DocumentCard.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    size: PropTypes.number.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
};
