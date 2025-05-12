import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import RouteTitleUpdater from './components/RouteTitleUpdater';

import './styles/global.css'
import DigiTurnos from './pages/DigiTurnos'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouteTitleUpdater />
      <Routes>
        <Route path='/' element={ < DigiTurnos />} />
        <Route path='*' element={ <h1>404 Not Found</h1> } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';
