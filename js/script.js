function toggleMenu() {
  document.getElementById("menuOpciones").classList.toggle("d-none");
}

function mostrar(id) {
  // Ocultar todas las secciones
  document.querySelectorAll("main section").forEach(sec => sec.classList.add("d-none"));
  // Mostrar la sección solicitada
  document.getElementById(id).classList.remove("d-none");

  // Quitar clase activo de todos los botones del menú
  document.querySelectorAll("#menuOpciones button").forEach(btn => btn.classList.remove("btn-activo"));

  // Poner clase activo solo al botón correspondiente
  const botones = {
    seccion1: 0,
    seccion2: 1,
    seccion3: 2
  };
  const btns = document.querySelectorAll("#menuOpciones button");
  btns[botones[id]].classList.add("btn-activo");

  if (id === "seccion3") mostrarRecords();
}


let tablero = [], filas, columnas, minas;
let celdasReveladas = 0, totalCeldas = 0, banderasUsadas = 0;
let juegoTerminado = false, tiempoInicio, intervaloTiempo;
let primeraCelda = true;

function iniciarJuego(f, c, m) {
  filas = f; columnas = c; minas = m;
  totalCeldas = f * c; celdasReveladas = 0;
  tablero = []; juegoTerminado = false;
  primeraCelda = true;
  banderasUsadas = 0;
  document.getElementById("banderas").textContent = `Banderas: 0 / ${minas}`;
  document.getElementById("tiempo").textContent = "Tiempo: 0s";
  clearInterval(intervaloTiempo);

  for (let i = 0; i < filas; i++) {
    tablero[i] = [];
    for (let j = 0; j < columnas; j++) {
      tablero[i][j] = { mina: false, revelada: false, numero: 0, bandera: false };
    }
  }

  const tableroDiv = document.getElementById("tablero");
  tableroDiv.style.gridTemplateColumns = `repeat(${columnas}, 30px)`;
  tableroDiv.innerHTML = "";

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const celda = document.createElement("div");
      celda.className = "celda";
      celda.dataset.fila = i;
      celda.dataset.columna = j;

      celda.oncontextmenu = e => {
        e.preventDefault();
        colocarBandera(i, j, celda);
      };
      celda.onclick = () => clickCelda(i, j, celda);
      tableroDiv.appendChild(celda);
    }
  }
}

function clickCelda(i, j, celda) {
  if (primeraCelda) {
    generarMinas(i, j);
    iniciarTemporizador();
    primeraCelda = false;
  }
  revelarCelda(i, j, celda);
}

function generarMinas(x0, y0) {
  let colocadas = 0;
  while (colocadas < minas) {
    let x = Math.floor(Math.random() * filas);
    let y = Math.floor(Math.random() * columnas);

    const distancia = Math.abs(x - x0) <= 1 && Math.abs(y - y0) <= 1;
    if (!tablero[x][y].mina && !(x === x0 && y === y0) && !distancia) {
      tablero[x][y].mina = true;
      colocadas++;
    }
  }

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (tablero[i][j].mina) continue;
      let n = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let ni = i + dx, nj = j + dy;
          if (ni >= 0 && ni < filas && nj >= 0 && nj < columnas && tablero[ni][nj].mina) n++;
        }
      }
      tablero[i][j].numero = n;
    }
  }
}

function iniciarTemporizador() {
  tiempoInicio = Date.now();
  intervaloTiempo = setInterval(() => {
    const t = Math.floor((Date.now() - tiempoInicio) / 1000);
    document.getElementById("tiempo").textContent = `Tiempo: ${t}s`;
  }, 1000);
}

function revelarCelda(i, j, celda) {
  const casilla = tablero[i][j];
  if (casilla.revelada || casilla.bandera || juegoTerminado) return;

  casilla.revelada = true;
  celda.classList.add("revelada");

  if (casilla.mina) {
  celda.textContent = "💣";
  juegoTerminado = true;
  clearInterval(intervaloTiempo);
  mostrarTodasLasMinas();
  mostrarResultadoFinal(false);
  guardarRecord(false);
  return;
}


  celdasReveladas++;
  if (casilla.numero > 0) {
    celda.textContent = casilla.numero;
  } else {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const ni = i + dx, nj = j + dy;
        if (ni >= 0 && ni < filas && nj >= 0 && nj < columnas) {
          const vecina = document.querySelector(`[data-fila="${ni}"][data-columna="${nj}"]`);
          revelarCelda(ni, nj, vecina);
        }
      }
    }
  }

  if (celdasReveladas === totalCeldas - minas) {
  juegoTerminado = true;
  clearInterval(intervaloTiempo);
  mostrarTodasLasMinas(true);
  mostrarResultadoFinal(true);
  guardarRecord(true);
}

}

function colocarBandera(i, j, celda) {
  const casilla = tablero[i][j];
  if (casilla.revelada || juegoTerminado) return;

  if (casilla.bandera) {
    casilla.bandera = false;
    celda.classList.remove("bandera", "bandera-correcta");
    celda.textContent = "";
    banderasUsadas--;
  } else if (banderasUsadas < minas) {
    casilla.bandera = true;
    celda.textContent = "🚩";
    celda.classList.add("bandera");
    banderasUsadas++;
  }
  document.getElementById("banderas").textContent = `Banderas: ${banderasUsadas} / ${minas}`;
}

function mostrarTodasLasMinas(ganaste = false) {
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const celda = document.querySelector(`[data-fila="${i}"][data-columna="${j}"]`);
      const casilla = tablero[i][j];

      if (casilla.mina) {
        if (casilla.bandera) {
          celda.classList.add("bandera-correcta");
        } else {
          celda.textContent = "💣";
          celda.classList.add("revelada", "bomba-roja"); // ⬅️ aquí
        }
      } else if (casilla.bandera && !casilla.mina) {
        celda.textContent = "❌";
      }
    }
  }
}


function guardarRecord(gano) {
  const tiempo = Math.floor((Date.now() - tiempoInicio) / 1000);
  const fecha = new Date().toLocaleString();
  const nombre = document.getElementById("nombreJugador").value.trim() || "Jugador Anónimo";

  const registros = JSON.parse(localStorage.getItem("records") || "[]");
  registros.push({ nombre, tiempo, resultado: gano ? "Victoria" : "Derrota", fecha });
  localStorage.setItem("records", JSON.stringify(registros));
}

function mostrarRecords() {
  const lista = document.getElementById("lista-records");
  lista.innerHTML = "";
  const registros = JSON.parse(localStorage.getItem("records") || "[]");

  if (registros.length === 0) {
    lista.innerHTML = "<li class='list-group-item'>No hay récords.</li>";
  } else {
    registros.forEach((r, idx) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = `Intento ${idx + 1}: ${r.nombre} - (${r.fecha}) ${r.tiempo}s - ${r.resultado}`;
      lista.appendChild(li);
    });
  }
}



function iniciarJuegoDesdeSelect() {
  const dif = document.getElementById("dificultad").value;
  if (dif === "facil") iniciarJuego(8, 8, 10);
  else if (dif === "media") iniciarJuego(12, 12, 25);
  else if (dif === "dificil") iniciarJuego(16, 16, 50);
}

function reiniciarTablero() {
  iniciarJuegoDesdeSelect();
}

function reiniciarRecords() {
  localStorage.removeItem("records");
  mostrarRecords();
  mostrarModalMensaje("Récords eliminados.", "img/reiniciar-record.gif");
}




document.getElementById("btnReintentar").addEventListener("click", () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalResultado"));
  modal.hide();
  reiniciarTablero();
});

function mostrarModalResultado(mensaje, esVictoria) {
  const mensajeTexto = document.getElementById("mensajeTexto");
  const gif = document.getElementById("modalGif");

  mensajeTexto.textContent = mensaje;
  if (esVictoria) {
    gif.src = "img/victoria.gif";   // Ruta a tu gif de victoria
  } else {
    gif.src = "img/derrota.gif";    // Ruta a tu gif de derrota
  }

  // Mostrar el modal con Bootstrap 5
  const modal = new bootstrap.Modal(document.getElementById("modalResultado"));
  modal.show();
}

function mostrarResultadoFinal(esVictoria) {
  const nombreInput = document.getElementById("nombreJugador");
  const nombre = nombreInput && nombreInput.value.trim() ? nombreInput.value.trim() : "Jugador Anónimo";
  
  const mensaje = esVictoria
    ? `¡Ganaste, ${nombre}!`
    : `¡Perdiste, ${nombre}!`;

  // Cambiar el título del modal (opcional)
  const tituloModal = document.getElementById("tituloModalResultado");
  if (tituloModal) {
    tituloModal.textContent = "Resultado del Juego";
  }

  mostrarModalResultado(mensaje, esVictoria);
}



function mostrarModalMensaje(texto, gifSrc = null) {
  const contenedor = document.getElementById("contenidoModalMensajeGeneral");
  contenedor.textContent = texto;

  const gif = document.getElementById("gifModalMensajeGeneral");

  if (gifSrc) {
    gif.src = gifSrc;
    gif.style.display = "block";
  } else {
    gif.style.display = "none";
  }

  const modal = new bootstrap.Modal(document.getElementById("modalMensajeGeneral"));
  modal.show();
}



mostrar('seccion1');
