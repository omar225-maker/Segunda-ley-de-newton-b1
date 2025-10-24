# 🚀 Segunda Ley de Newton - Aplicaciones Reales

Simulador interactivo que demuestra la Segunda Ley de Newton (F = ma) en situaciones cotidianas y realistas.

## 🎯 Características

### 5 Simulaciones Físicamente Realistas

1. **🎱 Colisión de Bolas de Billar**
   - Colisión elástica con conservación de momento
   - Coeficiente de restitución ajustable
   - Separación automática anti-superposición
   - Fricción con la mesa
   - Cálculo de fuerza de impacto

2. **🚗 Frenado de Automóvil**
   - Desaceleración realista basada en F = ma
   - Cálculo de distancia y tiempo de frenado
   - Diferentes masas de vehículos
   - Velocidades desde 20 hasta 120 km/h

3. **🏢 Elevador**
   - Cambios en peso aparente
   - Sensación de más pesado/liviano
   - Tensión del cable
   - Aceleración positiva y negativa

4. **🚀 Lanzamiento de Cohete**
   - Consumo progresivo de combustible
   - Aumento de aceleración al reducir masa
   - Empuje vs Peso
   - Telemetría en tiempo real

5. **🚴 Pedaleo en Bicicleta**
   - Resistencia del aire proporcional a v²
   - Efecto de pendientes (subidas y bajadas)
   - Fuerza neta variable
   - Animación de pedaleo realista

## 🧮 Física Implementada

### Colisiones Elásticas
```
v1' = ((m1 - e·m2)·v1 + (1+e)·m2·v2) / (m1+m2)
v2' = ((m2 - e·m1)·v2 + (1+e)·m1·v1) / (m1+m2)
```

### Segunda Ley de Newton
```
F = ma
a = F/m
```

### Fricción y Resistencia
```
Fr = k·v²  (resistencia del aire)
F_neta = F_aplicada - Fr - mg·sin(θ)
```

### Peso Aparente en Elevador
```
N = m(g + a)
```

## 🎮 Controles

- **Sliders**: Ajusta parámetros en tiempo real
- **Botón Lanzar/Play**: Inicia la simulación
- **Botón Reiniciar**: Vuelve al estado inicial
- **Navegación por pestañas**: Cambia entre simulaciones

## 🛠️ Tecnologías

- **HTML5**: Estructura y Canvas para gráficos
- **CSS3**: Diseño responsive y moderno
- **JavaScript Vanilla**: Física y animaciones (60 FPS)

## 📱 Compatibilidad

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Dispositivos móviles (responsive)

## 🚀 Uso

1. Abre `index.html` en tu navegador
2. Selecciona una simulación
3. Ajusta los parámetros con los sliders
4. Presiona el botón de acción (Lanzar/Frenar/Mover)
5. Observa los resultados en tiempo real

## 📊 Mejoras Físicas Clave

### Colisión de Bolas (Revisión Completa)

✅ **Problema resuelto**: Las bolas ahora colisionan correctamente

**Implementación:**
- Detección precisa de colisión por distancia entre centros
- Descomposición en componentes normal y tangencial
- Fórmulas de colisión elástica con coeficiente de restitución
- Separación física para evitar superposición
- Fricción realista con la mesa
- Rebote en bordes con pérdida de energía
- Vectores de velocidad visualizados

**Física correcta:**
```javascript
// Vector unitario de colisión
nx = (x2 - x1) / distancia
ny = (y2 - y1) / distancia

// Proyección de velocidades
v1n = v1x·nx + v1y·ny  (componente normal)
v1t = v1x·tx + v1y·ty  (componente tangencial)

// Nuevas velocidades (colisión elástica)
v1n' = ((m1-e·m2)·v1n + (1+e)·m2·v2n) / (m1+m2)
v2n' = ((m2-e·m1)·v2n + (1+e)·m1·v1n) / (m1+m2)

// Separación para evitar superposición
overlap = (r1 + r2) - distancia
separación = overlap/2
```

## 🎓 Aplicaciones Educativas

- Comprender F = ma en contextos reales
- Visualizar conservación de momento
- Experimentar con diferentes masas y fuerzas
- Analizar gráficamente el movimiento
- Verificar cálculos teóricos

## 📝 Licencia

MIT License - Uso educativo libre

## 👨‍💻 Autor

Desarrollado para enseñanza de Física 1 - 2025

---

**¡Explora la física en acción! 🔬⚡**
