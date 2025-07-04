import PropTypes from "prop-types";

/**
 * Componente Navbar
 * Muestra una barra de navegación simple con el nombre de la página centrado.
 *
 * @param {string} name_to_page - Nombre o título a mostrar en la barra de navegación.
 */
function Navbar({ name_to_page }) {
    return (
        // Contenedor principal con estilos de Bootstrap para centrar el contenido
        <div className="container-fluid d-flex justify-content-center align-items-center mb-4">
            <nav className="navbar col-9 navbar-expand-lg px-3">
                <div className="navbar-brand rounded bg-color-400 d-flex justify-content-center align-items-center col-12 p-2">
                    {/* Título de la página */}
                    <h1 className="encabezado text-decoration-none fw-bold color-900 col-11 text-center">{ name_to_page }</h1>
                </div>
            </nav>
        </div>
    );
}

// Validación de propiedades
Navbar.propTypes = {
    name_to_page: PropTypes.string.isRequired
}

export default Navbar