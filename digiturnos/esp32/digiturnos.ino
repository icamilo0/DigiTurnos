#include <WiFi.h>
#include <WebSocketsServer.h>

// Credenciales WiFi
const char* ssid = "FLIA_MERCADO_ARIZA_2.4G";
const char* password = "26880332";


// Pines de botones
const int Ase1_Gn = 18; // Asesor 1 - General (P1)
const int Ase1_Cn = 2;  // Asesor 1 - Consignaciones (P2)
const int Ase2_Gn = 4;  // Asesor 2 - General (P3)
const int Ase2_Cn = 5;  // Asesor 2 - Consignaciones (P4)

// Contadores únicos
int contadorGeneral = 1;
int contadorConsignacion = 1;

// Límites de rango
const int limiteGeneral = 30;
const int limiteConsignacion = 9;

// Variables para control de tiempo
unsigned long lastTurnTime = 0;
const unsigned long delayBetweenTurns = 5000; // 5 segundos entre turnos
unsigned long buttonPressStartTime[4] = {0, 0, 0, 0}; // para reinicio

// WebSocket en puerto 81
WebSocketsServer webSocket = WebSocketsServer(81);

void setup() {
    Serial.begin(115200);

    // Pines
    pinMode(Ase1_Gn, INPUT);
    pinMode(Ase1_Cn, INPUT);
    pinMode(Ase2_Gn, INPUT);
    pinMode(Ase2_Cn, INPUT);

    // Iniciar conexión WiFi
    setupWiFi();

    // Iniciar WebSocket
    webSocket.begin();
    webSocket.onEvent(onWebSocketEvent);
}

void loop() {
    webSocket.loop();

    // Leer estado botones (activo LOW)
    bool p1 = digitalRead(Ase1_Gn) == HIGH;
    bool p2 = digitalRead(Ase1_Cn) == HIGH;
    bool p3 = digitalRead(Ase2_Gn) == HIGH;
    bool p4 = digitalRead(Ase2_Cn) == HIGH;

    int pressedCount = p1 + p2 + p3 + p4;

    // Manejo de colisión (error E)
    unsigned long now = millis();

    if (pressedCount > 1) {
        enviarTurno("ERROR");
        return;
    }

    // Verificar reinicio (botón presionado 15s)
    checkResetButton(p1, 0, now);
    checkResetButton(p2, 1, now);
    checkResetButton(p3, 2, now);
    checkResetButton(p4, 3, now);

    // Evitar emitir turnos seguidos sin esperar 5s
    if (now - lastTurnTime < delayBetweenTurns) return;

    // Emitir turno según botón
    if (p1) {
        enviarTurno(formatTurno("Gn - A1", contadorGeneral));
        contadorGeneral = (contadorGeneral % limiteGeneral) + 1;
        lastTurnTime = now;
    } else if (p3) {
        enviarTurno(formatTurno("Gn - A2", contadorGeneral));
        contadorGeneral = (contadorGeneral % limiteGeneral) + 1;
        lastTurnTime = now;
    } else if (p2 || p4) {
        enviarTurno(formatTurno("Cn", contadorConsignacion));
        contadorConsignacion = (contadorConsignacion % limiteConsignacion) + 1;
        lastTurnTime = now;
    }
}

// Función para formatear turnos
String formatTurno(String tipo, int num) {
    return tipo + " " + (num < 10 ? "0" : "") + String(num);
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
            contadorGeneral = 1;
            contadorConsignacion = 1;
            enviarTurno("RESET");
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