/**
 * Utilidades reutilizables para el feature Kanban
 */

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Parsea una fecha de deadline en formato string
 */
export function parseDeadline(value: string): Date | null {
  if (!value) {
    return null;
  }
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map((part) => Number.parseInt(part, 10));
    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return new Date(Date.UTC(year, month - 1, day));
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Calcula los días restantes hasta el deadline
 * @param deadline - Fecha del deadline en formato string (YYYY-MM-DD)
 * @returns Número de días restantes (positivo = días restantes, negativo = días overdue, null = fecha inválida)
 */
export function calculateDaysLeft(deadline: string): number | null {
  const deadlineDate = parseDeadline(deadline);
  if (!deadlineDate) {
    return null;
  }
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const deadlineUtc = Date.UTC(
    deadlineDate.getUTCFullYear(),
    deadlineDate.getUTCMonth(),
    deadlineDate.getUTCDate(),
  );
  return Math.floor((deadlineUtc - todayUtc) / MS_IN_DAY);
}

/**
 * Obtiene el label de texto para los días restantes
 * @param deadline - Fecha del deadline en formato string (YYYY-MM-DD)
 * @returns String con el label de días restantes
 */
export function getDaysLeftLabel(deadline: string): string {
  const diff = calculateDaysLeft(deadline);
  if (diff === null) {
    return "—";
  }
  if (diff > 1) {
    return `${diff} days left`;
  }
  if (diff === 1) {
    return "1 day left";
  }
  if (diff === 0) {
    return "Due today";
  }
  return `${Math.abs(diff)} days overdue`;
}

/**
 * Obtiene la clase CSS para el color basándose en los días restantes
 * @param deadline - Fecha del deadline en formato string (YYYY-MM-DD)
 * @returns String con la clase CSS de color
 */
export function getDaysLeftColorClass(deadline: string): string {
  const diff = calculateDaysLeft(deadline);
  if (diff === null) {
    return "";
  }
  // Overdue: rojo
  if (diff < 0) {
    return "text-danger";
  }
  // Due today o near deadline (1-7 días): amarillo/naranja
  if (diff === 0 || (diff > 0 && diff <= 7)) {
    return "text-warning";
  }
  // Normal (> 7 días): azul
  return "text-daxa";
}

