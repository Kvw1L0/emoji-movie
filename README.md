# 🎬 Emoji Movie (Hollywood Edition)

Aplicación web interactiva en tiempo real inspirada en Kahoot y Jackbox Games para eventos, reuniones familiares y competencias de trivia cinematográfica.

---

## 🌟 Estructura de Pantallas

### 1. 📺 Pantalla Gigante / TV (`/?view=tv`)
- Diseñada para proyectores o televisores grandes de la sala.
- Muestra la secuencia de emoticones con estilo cinematográfico neón Hollywood.
- Temporizador gigante sincronizado con alertas sonoras en los últimos 5 segundos.
- Contador de respuestas recibidas en tiempo real.
- Pantalla de revelación con estadísticas de votación de los jugadores por opción.
- Podio de campeones (1º 🥇, 2º 🥈, 3º 🥉) y ranking con confeti y fanfarria.
- Código QR interactivo permanente para unirse desde celulares.

### 2. 📱 Pantalla del Jugador (`/?view=player`)
- Optimizada 100% para celulares sin requerir instalación de apps.
- Selector de avatar/emoji y apodo de participante.
- Emojis de la película visibles en el propio teléfono.
- Opciones de películas **cliqueables y desclickeables** (pueden cambiar de opinión o desmarcar antes de que termine el tiempo).
- Cálculo instantáneo de puntaje (base 1.000 pts + bono de velocidad + racha consecutiva + multiplicador x2).
- Retroalimentación inmediata con mensaje de acierto o error.

### 3. 🎛️ Panel de Administrador / Conducción (`/?view=admin`)
- Control total del flujo de la partida:
  - **Iniciar Pregunta / Pasar a Siguiente / Volver a Anterior**.
  - **Pausar / Reanudar el reloj** en cualquier momento.
  - **Selector de tiempo de ronda** (10s, 15s, 20s, 30s, 45s).
  - **Revelar Respuesta** en la TV con animación.
  - **Proyectar Ranking** o **Podio Final**.
  - 💡 **Lanzar Pistas en vivo (Hints):** Pista 1 (año y género) y Pista 2 (frase/director).
  - ⚡ **Ronda Relámpago (Puntos x2):** Multiplicador doble para preguntas decisivas.
  - 👥 **Moderación de jugadores:** Ver quién ya respondió y expulsar trolls.
  - ➕ **Creador de películas en vivo:** Agregar nuevas preguntas con emojis personalizados.
  - 🔊 **Botonera de efectos de sonido (SFX):** Disparar aplausos, redobles de tambor, fanfarrias y aciertos.
  - 🔄 **Reiniciar Partida**.

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Iniciar Servidor y Cliente por separado
En una terminal:
```bash
cd "Emoji Movie/server"
npm.cmd run dev
```

En otra terminal:
```bash
cd "Emoji Movie/client"
npm.cmd run dev
```

### URLs de Acceso:
- **Pantalla Gigante (TV):** `http://localhost:5173/?view=tv`
- **Pantalla de Jugadores (Celulares en la misma red Wi-Fi):** `http://<IP-LOCAL>:5173/?view=player` (o escaneando el QR en la TV)
- **Panel de Administrador:** `http://localhost:5173/?view=admin`
