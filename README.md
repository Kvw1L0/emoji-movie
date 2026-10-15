# 🎬 Emoji Movie (Hollywood Edition)

Aplicación web interactiva de trivia cinematográfica en tiempo real para eventos, reuniones y competencias multijugador, diseñada para proyectores/TVs gigantes y teléfonos móviles.

---

## 🚀 Arquitectura Cloud (Vercel + Firebase Realtime)

A diferencia de un WebSocket tradicional que requiere un servidor Node.js dedicado y activo 24/7 en un VPS, **Emoji Movie** implementa una arquitectura **Serverless en la nube con Google Firebase Realtime Database** (la misma arquitectura probada en el proyecto original).

### Ventajas:
1. **Despliegue directo en Vercel:** No requiere mantener un servidor Node local corriendo; se puede publicar en Vercel con un solo clic.
2. **Sin bloqueos de conexión en móviles:** Cualquier persona en cualquier parte del mundo (red Wi-Fi o datos 4G/5G) puede entrar desde su teléfono sin problemas de firewall ni puertos cerrados.
3. **Latencia < 50ms:** Los estados de la partida, selecciones de opciones, pistas y clasificaciones se sincronizan al instante en todos los dispositivos conectados.

---

## 🌟 Estructura de Pantallas

### 1. 📺 Pantalla Gigante / TV (`/?view=tv`)
- Diseñada para proyectores o televisores grandes de la sala.
- Marquee de cine con emojis gigantes de alta visibilidad.
- Modo Cine / Pantalla Completa para ocultar barras de navegación.
- Reloj de cuenta regresiva sincronizado con alertas sonoras en los últimos 5 segundos.
- Revelación oficial con estadísticas de votación por opción de los participantes.
- Podio de campeones (1º 🥇, 2º 🥈, 3º 🥉) con confeti y fanfarria.
- Código QR interactivo dinámico (detecta automáticamente si está en Vercel o en red local).

### 2. 📱 Pantalla del Jugador (`/?view=player`)
- Optimizada 100% para celulares sin requerir instalación de apps.
- Selector de avatar y apodo con persistencia local instantánea (sin bloqueos al presionar entrar).
- Emojis de la película visibles en el propio teléfono.
- Opciones de películas **cliqueables y desclickeables** (se pueden cambiar o desmarcar antes de que termine el tiempo).
- Cálculo instantáneo de puntaje (base 1.000 pts + bono de velocidad + racha consecutiva + multiplicador x2).
- Retroalimentación inmediata con mensaje de acierto o error.

### 3. 🎛️ Panel de Administrador / Conducción (`/?view=admin`)
- Control total del flujo de la partida:
  - **Iniciar Pregunta / Siguiente / Anterior / Selector directo de película**.
  - **Pausar / Reanudar el reloj** en cualquier momento.
  - **Selector de tiempo de ronda** (10s, 15s, 20s, 30s).
  - **Revelar Respuesta** en la TV con animación.
  - **Proyectar Ranking** o **Podio Final**.
  - 💡 **Lanzar Pistas en vivo (Hints):** Pista 1 (año y género) y Pista 2 (director/frase).
  - ⚡ **Ronda Relámpago (Puntos x2):** Multiplicador doble para preguntas decisivas.
  - 👥 **Moderación de jugadores:** Monitor de participantes y botón para expulsar.
  - ➕ **Creador de películas en vivo:** Agregar nuevas preguntas con emojis al vuelo.
  - 🔊 **Botonera de efectos de sonido (SFX)**.
  - 🔄 **Reiniciar Partida**.

---

## 📦 Despliegue en Vercel

### Paso 1: Conectar repositorio en Vercel
1. Ingresa a [Vercel](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New Project** e importa el repositorio `Kvw1L0/emoji-movie`.
3. Vercel detectará automáticamente la configuración gracias a los archivos `vercel.json`:
   - **Framework:** Vite
   - **Build Command:** `cd client && npm install && npm run build`
   - **Output Directory:** `client/dist`
4. Haz clic en **Deploy**.

¡Y listo! Tu app estará disponible en una URL pública `https://emoji-movie-xxx.vercel.app`.

---

## 💻 Ejecución Local en Desarrollo

Para probar localmente:
```bash
cd "Emoji Movie/client"
npm.cmd run dev
```
Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.
