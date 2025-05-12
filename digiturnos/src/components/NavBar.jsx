import PropTypes from "prop-types";

function Navbar({ name_to_page }) {
    return (
        <div className="container-fluid d-flex justify-content-center align-items-center mt-1">
            <nav className="navbar col-9 navbar-expand-lg px-3">
                <div className="navbar-brand rounded shadow bg-color-400 d-flex justify-content-center align-items-center col-12 p-2">
                    <h1 className="encabezado text-decoration-none fw-bold color-900 col-11 text-center">{ name_to_page }</h1>
                </div>
            </nav>
        </div>
    );
}

Navbar.propTypes = {
    name_to_page: PropTypes.string.isRequired
}

export default Navbar