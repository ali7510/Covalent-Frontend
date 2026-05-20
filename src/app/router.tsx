import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthPage from '../pages/AuthPage'
import HomePage from '../pages/HomePage'
// import other pages as you build them

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <AuthPage /> },
    { path: '/register', element: <AuthPage /> },
    { path: '/home', element: <HomePage /> },
  // add protected routes here
])