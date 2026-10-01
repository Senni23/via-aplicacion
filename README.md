# VÍA — Voz, Imagen y Accesibilidad

Aplicación móvil que convierte cualquier contenido digital en información accesible para
personas con discapacidad visual.

> *No corrige la web ajena; corrige cómo esa web llega al usuario.*

**Proyecto final — Interacción entre Hombre y Máquina · Universidad Tecnológica del Perú**
Enrique Sebastian Poma Nizama · U23200217

---

## 👉 Si es tu primera vez aquí, abre [`EMPEZAR_AQUI.md`](EMPEZAR_AQUI.md)

---

## Qué hace

| Módulo | Función |
|---|---|
| Lector adaptativo | Reconstruye webs y documentos según WCAG 2.2 |
| Ojo IA | OCR por cámara y descripción de imágenes, con guía de captura por voz |
| Navegación por voz | Comandos naturales en español peruano |
| Perfil de accesibilidad | Ceguera total, baja visión o daltonismo |
| Ayuda humana | Voluntario por videollamada cuando la IA no basta |
| Modo sin conexión | OCR y voz en el propio dispositivo |

## Stack

Flutter · Dart · `provider` · `flutter_tts` · `speech_to_text` · `camera` ·
`google_mlkit_text_recognition` · `shared_preferences`

## Estructura

```
via-app/
├── CLAUDE.md              contexto que Claude Code lee automáticamente
├── EMPEZAR_AQUI.md        los tres primeros pasos
├── docs/                  propuesta, requisitos, arquitectura, diseño, pantallas, plan
├── mockups/png/           las seis pantallas diseñadas (390×844)
├── mockups/html/          el código con el que se hicieron
├── prompts/               mensajes listos para copiar
└── lib/                   ← el código Flutter (aún no existe: se crea en la Fase 0)
```

## Estado

**Fase 0** — entorno. Todavía no hay código Flutter.

Ver el avance completo en [`docs/06-plan-fases.md`](docs/06-plan-fases.md).

## Accesibilidad

Esta app es una herramienta de accesibilidad: si no es accesible, no sirve. El objetivo es
**WCAG 2.2 nivel AAA** en las pantallas propias. Ver
[`docs/04-design-system.md`](docs/04-design-system.md).

Prueba de aceptación de todo el proyecto: **la app debe poder usarse con los ojos cerrados.**
