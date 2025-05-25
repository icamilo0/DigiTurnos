// Librerías
import { useEffect, useState } from "react";

// Componentes
import Navbar from "../components/NavBar";
import Article from "../components/Article";

function DigiTurnos() {
    const [turno, setTurno] = useState({
        tipo_turno: "Esperando...",
        asesor: null,
        numero: 25,
    });

    useEffect(() => {
        // IP de prueba
        const socket = new WebSocket("ws://192.168.1.100:81"); // CAMBIAR LA PI POR LA IP DEL WEBSOCKET

        socket.onmessage = (event) => {
            const msg = event.data;

            if (msg === "ERROR" || msg === "RESET") {
                // Aquí puedes manejar mensajes especiales si quieres
                return;
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
        <div className="min-vh-100 col-12 bg-color-50 py-3 d-flex flex-column align-items-center">
            <Navbar name_to_page="DigiTurnos" to_page="/turnos" />

            <div className="col-10 d-flex flex-column justify-content-center align-items-center">
                <div className="mx-0 mt-0 mb-3 d-flex gap-5">
                    <h5><span className="fw-bold">GN:</span> General</h5>
                    <h5><span className="fw-bold">CN:</span> Consignaciones</h5>
                </div>

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
