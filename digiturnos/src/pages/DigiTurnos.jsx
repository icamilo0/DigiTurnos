// Librerías
import { useEffect, useState } from "react";

// Componentes
import Navbar from "../components/NavBar";
import Article from "../components/Article";

/**
 * Página principal de DigiTurnos.
 * Se conecta por WebSocket al ESP32 y muestra el turno actual.
 */
function DigiTurnos() {
    // Estado para el turno actual recibido del ESP32
    const [turno, setTurno] = useState({
        tipo_turno: "Esperando...",
        asesor: null,
        numero: null,
    });

    // Estado para mensajes de error o reset
    const [mensajeError, setMensajeError] = useState("");

    useEffect(() => {
        // Conexión WebSocket al ESP32 (reemplazar <IP_DEL_ESP32> por la IP real)
        const socket = new WebSocket("ws://<IP_DEL_ESP32>:81");

        // Manejo de mensajes recibidos por WebSocket
        socket.onmessage = (event) => {
            const msg = event.data;

            // Si el mensaje es de error o reset, mostrar alerta
            if (msg === "ERROR" || msg === "RESET") {
                setMensajeError(
                    msg === "ERROR"
                        ? "Ocurrió un error en la comunicación."
                        : "El sistema fue reiniciado."
                );
                return;
            } else {
                setMensajeError(""); // Limpia el mensaje si llega uno válido
            }

            // Expresión regular para extraer tipo, asesor y número de turno
            const regex = /^(Gn - A[12]|Cn) - (Asesor [12]) - (\d{2})$/;
            const match = msg.match(regex);

            if (match) {
                const [, tipo_raw, asesorStr, turnoStr] = match;

                // Determina el número de asesor (1 o 2)
                const asesor_num = asesorStr.endsWith("1") ? 1 : 2;
                // Convierte el número de turno a entero
                const turno_num = parseInt(turnoStr, 10);

                // Actualiza el estado con el turno recibido
                setTurno({
                    tipo_turno: tipo_raw, // Guarda el texto exacto recibido
                    asesor: asesor_num,
                    numero: turno_num,
                });
            } else {
                // Si el mensaje no coincide con el formato esperado, muestra un error
                setMensajeError("Mensaje no reconocido: " + msg);
            }
        };

        // Limpia la conexión WebSocket al desmontar el componente
        return () => {
            socket.close();
        };
    }, []);

    return (
        // Contenedor principal con altura completa y estilos de Bootstrap
        <div className="min-vh-100 col-12 bg-color-50 py-4 d-flex flex-column align-items-center">
            {/* Barra de navegación */}
            <Navbar name_to_page="DigiTurnos" to_page="/turnos" />

            {/* Leyenda de tipos de turno */}
            <div className="col-4 mx-0 mt-0 d-flex justify-content-between align-items-center">
                <h5><span className="fw-bold">GN:</span> General</h5>
                <h5><span className="fw-bold">CN:</span> Consignaciones</h5>
            </div>

            {/* Mostrar mensaje de error si existe */}
            {mensajeError && (
                <div className="alert alert-warning col-6 text-center my-3">
                    {mensajeError}
                </div>
            )}

            {/* Contenedor del turno actual, ocupa el espacio vertical restante */}
            <div className="col-10 d-flex flex-column justify-content-center align-items-center h-100 flex-grow-1">
                <Article
                    tipo_turno={turno.tipo_turno}
                    asesor={turno.asesor}
                    turno={turno.numero}
                />
            </div>
        </div>
    );
}

export default DigiTurnos;