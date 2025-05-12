import PropTypes from "prop-types";
import { useState } from "react";

// Mapeo de los segmentos encendidos por dígito
const SegmentosDigitales = {
    0: [1, 1, 1, 1, 1, 1, 0],
    1: [0, 1, 1, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1],
    4: [0, 1, 1, 0, 0, 1, 1],
    5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1],
    7: [1, 1, 1, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1],
};

const Segmento7 = ({ digit }) => {
    const segments = SegmentosDigitales[digit] || [0, 0, 0, 0, 0, 0, 0];

    return (
        <div className="digit">
            {segments.map((on, idx) => (
                <div key={idx} className={`segment s${idx + 1} ${on ? "on" : ""}`} />
            ))}
        </div>
    );
};

const ContadorSegmentos = ({ value, length }) => {
    const digits = String(value).padStart(length, "0").split("");

    return (
        <div className="seven-segment-counter mb-3">
            {digits.map((digit, index) => (
                <Segmento7 key={index} digit={parseInt(digit)} />
            ))}
        </div>
    );
};

function Article({ asesor, tipo_asesor }) {
    // 2 contadores por grupo: A1 y B1 - A2 y B2
    const [turnos, setTurnos] = useState([0, 0]);

    const actualizarTurno = (index) => {
        setTurnos(prev =>
            prev.map((val, i) => (i === index ? Math.min(999, val + 1) : val))
        );
    };

    return (
        <div className="container-article col-11 mb-4 rounded shadow-sm p-2">
            <article className="article d-flex justify-content-start align-items-center">
                <aside className="col-10 d-flex flex-column justify-content-start align-items-start">
                    <h5 className="text-uppercase text-bold">{ asesor }</h5>
                    <h1 className="text-uppercase text-semi-bold">{ tipo_asesor }</h1>
                </aside>
                <div className="col-2 article-info d-flex flex-column justify-content-center align-items-center">
                    <ContadorSegmentos value={turnos[1]} length={2} />
                    <button className="btn btn-success mt-2" onClick={() => actualizarTurno(1)}>Actualizar</button>
                </div>
            </article>
        </div>
    )
}

Article.propTypes = {
    asesor: PropTypes.string.isRequired,
    tipo_asesor: PropTypes.string.isRequired
}

Segmento7.propTypes = {
    digit: PropTypes.number.isRequired,
};

ContadorSegmentos.propTypes = {
    value: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
}

export default Article