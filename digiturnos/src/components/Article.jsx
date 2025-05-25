import PropTypes from "prop-types";

// Mapeo de los segmentos encendidos por dígito
const SegmentosDigitales = {
    0: [1,1,1,1,1,1,0],
    1: [0,1,1,0,0,0,0],
    2: [1,1,0,1,1,0,1],
    3: [1,1,1,1,0,0,1],
    4: [0,1,1,0,0,1,1],
    5: [1,0,1,1,0,1,1],
    6: [1,0,1,1,1,1,1],
    7: [1,1,1,0,0,0,0],
    8: [1,1,1,1,1,1,1],
    9: [1,1,1,1,0,1,1],
};

const Segmento7 = ({ digit }) => {
    const segments = SegmentosDigitales[digit] || [0,0,0,0,0,0,0];
    return (
        <div className="digit">
            {segments.map((on, idx) => (
                <div key={idx} className={`segment s${idx+1} ${on ? "on" : ""}`} />
            ))}
        </div>
    );
};

const ContadorSegmentos = ({ value, length }) => {
    const digits = String(value).padStart(length, "0").split("");
    return (
        <div className="seven-segment-counter mb-3">
            {digits.map((digit, idx) => (
                <Segmento7 key={idx} digit={parseInt(digit, 10)} />
            ))}
        </div>
    );
};

function Article({ tipo_turno, asesor, turno }) {
  // Mostrar mensaje "Esperando" si no hay datos válidos
    if (!tipo_turno || tipo_turno === "" || asesor == null || turno == null) {
        return (
            <div className="container-article col-11 mb-4 p-4 d-flex justify-content-center align-items-center">
                <h2 className="text-medium fs-1">Esperando...</h2>
            </div>
        );
    }

    return (
        <div className="container-article d-flex flex-column flex-grow-1 col-11 mb-4 p-4">
            <article className="article d-flex justify-content-between align-items-center">
                <aside className="col-auto d-flex flex-column justify-content-start align-items-start">
                    <h5 className="text-uppercase text-bold">{ asesor } </h5>
                    <h1 className="text-uppercase text-semi-bold">{ tipo_turno }</h1>
                </aside>
                <div className="col-auto article-info d-flex flex-column justify-content-center align-items-center">
                    <ContadorSegmentos value={ turno } length={ 2 } />
                </div>
            </article>
        </div>
    );
}

Article.propTypes = {
    tipo_turno: PropTypes.string,
    asesor: PropTypes.number,
    numero: PropTypes.number,
};

ContadorSegmentos.propTypes = {
    value: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
};

export default Article;
