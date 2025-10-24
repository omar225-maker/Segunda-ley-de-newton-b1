// ==========================================
// SISTEMA DE NAVEGACIÓN
// ==========================================

function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;

            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// ==========================================
// SECCIÓN 1: COLISIÓN DE BOLAS
// ==========================================

function initColision() {
    const canvas = document.getElementById('canvas-colision');
    const ctx = canvas.getContext('2d');

    // Controles
    const masa1Input = document.getElementById('masa1');
    const vel1Input = document.getElementById('vel1');
    const masa2Input = document.getElementById('masa2');
    const restInput = document.getElementById('rest');
    const btnReset = document.getElementById('btn-reset-colision');
    const btnPlay = document.getElementById('btn-play-colision');

    // Estado de la simulación
    let animationId = null;
    let isRunning = false;
    let hasCollided = false;
    let collisionTime = 0;

    // Bolas (posiciones en pixeles, velocidades en pixeles/frame)
    let bola1 = {
        x: 100,
        y: 200,
        vx: 0,
        vy: 0,
        radius: 25,
        color: '#ffffff',
        masa: 0.17
    };

    let bola2 = {
        x: 600,
        y: 200,
        vx: 0,
        vy: 0,
        radius: 25,
        color: '#ef4444',
        masa: 0.17
    };

    const SCALE = 50; // pixeles por metro
    const FPS = 60;
    const dt = 1 / FPS;
    const FRICTION = 0.98; // Fricción con la mesa

    // Actualizar valores mostrados
    function updateDisplayValues() {
        document.getElementById('val-masa1').textContent = masa1Input.value;
        document.getElementById('val-vel1').textContent = vel1Input.value;
        document.getElementById('val-masa2').textContent = masa2Input.value;
        document.getElementById('val-rest').textContent = restInput.value;
    }

    masa1Input.addEventListener('input', updateDisplayValues);
    vel1Input.addEventListener('input', updateDisplayValues);
    masa2Input.addEventListener('input', updateDisplayValues);
    restInput.addEventListener('input', updateDisplayValues);

    function reset() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        isRunning = false;
        hasCollided = false;
        collisionTime = 0;

        bola1.x = 100;
        bola1.y = 200;
        bola1.vx = 0;
        bola1.vy = 0;
        bola1.masa = parseFloat(masa1Input.value);

        bola2.x = 600;
        bola2.y = 200;
        bola2.vx = 0;
        bola2.vy = 0;
        bola2.masa = parseFloat(masa2Input.value);

        // Actualizar radio según masa (proporción cúbica)
        bola1.radius = 15 + (bola1.masa - 0.1) * 30;
        bola2.radius = 15 + (bola2.masa - 0.1) * 30;

        btnPlay.textContent = '▶️ Lanzar';
        btnPlay.classList.remove('btn-primary');
        btnPlay.classList.add('btn-success');

        document.getElementById('estado-colision').textContent = 'Esperando...';
        
        draw();
        updateResults();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fondo de mesa de billar
        ctx.fillStyle = '#047857';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Líneas de referencia
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Bola 1 (blanca)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = bola1.color;
        ctx.beginPath();
        ctx.arc(bola1.x, bola1.y, bola1.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde de la bola blanca
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Número
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1', bola1.x, bola1.y);

        // Bola 2 (roja)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = bola2.color;
        ctx.beginPath();
        ctx.arc(bola2.x, bola2.y, bola2.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText('2', bola2.x, bola2.y);

        // Vector de velocidad de bola 1
        if (bola1.vx !== 0 || bola1.vy !== 0) {
            drawVelocityVector(ctx, bola1.x, bola1.y, bola1.vx, bola1.vy, '#fbbf24');
        }

        // Vector de velocidad de bola 2
        if (bola2.vx !== 0 || bola2.vy !== 0) {
            drawVelocityVector(ctx, bola2.x, bola2.y, bola2.vx, bola2.vy, '#fbbf24');
        }
    }

    function drawVelocityVector(ctx, x, y, vx, vy, color) {
        const scale = 3;
        const endX = x + vx * scale;
        const endY = y + vy * scale;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Flecha
        const angle = Math.atan2(vy, vx);
        const arrowLength = 10;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle - Math.PI / 6),
            endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle + Math.PI / 6),
            endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    function detectCollision() {
        const dx = bola2.x - bola1.x;
        const dy = bola2.y - bola1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bola1.radius + bola2.radius;

        return distance <= minDistance;
    }

    function handleCollision() {
        // Vector entre centros
        const dx = bola2.x - bola1.x;
        const dy = bola2.y - bola1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Evitar división por cero
        if (distance === 0) return;

        // Vector unitario de colisión
        const nx = dx / distance;
        const ny = dy / distance;

        // Vector tangente
        const tx = -ny;
        const ty = nx;

        // Proyectar velocidades en dirección normal y tangencial
        const v1n = bola1.vx * nx + bola1.vy * ny;
        const v1t = bola1.vx * tx + bola1.vy * ty;
        const v2n = bola2.vx * nx + bola2.vy * ny;
        const v2t = bola2.vx * tx + bola2.vy * ty;

        // Coeficiente de restitución
        const e = parseFloat(restInput.value);

        // Nuevas velocidades normales después de colisión elástica
        const m1 = bola1.masa;
        const m2 = bola2.masa;

        const v1n_new = ((m1 - e * m2) * v1n + (1 + e) * m2 * v2n) / (m1 + m2);
        const v2n_new = ((m2 - e * m1) * v2n + (1 + e) * m1 * v1n) / (m1 + m2);

        // Componentes tangenciales no cambian
        const v1t_new = v1t;
        const v2t_new = v2t;

        // Convertir de vuelta a coordenadas cartesianas
        bola1.vx = v1n_new * nx + v1t_new * tx;
        bola1.vy = v1n_new * ny + v1t_new * ty;
        bola2.vx = v2n_new * nx + v2t_new * tx;
        bola2.vy = v2n_new * ny + v2t_new * ty;

        // Separar las bolas para evitar superposición
        const overlap = (bola1.radius + bola2.radius) - distance;
        const separationX = (overlap / 2) * nx;
        const separationY = (overlap / 2) * ny;

        bola1.x -= separationX;
        bola1.y -= separationY;
        bola2.x += separationX;
        bola2.y += separationY;

        // Marcar colisión
        if (!hasCollided) {
            hasCollided = true;
            collisionTime = Date.now();
            
            // Calcular fuerza de impacto
            const deltaV = Math.sqrt(
                Math.pow(v2n_new - v2n, 2) + Math.pow(v1n_new - v1n, 2)
            );
            const impactForce = (bola2.masa * deltaV) / (2 * dt); // F = m * Δv / Δt
            
            document.getElementById('fuerza-impacto').textContent = 
                impactForce.toFixed(1) + ' N';
            document.getElementById('estado-colision').textContent = '💥 ¡COLISIÓN!';

            // Efecto visual
            canvas.classList.add('collision-effect');
            setTimeout(() => canvas.classList.remove('collision-effect'), 300);
        }
    }

    function update() {
        if (!isRunning) return;

        // Actualizar posiciones
        bola1.x += bola1.vx * dt * FPS;
        bola1.y += bola1.vy * dt * FPS;
        bola2.x += bola2.vx * dt * FPS;
        bola2.y += bola2.vy * dt * FPS;

        // Aplicar fricción
        bola1.vx *= FRICTION;
        bola1.vy *= FRICTION;
        bola2.vx *= FRICTION;
        bola2.vy *= FRICTION;

        // Detener si velocidad muy baja
        if (Math.abs(bola1.vx) < 0.1 && Math.abs(bola1.vy) < 0.1) {
            bola1.vx = 0;
            bola1.vy = 0;
        }
        if (Math.abs(bola2.vx) < 0.1 && Math.abs(bola2.vy) < 0.1) {
            bola2.vx = 0;
            bola2.vy = 0;
        }

        // Colisiones con bordes (con rebote)
        if (bola1.x - bola1.radius < 0) {
            bola1.x = bola1.radius;
            bola1.vx = -bola1.vx * 0.8;
        }
        if (bola1.x + bola1.radius > canvas.width) {
            bola1.x = canvas.width - bola1.radius;
            bola1.vx = -bola1.vx * 0.8;
        }
        if (bola1.y - bola1.radius < 0) {
            bola1.y = bola1.radius;
            bola1.vy = -bola1.vy * 0.8;
        }
        if (bola1.y + bola1.radius > canvas.height) {
            bola1.y = canvas.height - bola1.radius;
            bola1.vy = -bola1.vy * 0.8;
        }

        if (bola2.x - bola2.radius < 0) {
            bola2.x = bola2.radius;
            bola2.vx = -bola2.vx * 0.8;
        }
        if (bola2.x + bola2.radius > canvas.width) {
            bola2.x = canvas.width - bola2.radius;
            bola2.vx = -bola2.vx * 0.8;
        }
        if (bola2.y - bola2.radius < 0) {
            bola2.y = bola2.radius;
            bola2.vy = -bola2.vy * 0.8;
        }
        if (bola2.y + bola2.radius > canvas.height) {
            bola2.y = canvas.height - bola2.radius;
            bola2.vy = -bola2.vy * 0.8;
        }

        // Detectar colisión entre bolas
        if (detectCollision()) {
            handleCollision();
        }

        // Detener si ambas bolas están quietas
        if (bola1.vx === 0 && bola1.vy === 0 && bola2.vx === 0 && bola2.vy === 0) {
            isRunning = false;
            btnPlay.textContent = '▶️ Lanzar';
            btnPlay.classList.remove('btn-primary');
            btnPlay.classList.add('btn-success');
            
            if (hasCollided) {
                document.getElementById('estado-colision').textContent = '✅ Simulación completa';
            } else {
                document.getElementById('estado-colision').textContent = 'Detenido (sin colisión)';
            }
        }

        updateResults();
    }

    function updateResults() {
        // Convertir velocidades de píxeles/frame a m/s
        const v1_ms = Math.sqrt(bola1.vx * bola1.vx + bola1.vy * bola1.vy) * FPS / SCALE;
        const v2_ms = Math.sqrt(bola2.vx * bola2.vx + bola2.vy * bola2.vy) * FPS / SCALE;

        // Momento lineal total
        const p1 = bola1.masa * v1_ms;
        const p2 = bola2.masa * v2_ms;
        const pTotal = p1 + p2;

        // Energía cinética inicial
        const v_inicial = parseFloat(vel1Input.value);
        const E_inicial = 0.5 * bola1.masa * v_inicial * v_inicial;

        document.getElementById('momento-inicial').textContent = 
            pTotal.toFixed(3) + ' kg·m/s';
        document.getElementById('energia-inicial').textContent = 
            E_inicial.toFixed(2) + ' J';
    }

    function animate() {
        update();
        draw();
        animationId = requestAnimationFrame(animate);
    }

    btnPlay.addEventListener('click', () => {
        if (isRunning) {
            // Pausar
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            btnPlay.textContent = '▶️ Continuar';
        } else {
            // Iniciar o continuar
            if (bola1.vx === 0 && bola1.vy === 0 && !hasCollided) {
                // Primera vez: dar velocidad inicial a bola 1
                const vel_inicial = parseFloat(vel1Input.value);
                bola1.vx = vel_inicial * SCALE / FPS;
                bola1.vy = 0;
                
                document.getElementById('estado-colision').textContent = '🏃 En movimiento...';
            }

            isRunning = true;
            btnPlay.textContent = '⏸️ Pausar';
            btnPlay.classList.remove('btn-success');
            btnPlay.classList.add('btn-primary');
            animate();
        }
    });

    btnReset.addEventListener('click', reset);

    // Inicializar
    updateDisplayValues();
    reset();
}

// ==========================================
// SECCIÓN 2: FRENADO DE COCHE
// ==========================================

function initCoche() {
    const canvas = document.getElementById('canvas-coche');
    const ctx = canvas.getContext('2d');

    const masaCocheInput = document.getElementById('masa-coche');
    const velCocheInput = document.getElementById('vel-coche');
    const fuerzaFrenoInput = document.getElementById('fuerza-freno');
    const btnReset = document.getElementById('btn-reset-coche');
    const btnPlay = document.getElementById('btn-play-coche');

    let animationId = null;
    let isRunning = false;

    let coche = {
        x: 50,
        y: 250,
        width: 80,
        height: 40,
        velocidad: 0, // m/s
        desaceleracion: 0, // m/s²
        distanciaRecorrida: 0
    };

    const SCALE = 5; // píxeles por metro
    const FPS = 60;
    const dt = 1 / FPS;

    function updateDisplayValues() {
        document.getElementById('val-masa-coche').textContent = masaCocheInput.value;
        document.getElementById('val-vel-coche').textContent = velCocheInput.value;
        document.getElementById('val-fuerza-freno').textContent = fuerzaFrenoInput.value;

        calcularParametros();
    }

    masaCocheInput.addEventListener('input', updateDisplayValues);
    velCocheInput.addEventListener('input', updateDisplayValues);
    fuerzaFrenoInput.addEventListener('input', updateDisplayValues);

    function calcularParametros() {
        const masa = parseFloat(masaCocheInput.value);
        const velocidadKmh = parseFloat(velCocheInput.value);
        const fuerzaKN = parseFloat(fuerzaFrenoInput.value);

        const velocidadMs = velocidadKmh / 3.6;
        const fuerzaN = fuerzaKN * 1000;

        // a = F / m
        const desaceleracion = fuerzaN / masa;

        // d = v² / (2a)
        const distancia = (velocidadMs * velocidadMs) / (2 * desaceleracion);

        // t = v / a
        const tiempo = velocidadMs / desaceleracion;

        document.getElementById('desaceleracion').textContent = desaceleracion.toFixed(2) + ' m/s²';
        document.getElementById('distancia-frenado').textContent = distancia.toFixed(2) + ' m';
        document.getElementById('tiempo-frenado').textContent = tiempo.toFixed(2) + ' s';
    }

    function reset() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        isRunning = false;
        coche.x = 50;
        coche.velocidad = 0;
        coche.distanciaRecorrida = 0;
        
        btnPlay.textContent = '🚦 Frenar';

        document.getElementById('vel-actual-coche').textContent = '0 km/h';

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Carretera
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, 200, canvas.width, 150);

        // Líneas de carretera
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 10]);
        ctx.beginPath();
        ctx.moveTo(0, 275);
        ctx.lineTo(canvas.width, 275);
        ctx.stroke();
        ctx.setLineDash([]);

        // Marca de inicio
        ctx.fillStyle = '#10b981';
        ctx.fillRect(40, 200, 5, 150);
        ctx.font = 'bold 14px Arial';
        ctx.fillText('INICIO', 10, 190);

        // Escala de distancia
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        for (let i = 0; i <= 100; i += 20) {
            const x = 50 + i * SCALE;
            if (x < canvas.width) {
                ctx.fillText(i + 'm', x, 370);
                ctx.fillRect(x, 355, 2, 10);
            }
        }

        // Coche
        const cocheX = coche.x + coche.distanciaRecorrida * SCALE;

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(cocheX + 5, coche.y + coche.height, coche.width, 10);

        // Cuerpo del coche
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(cocheX, coche.y, coche.width, coche.height);

        // Ventanas
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(cocheX + 15, coche.y + 5, 25, 15);
        ctx.fillRect(cocheX + 45, coche.y + 5, 25, 15);

        // Ruedas
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(cocheX + 20, coche.y + coche.height, 8, 0, Math.PI * 2);
        ctx.arc(cocheX + 60, coche.y + coche.height, 8, 0, Math.PI * 2);
        ctx.fill();

        // Flechas de frenado si está frenando
        if (isRunning && coche.velocidad > 0) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4;
            for (let i = 0; i < 3; i++) {
                const arrowX = cocheX - 20 - i * 15;
                ctx.beginPath();
                ctx.moveTo(arrowX, coche.y + 15);
                ctx.lineTo(arrowX - 10, coche.y + 20);
                ctx.moveTo(arrowX, coche.y + 15);
                ctx.lineTo(arrowX - 10, coche.y + 10);
                ctx.stroke();
            }
        }

        // Velocímetro
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(cocheX - 30, coche.y - 50, 60, 35);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(cocheX - 30, coche.y - 50, 60, 35);
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((coche.velocidad * 3.6).toFixed(0), cocheX, coche.y - 35);
        ctx.font = '10px Arial';
        ctx.fillText('km/h', cocheX, coche.y - 22);
    }

    function update() {
        if (!isRunning) return;

        const masa = parseFloat(masaCocheInput.value);
        const fuerzaKN = parseFloat(fuerzaFrenoInput.value);
        const fuerzaN = fuerzaKN * 1000;

        coche.desaceleracion = fuerzaN / masa;

        coche.velocidad -= coche.desaceleracion * dt;

        if (coche.velocidad <= 0) {
            coche.velocidad = 0;
            isRunning = false;
            btnPlay.textContent = '🚦 Frenar';
        }

        coche.distanciaRecorrida += coche.velocidad * dt;

        document.getElementById('vel-actual-coche').textContent = 
            (coche.velocidad * 3.6).toFixed(1) + ' km/h';
    }

    function animate() {
        update();
        draw();
        if (isRunning) {
            animationId = requestAnimationFrame(animate);
        }
    }

    btnPlay.addEventListener('click', () => {
        if (!isRunning) {
            const velocidadKmh = parseFloat(velCocheInput.value);
            coche.velocidad = velocidadKmh / 3.6;
            isRunning = true;
            btnPlay.textContent = '⏹️ Detener';
            animate();
        } else {
            reset();
        }
    });

    btnReset.addEventListener('click', reset);

    updateDisplayValues();
    reset();
}

// ==========================================
// SECCIÓN 3: ELEVADOR
// ==========================================

function initElevador() {
    const canvas = document.getElementById('canvas-elevador');
    const ctx = canvas.getContext('2d');

    const masaPersonaInput = document.getElementById('masa-persona');
    const acelElevadorInput = document.getElementById('acel-elevador');
    const btnReset = document.getElementById('btn-reset-elevador');
    const btnPlay = document.getElementById('btn-play-elevador');

    let animationId = null;
    let isRunning = false;
    let elevadorY = 50;
    let elevadorVel = 0;
    let time = 0;

    const g = 9.8; // m/s²

    function updateDisplayValues() {
        document.getElementById('val-masa-persona').textContent = masaPersonaInput.value;
        document.getElementById('val-acel-elevador').textContent = acelElevadorInput.value;

        calcularFuerzas();
    }

    masaPersonaInput.addEventListener('input', updateDisplayValues);
    acelElevadorInput.addEventListener('input', updateDisplayValues);

    function calcularFuerzas() {
        const masa = parseFloat(masaPersonaInput.value);
        const acel = parseFloat(acelElevadorInput.value);

        const pesoReal = masa * g;
        const pesoAparente = masa * (g + acel);
        const tension = pesoAparente;

        document.getElementById('peso-real').textContent = pesoReal.toFixed(1) + ' N';
        document.getElementById('peso-aparente').textContent = pesoAparente.toFixed(1) + ' N';
        document.getElementById('tension-cable').textContent = tension.toFixed(1) + ' N';

        let sensacion = '';
        if (acel > 0.5) {
            sensacion = '⬆️ Más pesado (subiendo acelerando)';
        } else if (acel < -0.5) {
            sensacion = '⬇️ Más liviano (bajando acelerando)';
        } else {
            sensacion = '➡️ Normal (velocidad constante)';
        }

        document.getElementById('sensacion').textContent = sensacion;
    }

    function reset() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        isRunning = false;
        elevadorY = 50;
        elevadorVel = 0;
        time = 0;

        btnPlay.textContent = '▶️ Mover';

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Edificio
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(250, 0, 300, canvas.height);

        // Pisos
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const y = i * 50;
            ctx.beginPath();
            ctx.moveTo(250, y);
            ctx.lineTo(550, y);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.fillText('Piso ' + (10 - i), 260, y + 25);
        }

        // Cable
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(400, 0);
        ctx.lineTo(400, elevadorY);
        ctx.stroke();

        // Elevador
        const elevadorWidth = 100;
        const elevadorHeight = 80;
        const elevadorX = 350;

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(elevadorX, elevadorY, elevadorWidth, elevadorHeight);

        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 3;
        ctx.strokeRect(elevadorX, elevadorY, elevadorWidth, elevadorHeight);

        // Persona (palito)
        const personaX = elevadorX + elevadorWidth / 2;
        const personaY = elevadorY + elevadorHeight / 2;

        // Cabeza
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(personaX, personaY - 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(personaX, personaY - 7);
        ctx.lineTo(personaX, personaY + 15);
        ctx.stroke();

        // Brazos
        ctx.beginPath();
        ctx.moveTo(personaX - 10, personaY);
        ctx.lineTo(personaX + 10, personaY);
        ctx.stroke();

        // Piernas
        ctx.beginPath();
        ctx.moveTo(personaX, personaY + 15);
        ctx.lineTo(personaX - 8, personaY + 30);
        ctx.moveTo(personaX, personaY + 15);
        ctx.lineTo(personaX + 8, personaY + 30);
        ctx.stroke();

        // Vectores de fuerza
        const masa = parseFloat(masaPersonaInput.value);
        const acel = parseFloat(acelElevadorInput.value);
        
        const pesoAparente = masa * (g + acel);
        const escalaFuerza = 0.1;

        // Peso (hacia abajo)
        drawForceVector(ctx, personaX, personaY + 35, 0, masa * g * escalaFuerza, '#ef4444', 'Peso');

        // Tensión/Normal (hacia arriba)
        drawForceVector(ctx, personaX + 20, personaY + 35, 0, -pesoAparente * escalaFuerza, '#10b981', 'Normal');

        // Indicador de aceleración
        if (Math.abs(acel) > 0.1) {
            const dir = acel > 0 ? '⬆️' : '⬇️';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(dir, elevadorX + elevadorWidth / 2, elevadorY - 20);
        }
    }

    function drawForceVector(ctx, x, y, vx, vy, color, label) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx, y + vy);
        ctx.stroke();

        // Flecha
        const angle = Math.atan2(vy, vx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(
            x + vx - 8 * Math.cos(angle - Math.PI / 6),
            y + vy - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x + vx - 8 * Math.cos(angle + Math.PI / 6),
            y + vy - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Etiqueta
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + vx + 20, y + vy);
    }

    function update() {
        if (!isRunning) return;

        const acel = parseFloat(acelElevadorInput.value);
        
        elevadorVel += acel * 0.5; // Escala de tiempo
        elevadorY += elevadorVel;

        // Límites
        if (elevadorY < 20) {
            elevadorY = 20;
            elevadorVel = 0;
        }
        if (elevadorY > canvas.height - 100) {
            elevadorY = canvas.height - 100;
            elevadorVel = 0;
        }

        time += 0.016;

        // Auto-parar después de 5 segundos
        if (time > 5) {
            isRunning = false;
            btnPlay.textContent = '▶️ Mover';
        }
    }

    function animate() {
        update();
        draw();
        if (isRunning) {
            animationId = requestAnimationFrame(animate);
        }
    }

    btnPlay.addEventListener('click', () => {
        if (!isRunning) {
            time = 0;
            isRunning = true;
            btnPlay.textContent = '⏹️ Detener';
            animate();
        } else {
            reset();
        }
    });

    btnReset.addEventListener('click', reset);

    updateDisplayValues();
    reset();
}

// ==========================================
// SECCIÓN 4: COHETE
// ==========================================

function initCohete() {
    const canvas = document.getElementById('canvas-cohete');
    const ctx = canvas.getContext('2d');

    const masaCoheteInput = document.getElementById('masa-cohete');
    const empujeInput = document.getElementById('empuje');
    const consumoInput = document.getElementById('consumo');
    const btnReset = document.getElementById('btn-reset-cohete');
    const btnPlay = document.getElementById('btn-play-cohete');

    let animationId = null;
    let isRunning = false;

    let cohete = {
        x: 400,
        y: 450,
        velocidad: 0, // m/s
        altitud: 0, // m
        masa: 5000, // kg
        masaInicial: 5000
    };

    const g = 9.8;
    const FPS = 60;
    const dt = 1 / FPS;

    function updateDisplayValues() {
        document.getElementById('val-masa-cohete').textContent = masaCoheteInput.value;
        document.getElementById('val-empuje').textContent = empujeInput.value;
        document.getElementById('val-consumo').textContent = consumoInput.value;
    }

    masaCoheteInput.addEventListener('input', updateDisplayValues);
    empujeInput.addEventListener('input', updateDisplayValues);
    consumoInput.addEventListener('input', updateDisplayValues);

    function reset() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        isRunning = false;
        cohete.y = 450;
        cohete.velocidad = 0;
        cohete.altitud = 0;
        cohete.masa = parseFloat(masaCoheteInput.value);
        cohete.masaInicial = cohete.masa;

        btnPlay.textContent = '🚀 Lanzar';

        document.getElementById('masa-actual').textContent = cohete.masa.toFixed(0) + ' kg';
        document.getElementById('aceleracion-cohete').textContent = '0 m/s²';
        document.getElementById('velocidad-cohete').textContent = '0 m/s';
        document.getElementById('altitud-cohete').textContent = '0 m';

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cielo
        const gradiente = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradiente.addColorStop(0, '#1e3a8a');
        gradiente.addColorStop(1, '#3b82f6');
        ctx.fillStyle = gradiente;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Nubes
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(200, 100, 60, 30, 0, 0, Math.PI * 2);
        ctx.ellipse(600, 150, 80, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Plataforma de lanzamiento
        if (cohete.y >= 400) {
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(350, 470, 100, 10);
            ctx.fillRect(380, 480, 40, 20);
        }

        // Cohete
        const coheteWidth = 30;
        const coheteHeight = 80;

        // Proporcióncombustible
        const proporcionCombustible = cohete.masa / cohete.masaInicial;

        // Cuerpo del cohete
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cohete.x - coheteWidth / 2, cohete.y, coheteWidth, coheteHeight);

        // Tanque de combustible (visual)
        ctx.fillStyle = '#fbbf24';
        const tanqueHeight = coheteHeight * 0.6 * proporcionCombustible;
        ctx.fillRect(cohete.x - coheteWidth / 2 + 5, cohete.y + coheteHeight - tanqueHeight - 10, 
                     coheteWidth - 10, tanqueHeight);

        // Punta del cohete
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cohete.x, cohete.y - 20);
        ctx.lineTo(cohete.x - coheteWidth / 2, cohete.y);
        ctx.lineTo(cohete.x + coheteWidth / 2, cohete.y);
        ctx.closePath();
        ctx.fill();

        // Ventanas
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(cohete.x, cohete.y + 20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Aletas
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cohete.x - coheteWidth / 2, cohete.y + coheteHeight);
        ctx.lineTo(cohete.x - coheteWidth / 2 - 15, cohete.y + coheteHeight + 15);
        ctx.lineTo(cohete.x - coheteWidth / 2, cohete.y + coheteHeight + 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cohete.x + coheteWidth / 2, cohete.y + coheteHeight);
        ctx.lineTo(cohete.x + coheteWidth / 2 + 15, cohete.y + coheteHeight + 15);
        ctx.lineTo(cohete.x + coheteWidth / 2, cohete.y + coheteHeight + 10);
        ctx.fill();

        // Llamas del motor
        if (isRunning && cohete.masa > cohete.masaInicial * 0.1) {
            const llamaLength = 30 + Math.random() * 20;
            
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(cohete.x - 10, cohete.y + coheteHeight + 10);
            ctx.lineTo(cohete.x, cohete.y + coheteHeight + 10 + llamaLength);
            ctx.lineTo(cohete.x + 10, cohete.y + coheteHeight + 10);
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(cohete.x - 5, cohete.y + coheteHeight + 10);
            ctx.lineTo(cohete.x, cohete.y + coheteHeight + 10 + llamaLength * 0.7);
            ctx.lineTo(cohete.x + 5, cohete.y + coheteHeight + 10);
            ctx.fill();
        }

        // Información de altitud
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Altitud: ' + cohete.altitud.toFixed(0) + ' m', canvas.width - 20, 30);
        ctx.fillText('Velocidad: ' + cohete.velocidad.toFixed(1) + ' m/s', canvas.width - 20, 55);
    }

    function update() {
        if (!isRunning) return;

        const empujeKN = parseFloat(empujeInput.value);
        const empujeN = empujeKN * 1000;
        const consumo = parseFloat(consumoInput.value);

        // Consumir combustible
        cohete.masa -= consumo * dt;
        
        // Si se acabó el combustible
        if (cohete.masa < cohete.masaInicial * 0.1) {
            cohete.masa = cohete.masaInicial * 0.1; // Masa vacía
        }

        // Fuerza neta = Empuje - Peso
        const peso = cohete.masa * g;
        const fuerzaNeta = empujeN - peso;

        // a = F / m
        const aceleracion = fuerzaNeta / cohete.masa;

        cohete.velocidad += aceleracion * dt;

        // Limitar velocidad para visualización
        if (cohete.velocidad < 0) {
            cohete.velocidad = 0;
        }

        cohete.altitud += cohete.velocidad * dt;

        // Actualizar posición en canvas (invertida)
        const escalaAltitud = 0.5;
        cohete.y = 450 - cohete.altitud * escalaAltitud;

        if (cohete.y < -100) {
            cohete.y = -100;
        }

        // Actualizar displays
        document.getElementById('masa-actual').textContent = cohete.masa.toFixed(0) + ' kg';
        document.getElementById('aceleracion-cohete').textContent = aceleracion.toFixed(2) + ' m/s²';
        document.getElementById('velocidad-cohete').textContent = cohete.velocidad.toFixed(1) + ' m/s';
        document.getElementById('altitud-cohete').textContent = cohete.altitud.toFixed(0) + ' m';

        // Detener si fuera de vista
        if (cohete.y < -100) {
            isRunning = false;
            btnPlay.textContent = '🚀 Lanzar';
        }
    }

    function animate() {
        update();
        draw();
        if (isRunning) {
            animationId = requestAnimationFrame(animate);
        }
    }

    btnPlay.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            btnPlay.textContent = '⏹️ Detener';
            animate();
        } else {
            reset();
        }
    });

    btnReset.addEventListener('click', reset);

    updateDisplayValues();
    reset();
}

// ==========================================
// SECCIÓN 5: BICICLETA
// ==========================================

function initBicicleta() {
    const canvas = document.getElementById('canvas-bicicleta');
    const ctx = canvas.getContext('2d');

    const masaBiciInput = document.getElementById('masa-bici');
    const fuerzaPedaleoInput = document.getElementById('fuerza-pedaleo');
    const resistenciaInput = document.getElementById('resistencia');
    const pendienteInput = document.getElementById('pendiente');
    const btnReset = document.getElementById('btn-reset-bici');
    const btnPlay = document.getElementById('btn-play-bici');

    let animationId = null;
    let isRunning = false;

    let bici = {
        x: 50,
        y: 250,
        velocidad: 0, // m/s
        distancia: 0, // m
        anguloPedal: 0
    };

    const g = 9.8;
    const FPS = 60;
    const dt = 1 / FPS;
    const SCALE = 5; // píxeles por metro

    function updateDisplayValues() {
        document.getElementById('val-masa-bici').textContent = masaBiciInput.value;
        document.getElementById('val-fuerza-pedaleo').textContent = fuerzaPedaleoInput.value;
        document.getElementById('val-resistencia').textContent = resistenciaInput.value;
        document.getElementById('val-pendiente').textContent = pendienteInput.value;
    }

    masaBiciInput.addEventListener('input', updateDisplayValues);
    fuerzaPedaleoInput.addEventListener('input', updateDisplayValues);
    resistenciaInput.addEventListener('input', updateDisplayValues);
    pendienteInput.addEventListener('input', updateDisplayValues);

    function reset() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        isRunning = false;
        bici.x = 50;
        bici.velocidad = 0;
        bici.distancia = 0;
        bici.anguloPedal = 0;

        btnPlay.textContent = '🚴 Pedalear';

        document.getElementById('fuerza-neta-bici').textContent = '0 N';
        document.getElementById('aceleracion-bici').textContent = '0 m/s²';
        document.getElementById('velocidad-bici').textContent = '0 km/h';
        document.getElementById('distancia-bici').textContent = '0 m';

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cielo
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pendiente
        const pendiente = parseFloat(pendienteInput.value);
        const anguloPendiente = Math.atan(pendiente / 100);

        // Carretera con pendiente
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.moveTo(0, 300);
        
        for (let x = 0; x <= canvas.width; x += 10) {
            const y = 300 - x * Math.tan(anguloPendiente);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Líneas de carretera
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.beginPath();
        ctx.moveTo(0, 290);
        for (let x = 0; x <= canvas.width; x += 10) {
            const y = 290 - x * Math.tan(anguloPendiente);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Bicicleta
        const biciX = bici.x + bici.distancia * SCALE;
        const biciY = bici.y - biciX * Math.tan(anguloPendiente);

        // Ruedas
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        
        // Rueda trasera
        ctx.beginPath();
        ctx.arc(biciX, biciY + 20, 15, 0, Math.PI * 2);
        ctx.stroke();

        // Radios
        for (let i = 0; i < 8; i++) {
            const angle = (bici.anguloPedal + i * Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(biciX, biciY + 20);
            ctx.lineTo(
                biciX + 15 * Math.cos(angle),
                biciY + 20 + 15 * Math.sin(angle)
            );
            ctx.stroke();
        }

        // Rueda delantera
        ctx.beginPath();
        ctx.arc(biciX + 60, biciY + 20, 15, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
            const angle = (bici.anguloPedal + i * Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(biciX + 60, biciY + 20);
            ctx.lineTo(
                biciX + 60 + 15 * Math.cos(angle),
                biciY + 20 + 15 * Math.sin(angle)
            );
            ctx.stroke();
        }

        // Cuadro
        ctx.beginPath();
        ctx.moveTo(biciX, biciY + 20); // Eje trasero
        ctx.lineTo(biciX + 20, biciY); // Asiento
        ctx.lineTo(biciX + 35, biciY + 5); // Manillar
        ctx.lineTo(biciX + 60, biciY + 20); // Eje delantero
        ctx.moveTo(biciX + 20, biciY + 20); // Pedales
        ctx.lineTo(biciX, biciY + 20);
        ctx.stroke();

        // Ciclista (palito)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        
        // Cabeza
        ctx.beginPath();
        ctx.arc(biciX + 22, biciY - 8, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();

        // Cuerpo
        ctx.beginPath();
        ctx.moveTo(biciX + 22, biciY - 2);
        ctx.lineTo(biciX + 20, biciY + 10);
        ctx.stroke();

        // Brazo
        ctx.beginPath();
        ctx.moveTo(biciX + 22, biciY);
        ctx.lineTo(biciX + 35, biciY + 5);
        ctx.stroke();

        // Piernas pedaleando
        const pierna1Angle = bici.anguloPedal;
        const pierna2Angle = bici.anguloPedal + Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(biciX + 20, biciY + 10);
        ctx.lineTo(
            biciX + 20 + 10 * Math.cos(pierna1Angle),
            biciY + 20 + 10 * Math.sin(pierna1Angle)
        );
        ctx.stroke();

        // Vectores de fuerza
        if (isRunning) {
            // Fuerza de pedaleo
            const fuerzaPedaleo = parseFloat(fuerzaPedaleoInput.value);
            drawForceArrow(ctx, biciX + 40, biciY + 35, fuerzaPedaleo * 0.5, 0, '#10b981', 'F');

            // Resistencia
            const resistencia = parseFloat(resistenciaInput.value);
            const fuerzaResistencia = resistencia * bici.velocidad * bici.velocidad;
            drawForceArrow(ctx, biciX - 10, biciY + 35, -fuerzaResistencia * 0.1, 0, '#ef4444', 'Fr');
        }

        // Indicador de pendiente
        if (Math.abs(pendiente) > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            const texto = pendiente > 0 ? '⬆️ Subida ' + pendiente + '%' : '⬇️ Bajada ' + Math.abs(pendiente) + '%';
            ctx.fillText(texto, 20, 30);
        }
    }

    function drawForceArrow(ctx, x, y, fx, fy, color, label) {
        if (Math.abs(fx) < 1 && Math.abs(fy) < 1) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + fx, y + fy);
        ctx.stroke();

        // Flecha
        const angle = Math.atan2(fy, fx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + fx, y + fy);
        ctx.lineTo(
            x + fx - 8 * Math.cos(angle - Math.PI / 6),
            y + fy - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x + fx - 8 * Math.cos(angle + Math.PI / 6),
            y + fy - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Etiqueta
        ctx.font = 'bold 14px Arial';
        ctx.fillText(label, x + fx + 10, y + fy);
    }

    function update() {
        if (!isRunning) return;

        const masa = parseFloat(masaBiciInput.value);
        const fuerzaPedaleo = parseFloat(fuerzaPedaleoInput.value);
        const coefResistencia = parseFloat(resistenciaInput.value);
        const pendiente = parseFloat(pendienteInput.value);

        // Fuerza de resistencia del aire: Fr = k * v²
        const fuerzaResistencia = coefResistencia * bici.velocidad * bici.velocidad;

        // Componente del peso en la pendiente
        const anguloPendiente = Math.atan(pendiente / 100);
        const fuerzaPendiente = masa * g * Math.sin(anguloPendiente);

        // Fuerza neta
        const fuerzaNeta = fuerzaPedaleo - fuerzaResistencia - fuerzaPendiente;

        // a = F / m
        const aceleracion = fuerzaNeta / masa;

        bici.velocidad += aceleracion * dt;

        if (bici.velocidad < 0) {
            bici.velocidad = 0;
        }

        bici.distancia += bici.velocidad * dt;

        // Animación de pedales
        bici.anguloPedal += bici.velocidad * 0.2;

        // Actualizar displays
        document.getElementById('fuerza-neta-bici').textContent = fuerzaNeta.toFixed(1) + ' N';
        document.getElementById('aceleracion-bici').textContent = aceleracion.toFixed(2) + ' m/s²';
        document.getElementById('velocidad-bici').textContent = (bici.velocidad * 3.6).toFixed(1) + ' km/h';
        document.getElementById('distancia-bici').textContent = bici.distancia.toFixed(1) + ' m';

        // Límite de visualización
        if (bici.distancia * SCALE > canvas.width - 100) {
            isRunning = false;
            btnPlay.textContent = '🚴 Pedalear';
        }
    }

    function animate() {
        update();
        draw();
        if (isRunning) {
            animationId = requestAnimationFrame(animate);
        }
    }

    btnPlay.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            btnPlay.textContent = '⏹️ Detener';
            animate();
        } else {
            reset();
        }
    });

    btnReset.addEventListener('click', reset);

    updateDisplayValues();
    reset();
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initColision();
    initCoche();
    initElevador();
    initCohete();
    initBicicleta();
});
