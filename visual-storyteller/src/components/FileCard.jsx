export const FileCard = ({ title, metadata }) => (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 mb-4 rounded-lg" />
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{metadata}</p>
    </div>
  )
  