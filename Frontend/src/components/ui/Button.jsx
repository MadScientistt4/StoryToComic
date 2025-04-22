export const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium shadow-sm transition ${className}`}
    {...props}
  >
    {children}
  </button>
);
