import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
    const { pathname } = useLocation();
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-base)] selection:bg-[var(--color-cinnabar)] selection:text-white">
            <Navbar />
            <main key={pathname} className="flex-1 pb-24">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}