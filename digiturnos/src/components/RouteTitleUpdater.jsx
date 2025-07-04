import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente RouteTitleUpdater
 * Actualiza el título de la pestaña del navegador según la ruta actual.
 * No renderiza nada en pantalla, solo tiene efecto colateral.
 */
function RouteTitleUpdater() {
    const location = useLocation();

    useEffect(() => {
        let title = 'React + Vite'; // Título por defecto

        // Cambia el título según la ruta actual
        switch (location.pathname) {
            case '/':
                title = 'Digiturnos';
                break;
            default:
                title = '404 - Página No Encontrada';
        }

        // Actualiza el título del documento
        document.title = title;
    }, [location]);

    return null; // Este componente no renderiza nada
}

export default RouteTitleUpdater;