import React from "react";

export const Sidebar = () => (
  <div className="d-flex flex-column bg-light vh-100 border-end" style={{ width: 260 }}>
    <div className="p-4 fw-bold fs-4 border-bottom">Pictora</div>
    <nav className="flex-grow-1 px-3">
      <ul className="list-unstyled mb-4">
        <li>
          <button className="btn w-100 text-start mb-2 btn-outline-secondary">All Content</button>
        </li>
        <li>
          <button className="btn w-100 text-start mb-2 btn-outline-secondary">Visuals</button>
        </li>
        <li>
          <button className="btn w-100 text-start mb-2 btn-outline-secondary">Storylines</button>
        </li>
      </ul>
      <div>
        <div className="text-secondary text-uppercase small mb-2">Collections</div>
        <ul className="list-unstyled">
          <li>
            <button className="btn w-100 text-start mb-2 btn-outline-secondary">Samples</button>
          </li>
          <li>
            <button className="btn w-100 text-start mb-2 btn-outline-secondary">Pictures</button>
          </li>
          <li>
            <button className="btn w-100 text-start mb-2 btn-outline-secondary">Folklores</button>
          </li>
          <li>
            <button className="btn w-100 text-start mb-2 btn-outline-secondary">Fairytales</button>
          </li>
        </ul>
      </div>
    </nav>
  </div>
);
