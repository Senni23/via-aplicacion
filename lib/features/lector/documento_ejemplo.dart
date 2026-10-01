import '../../data/models/contenido_lectura.dart';

/// Contenido de ejemplo para que P-03 se pueda probar y enseñar desde la
/// Fase 4, antes de que existan documentos reales leídos por OCR (Fase 8)
/// o por el lector web (Fase 10).
final documentoEjemplo = ContenidoLectura(
  titulo: 'Nueva línea del Metro de Lima entra en operación',
  fuente: 'Documento de ejemplo',
  origen: OrigenLectura.ejemplo,
  secciones: [
    const SeccionLectura(
      encabezado: 'Nueva línea del Metro de Lima entra en operación',
      parrafos: [
        'El tramo une Ate con el Callao y reduce el tiempo de viaje de 90 a 45 minutos.',
        'Las 18 estaciones cuentan con piso podotáctil y anuncios sonoros en cada parada.',
      ],
      imagenesSinAlt: ['estacion-metro.jpg'],
    ),
    const SeccionLectura(
      encabezado: 'Accesibilidad en las estaciones',
      parrafos: [
        'Cada estación tiene ascensores y rampas verificadas por una auditoría independiente.',
        'El sistema de anuncios sonoros indica la próxima parada con treinta segundos de anticipación.',
      ],
    ),
    const SeccionLectura(
      encabezado: 'Tarifas y horarios',
      parrafos: [
        'El pasaje cuesta dos soles con cincuenta céntimos y se paga con tarjeta recargable.',
        'El servicio funciona de cinco de la mañana a once de la noche, todos los días.',
      ],
    ),
  ],
);
