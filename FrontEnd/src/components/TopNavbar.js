// src/components/TopNavbar.js
import React from 'react';
import './TopNavbar.css';

export default function TopNavbar() {
  return (
    <div className="top-navbar">
      <div className="logo">MeuIPCB</div>
      <div className="search-wrapper">
        <button className="search-icon-button">
          <i className="fa fa-search" aria-hidden="true"></i>
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="O que procuras?"
        />
      </div>
    </div>
  );
}


