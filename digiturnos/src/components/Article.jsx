// Lobrerías
import PropTypes from "prop-types";

/**
 * Mapeo de los segmentos encendidos para cada dígito (0-9) en un display de 7 segmentos.
 * Cada arreglo indica qué segmentos deben estar encendidos (1) o apagados (0).
 */
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



/**
 * Componente Segmento7
 * Renderiza un solo dígito en formato de display de 7 segmentos.
 * @param {number} digit - Dígito a mostrar (0-9)
 */
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

/**
 * Componente ContadorSegmentos
 * Muestra un número completo usando varios displays de 7 segmentos.
 * @param {number} value - Valor numérico a mostrar
 * @param {number} length - Cantidad de dígitos a mostrar (rellena con ceros a la izquierda)
 */
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

/**
 * Componente principal Article
 * Muestra la información del turno actual: asesor, tipo de turno y número en display de 7 segmentos.
 * Si no hay datos válidos, muestra "Esperando...".
 */
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
        <div className="container-article col-11 mb-4 p-4 d-flex justify-content-between">
            <article className="article col-12 d-flex justify-content-between align-items-center p-0">
                {/* Información del asesor y tipo de turno */}
                <aside className="col-9 d-flex flex-column justify-content-start align-items-start">
                    <h5 className="text-uppercase text-bold">Asesor { asesor } </h5>
                    <h1 className="text-uppercase text-semi-bold">{ tipo_turno }</h1>
                </aside>
                {/* Display de 7 segmentos para el número de turno */}
                <div className="col-3 article-info d-flex flex-column justify-content-center align-items-center">
                    <ContadorSegmentos value={ turno } length={ 2 } />
                </div>
            </article>
        </div>
    );
}

// Definición de tipos de propiedades para validación
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
