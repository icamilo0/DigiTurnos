#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Bounce2.h>

// Credenciales WiFi
const char* ssid = "SSID";
const char* password = "PASSWORD";


// Pines de botones
const int Ase1_Gn = 2;   // Asesor 1 - General (D2)
const int Ase1_Cn = 4;   // Asesor 1 - Consignaciones (D4)
const int Ase2_Gn = 5;   // Asesor 2 - General (D5)
const int Ase2_Cn = 18;  // Asesor 2 - Consignaciones (D18)

// Contadores únicos
int contadorGeneral = 0;
int contadorConsignacion = 0;

// Límites de rango
const int limiteGeneral = 30;
const int limiteConsignacion = 9;

// Variables para control de tiempoDe cuanto m
unsigned long lastTurnTime = 0;
const unsigned long delayBetweenTurns = 5000; // 5 segundos entre turnos
unsigned long buttonPressStartTime[4] = {0, 0, 0, 0}; // para reinicio
unsigned long tiempoInicio = 0;
const unsigned long tiempoEsperaInicial = 10000; // 10 segundos de espera al inicio


// WebSocket en puerto 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Objetos Bounce para cada botón
Bounce debouncerP1 = Bounce(); // Ase1_Gn (D2)
Bounce debouncerP2 = Bounce(); // Ase1_Cn (D4)
Bounce debouncerP3 = Bounce(); // Ase2_Gn (D5)
Bounce debouncerP4 = Bounce(); // Ase2_Cn (D18)

// Prototipos de funciones
void setupWiFi();
void onWebSocketEvent(uint8_t client_num, WStype_t type, uint8_t * payload, size_t length);
void enviarTurno(String msg);
void checkResetButton(bool pressed, int index, unsigned long now);
String formatTurno(String tipo, String asesor, int num);

void setup() {
    Serial.begin(115200);
    tiempoInicio = millis();

    // Configurar pines con pull-up interno
    pinMode(Ase1_Gn, INPUT_PULLUP);
    pinMode(Ase1_Cn, INPUT_PULLUP);
    pinMode(Ase2_Gn, INPUT_PULLUP);
    pinMode(Ase2_Cn, INPUT_PULLUP);

    // Asociar cada pin al debouncer con intervalo de 100 ms
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

    // Actualizar estados debounce
    debouncerP1.update();
    debouncerP2.update();
    debouncerP3.update();
    debouncerP4.update();

    unsigned long now = millis();

    // Contar cuántos botones están presionados (activo LOW)
    int pressedCount = (debouncerP1.read() == LOW ? 1 : 0) +
                    (debouncerP2.read() == LOW ? 1 : 0) +
                    (debouncerP3.read() == LOW ? 1 : 0) +
                    (debouncerP4.read() == LOW ? 1 : 0);

    // Manejo de colisión: si hay más de un botón presionado, enviar ERROR
    if (pressedCount > 1) {
        enviarTurno("ERROR");
        return;
    }

    // Ignorar reset durante los primeros 10 segundos
    if (now - tiempoInicio > tiempoEsperaInicial) {
        checkResetButton(debouncerP1.read() == LOW, 0, now);
        checkResetButton(debouncerP2.read() == LOW, 1, now);
        checkResetButton(debouncerP3.read() == LOW, 2, now);
        checkResetButton(debouncerP4.read() == LOW, 3, now);
    } else {
        // Evitar acumulación del tiempo de pulsación
        for (int i = 0; i < 4; i++) {
            buttonPressStartTime[i] = 0;
        }
    }

    // Evitar emitir turnos seguidos sin esperar 5s
    if (now - lastTurnTime < delayBetweenTurns) return;

    // Emitir turno solo en la transición de botón presionado (falling edge)
    if (debouncerP1.fell()) { // Asesor 1 - General (D2)
        enviarTurno(formatTurno("Gn - A1", "Asesor 1", contadorGeneral));
        contadorGeneral = (contadorGeneral % limiteGeneral) + 1;
        lastTurnTime = now;
    } else if (debouncerP3.fell()) { // Asesor 2 - General (D5)
        enviarTurno(formatTurno("Gn - A2", "Asesor 2", contadorGeneral));
        contadorGeneral = (contadorGeneral % limiteGeneral) + 1;
        lastTurnTime = now;
    } else if (debouncerP2.fell()) { // Asesor 1 - Consignaciones (D4)
        enviarTurno(formatTurno("Cn", "Asesor 1", contadorConsignacion));
        contadorConsignacion = (contadorConsignacion % limiteConsignacion) + 1;
        lastTurnTime = now;
    } else if (debouncerP4.fell()) { // Asesor 2 - Consignaciones (D18)
        enviarTurno(formatTurno("Cn", "Asesor 2", contadorConsignacion));
        contadorConsignacion = (contadorConsignacion % limiteConsignacion) + 1;
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
            Serial.println("RESET");
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

// Eventos WebSocket (Conexiones externas a traves de la IP)
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