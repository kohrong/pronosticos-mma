/**
 * Locos x las MMA - Sistema de Clasificación de Pronósticos
 * Usa Wilson Score para un ranking justo
 */

// Configuración
const DATA_URL = 'datos/pronosticos.json';
const PELEADORES_URL = 'datos/peleadores.json';
const PARTICIPANTES_URL = 'datos/participantes.json';

// Estado global
let data = null;
let peleadores = null;
let participantes = null;

// Inicialización
document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const [pronosticosRes, peleadoresRes, participantesRes] = await Promise.all([
            fetch(DATA_URL),
            fetch(PELEADORES_URL),
            fetch(PARTICIPANTES_URL)
        ]);
        data = await pronosticosRes.json();
        const peleadoresData = await peleadoresRes.json();
        peleadores = peleadoresData.peleadores;
        const participantesData = await participantesRes.json();
        participantes = participantesData.participantes;
        renderAll();
        setupEventListeners();
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error al cargar los datos. Asegúrate de que los archivos JSON existen.');
    }
}

// ============================================
// HELPERS PELEADORES
// ============================================

/**
 * Obtiene el nombre completo de un peleador por su ID
 */
function getNombrePeleador(id) {
    if (peleadores && peleadores[id]) {
        return peleadores[id].nombre;
    }
    return id; // Fallback al ID si no existe
}

/**
 * Obtiene la foto de un peleador por su ID
 */
function getFotoPeleador(id) {
    if (peleadores && peleadores[id] && peleadores[id].foto) {
        return peleadores[id].foto;
    }
    return null;
}

/**
 * Genera el string "Peleador1 vs Peleador2" desde los IDs
 */
function getPeleaString(pelea) {
    const nombre1 = getNombrePeleador(pelea.peleador1);
    const nombre2 = getNombrePeleador(pelea.peleador2);
    return `${nombre1} vs ${nombre2}`;
}

// ============================================
// WILSON SCORE
// ============================================

/**
 * Calcula el Wilson Score lower bound
 * Fórmula que penaliza muestras pequeñas para rankings más justos
 * @param {number} wins - Número de aciertos
 * @param {number} total - Número total de pronósticos
 * @param {number} confidence - Nivel de confianza (por defecto 0.95)
 * @returns {number} Wilson Score entre 0 y 1
 */
function wilsonScore(wins, total, confidence = 0.95) {
    if (total === 0) return 0;

    // Valor z para el nivel de confianza (1.96 para 95%)
    const z = 1.96;
    const p = wins / total;

    const denominator = 1 + (z * z) / total;
    const center = p + (z * z) / (2 * total);
    const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);

    return (center - spread) / denominator;
}

// ============================================
// CÁLCULO DE ESTADÍSTICAS
// ============================================

function calculateStats() {
    const stats = {};

    // Inicializar stats para cada participante
    Object.entries(participantes).forEach(([id, p]) => {
        stats[id] = {
            id: id,
            nombre: p.nombre,
            avatar: p.avatar || 'assets/default-avatar.png',
            aciertos: 0,
            total: 0,
            porcentaje: 0,
            wilsonScore: 0
        };
    });

    // Iterar por eventos y sus peleas (solo contar si hay ganador)
    data.eventos.forEach(evento => {
        evento.peleas.forEach(pelea => {
            const ganadorReal = pelea.ganador;

            // Solo contar si la pelea tiene ganador definido
            if (!ganadorReal) return;

            Object.entries(pelea.pronosticos).forEach(([participanteId, pronostico]) => {
                if (stats[participanteId]) {
                    stats[participanteId].total++;

                    if (pronostico === ganadorReal) {
                        stats[participanteId].aciertos++;
                    }
                }
            });
        });
    });

    // Calcular porcentajes y Wilson Score
    Object.values(stats).forEach(s => {
        s.porcentaje = s.total > 0 ? (s.aciertos / s.total) * 100 : 0;
        s.wilsonScore = wilsonScore(s.aciertos, s.total);
    });

    // Ordenar por Wilson Score (descendente)
    return Object.values(stats)
        .filter(s => s.total > 0) // Solo mostrar participantes con al menos 1 pronóstico
        .sort((a, b) => b.wilsonScore - a.wilsonScore);
}

// Contar total de peleas pronosticadas
function getTotalPeleas() {
    let total = 0;
    data.eventos.forEach(evento => {
        total += evento.peleas.length;
    });
    return total;
}

// ============================================
// RENDERIZADO
// ============================================

function renderAll() {
    renderRanking();
    renderEventFilter();
    renderEvents();
}

function renderRanking() {
    const stats = calculateStats();
    const tbody = document.getElementById('ranking-body');

    tbody.innerHTML = stats.map((s, index) => {
        const position = index + 1;
        const positionClass = position <= 3 ? `position-${position}` : 'position-other';
        const percentageClass = getPercentageClass(s.porcentaje);

        return `
            <tr>
                <td class="col-pos">
                    <span class="position ${positionClass}">${position}</span>
                </td>
                <td class="col-nombre">
                    <div class="participant-cell">
                        <img src="${s.avatar}" alt="${s.nombre}" class="participant-avatar"
                             onerror="this.src='assets/logo.jpeg'">
                        <span class="participant-name">${s.nombre}</span>
                    </div>
                </td>
                <td class="col-aciertos">${s.aciertos}</td>
                <td class="col-total">${s.total}</td>
                <td class="col-porcentaje">
                    <span class="${percentageClass}">${s.porcentaje.toFixed(1)}%</span>
                </td>
            </tr>
        `;
    }).join('');
}

function renderEventFilter() {
    const select = document.getElementById('event-filter');

    // Mantener la opción "Todos"
    const allOption = select.querySelector('option[value="all"]');
    select.innerHTML = '';
    select.appendChild(allOption);

    // Añadir eventos (más recientes primero)
    const sortedEvents = [...data.eventos].sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
    );

    sortedEvents.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento.nombre;
        option.textContent = `${evento.nombre} - ${formatDate(evento.fecha)}`;
        select.appendChild(option);
    });
}

function renderEvents(filterValue = 'all') {
    const container = document.getElementById('events-container');

    // Filtrar y ordenar eventos (más recientes primero)
    let eventos = [...data.eventos].sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
    );

    if (filterValue !== 'all') {
        eventos = eventos.filter(e => e.nombre === filterValue);
    }

    container.innerHTML = eventos.map((evento, eventoIndex) => {
        // Renderizar cada pelea del evento
        const peleasHtml = evento.peleas.map((pelea, peleaIndex) => {
            const ganadorReal = pelea.ganador;

            // Obtener pronósticos con info del participante
            const predictions = Object.entries(pelea.pronosticos).map(([id, pick]) => {
                const participante = participantes[id];
                const haResult = ganadorReal !== null;
                const isCorrect = haResult && pick === ganadorReal;
                const pickNombre = getNombrePeleador(pick);
                const pickFoto = getFotoPeleador(pick);

                return {
                    id,
                    nombre: participante?.nombre || id,
                    avatar: participante?.avatar || 'assets/logo.jpeg',
                    pick: pickNombre,
                    pickFoto,
                    isCorrect,
                    haResult
                };
            });

            const nombre1 = getNombrePeleador(pelea.peleador1);
            const nombre2 = getNombrePeleador(pelea.peleador2);
            const foto1 = getFotoPeleador(pelea.peleador1);
            const foto2 = getFotoPeleador(pelea.peleador2);
            const isP1Winner = pelea.ganador === pelea.peleador1;
            const isP2Winner = pelea.ganador === pelea.peleador2;

            return `
                <div class="event-fight">
                    <div class="fight-header">
                        <div class="fight-info">
                            <span class="fight-matchup">
                                <span class="fighter ${isP1Winner ? 'fighter-winner' : ''}">
                                    ${foto1 ? `<img src="${foto1}" alt="${nombre1}" class="fighter-avatar" onerror="this.style.display='none'">` : ''}
                                    ${isP1Winner ? '🏆 ' : ''}${nombre1}
                                </span>
                                <span class="vs-label">vs</span>
                                <span class="fighter ${isP2Winner ? 'fighter-winner' : ''}">
                                    ${foto2 ? `<img src="${foto2}" alt="${nombre2}" class="fighter-avatar" onerror="this.style.display='none'">` : ''}
                                    ${isP2Winner ? '🏆 ' : ''}${nombre2}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div class="event-predictions">
                        <div class="predictions-grid">
                            ${predictions.map(pred => `
                                <div class="prediction-item ${pred.haResult ? (pred.isCorrect ? 'pick-correct' : 'pick-wrong') : 'pick-pending'}" title="${pred.nombre} → ${pred.pick}">
                                    <img src="${pred.avatar}" alt="${pred.nombre}" class="prediction-avatar"
                                         onerror="this.src='assets/logo.jpeg'">
                                    ${pred.pickFoto ? `<img src="${pred.pickFoto}" alt="${pred.pick}" class="pick-fighter-avatar" onerror="this.style.display='none'">` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const eventId = `event-${eventoIndex}`;

        return `
            <div class="event-card">
                <div class="event-header collapsed" data-target="${eventId}">
                    <div class="event-header-left">
                        <span class="expand-icon">▼</span>
                        <span class="event-name">${evento.nombre}</span>
                    </div>
                    <span class="event-date">${formatDate(evento.fecha)}</span>
                </div>
                <div class="event-body collapsed" id="${eventId}">
                    ${peleasHtml}
                </div>
            </div>
        `;
    }).join('');

    // Agregar event listeners para expandir/colapsar
    setupExpandListeners();
}

function setupExpandListeners() {
    // Event headers (expandir/colapsar eventos)
    document.querySelectorAll('.event-header[data-target]').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-target');
            const body = document.getElementById(targetId);

            header.classList.toggle('collapsed');
            body.classList.toggle('collapsed');
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    document.getElementById('event-filter').addEventListener('change', (e) => {
        renderEvents(e.target.value);
    });
}

// ============================================
// UTILIDADES
// ============================================

function getPercentageClass(percentage) {
    if (percentage >= 70) return 'percentage-high';
    if (percentage >= 50) return 'percentage-mid';
    return 'percentage-low';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function showError(message) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--red);">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}
