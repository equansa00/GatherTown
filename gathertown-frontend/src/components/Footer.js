// src/components/Footer.js

import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    © {new Date().getFullYear()} Community-Driven Local Event Finder. All Rights Reserved.
  </footer>
);

export default Footer;
