import React from 'react';
import { createRoot } from 'react-dom/client';
import { StudioPage } from './pages/StudioPage';
import './styles/style.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root');

createRoot(root).render(<StudioPage />);
