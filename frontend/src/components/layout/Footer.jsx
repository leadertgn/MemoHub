export default function Footer() {
    const current_year =  new Date().getFullYear()
    return (
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="container mx-auto px-4 max-w-6xl text-center text-sm text-gray-500">
                <p>© {current_year} MemoHub — La bibliothèque académique du Bénin</p>
                <p className="mt-1">Facilitons la continuité des recherches</p>
            </div>
        </footer>
    )
}