import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <App />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
