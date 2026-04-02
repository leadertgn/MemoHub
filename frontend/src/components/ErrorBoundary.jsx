import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapport d'erreur
    console.error("ErrorBoundary a intercepté une erreur: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez faire le rendu de n'importe quelle UI de repli.
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] text-center max-w-lg w-full space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Oops, une erreur est survenue.</h1>
                <p className="text-gray-500 font-medium">
                  Le système a rencontré un problème inattendu lors de l'affichage de cette page. Ne paniquez pas, vos données sont saines.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => window.location.replace('/')} 
                    className="bg-gray-900 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Retour à l'accueil
                  </button>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
