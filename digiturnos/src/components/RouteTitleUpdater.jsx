import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function RouteTitleUpdater() {
    const location = useLocation();

    useEffect(() => {
        let title = 'React + Vite'; // Título por defecto

        // Cambiar el título según la ruta
        switch (location.pathname) {
            case '/':
                title = 'Digiturnos';
                break;
            default:
                title = '404 - Página No Encontrada';
        }

        document.title = title;
    }, [location]);

    return null; // Este componente no renderiza nada
}

export default RouteTitleUpdater;