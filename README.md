# DigiTurnos

DigiTurnos es un sistema digital de turnos pensado para optimizar la atención en puntos de servicio. El sistema utiliza un microcontrolador ESP32 para la gestión de botones físicos y la emisión de turnos, y una aplicación web (React) para mostrar los turnos en tiempo real a los usuarios.

---

## ¿Cómo funciona DigiTurnos?

### Arquitectura general

- **ESP32**: Se encarga de gestionar los botones físicos (uno por cada tipo de turno y asesor), llevar la cuenta de los turnos y comunicarse por WebSocket con los clientes conectados.
- **Frontend React**: Se conecta al ESP32 mediante WebSocket y muestra en pantalla el turno actual, avisos de error y reseteo, y una visualización tipo display de siete segmentos.

### Flujo de funcionamiento

1. **Inicio**: El ESP32 se conecta a la red WiFi configurada y levanta un servidor WebSocket en el puerto 81.
2. **Botones físicos**: Cada botón está conectado a un pin GPIO del ESP32. Al presionar un botón, se genera un nuevo turno para el asesor y tipo correspondiente.
3. **Antirrebote**: Se utiliza la librería Bounce2 para evitar lecturas erróneas por rebotes eléctricos en los botones.
4. **Envío de turnos**: El ESP32 envía el turno generado a todos los clientes conectados por WebSocket.
5. **Visualización**: El frontend React recibe el turno y lo muestra en pantalla, junto con mensajes de error o reseteo si corresponde.

---

## Estructura del repositorio

```
digiturnos/
├── esp32/
│   ├── digiturnos.ino         # Firmware principal para ESP32
│   └── libraries/             # Librerías locales (Bounce2, WebSockets, WiFi)
└── src/
    ├── main.jsx               # Entrada principal de React
    ├── components/            # Componentes reutilizables (Article, NavBar, etc.)
    ├── pages/                 # Páginas principales (DigiTurnos.jsx)
    └── styles/                # Estilos globales
```

---

## Instalación y ejecución

### 1. Firmware ESP32

#### Requisitos

- Placa ESP32
- [Arduino IDE](https://www.arduino.cc/en/software) o [PlatformIO](https://platformio.org/)
- Cable microUSB

#### Instalación de librerías

Si usas **Arduino IDE**:
1. Abre el IDE y ve a **Programa > Incluir Librería > Añadir biblioteca .ZIP...**
2. Agrega las carpetas de `digiturnos/esp32/libraries/Bounce2`, `WebSockets` y `WiFi` si no las tienes instaladas globalmente.
3. Asegúrate de tener seleccionada la placa ESP32 correcta en **Herramientas > Placa**.

Si usas **PlatformIO**:
- Las dependencias se pueden instalar automáticamente agregando en `platformio.ini`:
    ```
    lib_deps =
      Bounce2
      Links2004/WebSockets
      espressif/arduino-esp32
    ```
- O copia las carpetas de librerías a `lib/` en tu proyecto PlatformIO.

#### Carga del firmware

1. Conecta el ESP32 por USB.
2. Abre `digiturnos.ino` en el IDE de Arduino o `main.cpp` en PlatformIO.
3. Configura tu red WiFi en las variables `ssid` y `password`.
4. Sube el código a la placa.

---

### 2. Frontend React

#### Requisitos

- Node.js (v16 o superior recomendado)
- npm o yarn

#### Instalación

```bash
cd digiturnos
npm install
```

#### Ejecución en entorno local

```bash
npm run dev
```

Abre tu navegador en la URL que te indique la consola (por defecto [http://localhost:5173](http://localhost:5173)).

#### Configuración de WebSocket

Asegúrate de que la IP y puerto del ESP32 en el frontend (archivo `DigiTurnos.jsx`) coincidan con la IP asignada a tu ESP32 en la red WiFi.

```js
// DigiTurnos.jsx
const socket = new WebSocket("ws://<IP_DEL_ESP32>:81");
```

---

## Notas adicionales

- Si tienes problemas con las rutas de las librerías en VS Code, revisa el archivo `.vscode/c_cpp_properties.json` y agrega las rutas necesarias según tu instalación.
- El sistema está pensado para que cada botón tenga una resistencia a GND y el otro extremo a 3.3V, usando lógica activa en HIGH.
- Si necesitas ayuda para adaptar el hardware o el software, revisa los comentarios en el código fuente o abre un issue.

---

¡Listo! Ahora puedes usar DigiTurnos para gestionar turnos de manera digital y visualizarlos en tiempo real.