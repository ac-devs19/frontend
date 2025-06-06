import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from "@material-tailwind/react";
import { AuthContext } from './contexts/AuthContext.jsx';
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContext>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthContext>
    </BrowserRouter>
  </StrictMode>,
)
