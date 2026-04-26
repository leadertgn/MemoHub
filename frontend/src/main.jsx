import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Configuration React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,  // données fraîches pendant 5 minutes
            retry: 1,                   // 1 retry en cas d'erreur
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                    <ErrorBoundary>
                        <App />
                        <Toaster 
                            position="top-right"
                            richColors
                            closeButton
                            duration={4000}
                        />
                    </ErrorBoundary>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </HelmetProvider>
        </BrowserRouter>
    </React.StrictMode>,
)