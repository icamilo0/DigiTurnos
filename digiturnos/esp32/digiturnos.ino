#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Bounce2.h>

// Credenciales WiFi
const char* ssid = "Camilo";
const char* password = "redmin13";


// Pines de botones
const int Ase1_Gn = 18; // Asesor 1 - General (P1)
const int Ase1_Cn = 2;  // Asesor 1 - Consignaciones (P2)
const int Ase2_Gn = 14;  // Asesor 2 - General (P3)
const int Ase2_Cn = 12;  // Asesor 2 - Consignaciones (P4)

// Contadores únicos
int contadorGeneral = 0;
int contadorConsignacion = 0;

// Límites de rango
const int limiteGeneral = 30;
const int limiteConsignacion = 9;

// Variables para control de tiempo
unsigned long lastTurnTime = 0;
const unsigned long delayBetweenTurns = 5000; // 5 segundos entre turnos
unsigned long buttonPressStartTime[4] = {0, 0, 0, 0}; // para reinicio

// WebSocket en puerto 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Objetos Bounce para cada botón
Bounce debouncerP1 = Bounce();
Bounce debouncerP2 = Bounce();
Bounce debouncerP3 = Bounce();
Bounce debouncerP4 = Bounce();

// Prototipos de funciones
void setupWiFi();
void onWebSocketEvent(uint8_t client_num, WStype_t type, uint8_t * payload, size_t length);
void enviarTurno(String msg);
void checkResetButton(bool pressed, int index, unsigned long now);
String formatTurno(String tipo, String asesor, int num);

// Variables para testeo automático
bool modoTest = false; // Cambia a false para volver al modo normal
unsigned long ultimoEnvioTest = 0;
int turnoTest = 1;

void setup() {
    Serial.begin(115200);

    // Pines
    pinMode(Ase1_Gn, INPUT_PULLUP);
    pinMode(Ase1_Cn, INPUT_PULLUP);
    pinMode(Ase2_Gn, INPUT_PULLUP);
    pinMode(Ase2_Cn, INPUT_PULLUP);

  // Asociar cada pin al identificador de rebote - 50 ms ignorando lecturas del pulsado
    debouncerP1.attach(Ase1_Gn);
    debouncerP1.interval(100);

    debouncerP2.attach(Ase1_Cn);
    debouncerP2.interval(100);

    debouncerP3.attach(Ase2_Gn);
    debouncerP3.interval(100);

    debouncerP4.attach(Ase2_Cn);
    debouncerP4.interval(100);

    // Iniciar conexión WiFi
    setupWiFi();

    // Iniciar WebSocket
    webSocket.begin();
    webSocket.onEvent(onWebSocketEvent);
}

void loop() {
    webSocket.loop();

    if (modoTest) {
        unsigned long ahora = millis();
        if (ahora - ultimoEnvioTest >= 3000) { // Cada 3 segundos
            // Alterna entre los diferentes tipos de turnos para testear
            if (turnoTest == 1) {
                enviarTurno(formatTurno("Gn - A1", "Asesor 1", turnoTest));
            } else if (turnoTest == 2) {
                enviarTurno("RESET");
            } else if (turnoTest == 3) {
                enviarTurno(formatTurno("Gn - A2", "Asesor 2", turnoTest));
            } else if (turnoTest == 4) {
                enviarTurno(formatTurno("Cn", "Asesor 1", turnoTest));
            } else if (turnoTest == 5) {
                enviarTurno("ERROR");
            } else {
                enviarTurno(formatTurno("Cn", "Asesor 2", turnoTest));
                turnoTest = 0;
            }
            turnoTest++;
            ultimoEnvioTest = ahora;
        }
        return; // Salta la lógica normal de botones
    }

  // Actualizar estado del identificador de rebote
    debouncerP1.update();
    debouncerP2.update();
    debouncerP3.update();
    debouncerP4.update();

    // Leer estado botones (activo LOW)
    bool p1 = debouncerP1.read() == LOW;
    bool p2 = debouncerP2.read() == LOW;
    bool p3 = debouncerP3.read() == LOW;
    bool p4 = debouncerP4.read() == LOW;

    int pressedCount = p1 + p2 + p3 + p4;

    // Manejo de colisión (error E)
    unsigned long now = millis();

    if (pressedCount > 1) {
        enviarTurno("ERROR");
        Serial.print("ERROR");
        return;
    }

    // Verificar reinicio (botón presionado 8s)
    checkResetButton(p1, 0, now);
    checkResetButton(p2, 1, now);
    checkResetButton(p3, 2, now);
    checkResetButton(p4, 3, now);

    // Evitar emitir turnos seguidos sin esperar 5s
    if (now - lastTurnTime < delayBetweenTurns) return;

    // ...en tu loop, antes de la lógica de turnos
    Serial.printf("P1:%d P2:%d P3:%d P4:%d\n", p1, p2, p3, p4);

    // Emitir turno según botón
    if (p1) {
        enviarTurno(formatTurno("Gn - A1", "Asesor 1", contadorGeneral));
        contadorGeneral = (contadorGeneral % limiteGeneral) + 1;
        Serial.print("Gn - A1 | Asesor 1 | Turno: " + contadorGeneral);
        lastTurnTime = now;
    } else if (p3) {
        enviarTurno(formatTurno("Gn - A2", "Asesor 2", contadorGeneral));
        contadorGeneral = (contadorGeneral % limiteGeneral) + 1;
        Serial.print("Gn - A2 | Asesor 2 | Turno: " + contadorGeneral);
        lastTurnTime = now;
    } else if (p2) {
        enviarTurno(formatTurno("Cn", "Asesor 1", contadorConsignacion));
        contadorConsignacion = (contadorConsignacion % limiteConsignacion) + 1;
        Serial.print("Cn | Asesor 1 | Turno: " + contadorConsignacion);
        lastTurnTime = now;
    } else if (p4) {
        enviarTurno(formatTurno("Cn", "Asesor 2", contadorConsignacion));
        contadorConsignacion = (contadorConsignacion % limiteConsignacion) + 1;
        Serial.print("Cn | Asesor 2 | Turno: " + contadorConsignacion);
        lastTurnTime = now;
    }
}

// Función para formatear turnos
String formatTurno(String tipo, String asesor, int num) {
    return tipo + " - " + asesor + " - " + (num < 10 ? "0" : "") + String(num);
}

// Enviar a todos los clientes
void enviarTurno(String msg) {
    Serial.println("Turno: " + msg);
    webSocket.broadcastTXT(msg);
}

// Reset si un botón se mantiene 8s
void checkResetButton(bool pressed, int index, unsigned long now) {
    if (pressed) {
        if (buttonPressStartTime[index] == 0) {
            buttonPressStartTime[index] = now;
        } else if (now - buttonPressStartTime[index] >= 8000) {
            contadorGeneral = 0;
            contadorConsignacion = 0;
            enviarTurno("RESET");
            Serial.print("RESET");
            buttonPressStartTime[index] = 0;
        }
    } else {
        buttonPressStartTime[index] = 0;
    }
}

// Configuración de conexión a WiFi
void setupWiFi() {
    WiFi.mode(WIFI_STA);          // Modo cliente (station)
    WiFi.begin(ssid, password);   // Conecta a la red

    Serial.print("Conectando a WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi conectado!");
    Serial.print("IP asignada: ");
    Serial.println(WiFi.localIP().toString());
}

// Eventos WebSocket
void onWebSocketEvent(uint8_t client_num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED:
            Serial.printf("Cliente %u conectado\n", client_num);
        break;
        case WStype_DISCONNECTED:
            Serial.printf("Cliente %u desconectado\n", client_num);
        break;
            default:
        break;
    }
}