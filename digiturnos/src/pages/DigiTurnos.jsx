import PropTypes from "prop-types";

// Componentes
import Navbar from "../components/NavBar";
import Article from "../components/Article";

function DigiTurnos() {

    return (
        <div className="min-vh-100 col-12 bg-color-100 py-3 d-flex flex-column align-items-center">
            <Navbar name_to_page="DigiTurnos" to_page="/turnos" />

            <div className="col-10 d-flex flex-column justify-content-center align-items-center mt-5">
                <div className="m-0 d-flex gap-5">
                    <h5><span className="fw-bold">GN:</span> General</h5>
                    <h5><span className="fw-bold">CN:</span> Consignaciones</h5>
                </div>
                <Article
                    asesor='asesor 1'
                    tipo_asesor='gn-a1'
                />
                <Article
                    asesor='asesor 1'
                    tipo_asesor='cn'
                />
                <Article
                    asesor='asesor 2    '
                    tipo_asesor='gn-a2'
                />
                <Article
                    asesor='asesor 2'
                    tipo_asesor='cn'
                />
            </div>
        </div>
    );
}

export default DigiTurnos;
