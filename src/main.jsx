import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  }

])

ReactDOM.createRoot(document.getElementById('root')).render(

  <RouterProvider router={router} />

)