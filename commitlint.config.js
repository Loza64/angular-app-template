/**
 * Reglas de mensajes de commit basadas en Conventional Commits.
 * Formato esperado: "<tipo>(<scope opcional>): <descripción>"
 * Ejemplos válidos: "feat: agrega selector de colores", "fix(auth): corrige deadlock del refresh token"
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // nueva funcionalidad
        'fix', // corrección de bug
        'update', // actualización/cambio que no es feature ni fix puntual
        'docs', // documentación
        'style', // formato, sin cambios de lógica
        'refactor', // refactor sin cambiar comportamiento
        'perf', // mejora de rendimiento
        'test', // tests
        'build', // build system, dependencias
        'ci', // integración continua
        'chore', // tareas varias de mantenimiento
        'revert', // revertir un commit previo
      ],
    ],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0], // permite tildes/mayúsculas en español sin bloquear el commit
  },
};
