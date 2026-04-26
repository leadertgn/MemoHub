import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
    const { pathname } = useLocation();
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main key={pathname} className="flex-1 container mx-auto px-4 py-8 max-w-6xl page-transition">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}