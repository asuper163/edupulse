import { HashRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/index.jsx';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import AppRouter from './router';

// HashRouter keeps deep links working on static file hosting with no server rewrites.
export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <HashRouter>
            <AppRouter />
          </HashRouter>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
