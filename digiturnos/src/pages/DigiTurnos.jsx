// Librerías
import { useEffect, useState } from "react";

// Componentes
import Navbar from "../components/NavBar";
import Article from "../components/Article";

function DigiTurnos() {
    const [turno, setTurno] = useState({
        tipo_turno: "Esperando...",
        asesor: null,
        numero: null,
    });
    const [mensajeError, setMensajeError] = useState("");

    useEffect(() => {
        // IP de prueba
        const socket = new WebSocket("ws://192.168.71.249:81");

        socket.onmessage = (event) => {
            const msg = event.data;

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

            const regex = /^(Gn - A[12]|Cn) - (Asesor [12]) - (\d{2})$/;
            const match = msg.match(regex);

            if (match) {
                const [, tipo_raw, asesorStr, turnoStr] = match;

                const asesor_num = asesorStr.endsWith("1") ? 1 : 2;
                const turno_num = parseInt(turnoStr, 10);

                setTurno({
                    tipo_turno: tipo_raw, // Guarda el texto exacto recibido
                    asesor: asesor_num,
                    numero: turno_num,
                });
            } else {
                console.warn("Mensaje no reconocido:", msg);
            }
        };

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="min-vh-100 col-12 bg-color-50 py-4 d-flex flex-column align-items-center">
            <Navbar name_to_page="DigiTurnos" to_page="/turnos" />

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
