import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from 'react-hot-toast';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <NextUIProvider>
      <Toaster position="top-center" />
      <App />
    </NextUIProvider>
  </BrowserRouter>
)
