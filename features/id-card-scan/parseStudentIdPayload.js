/**
 * Normalizes QR / barcode payloads into { studentId, studentName?, dept? }.
 * Supports plain roll strings, JSON objects, and query-string URLs.
 */
export const parseStudentIdPayload = (raw) => {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text);
      const studentId =
        obj.studentId ?? obj.roll ?? obj.rollNo ?? obj.roll_number ?? obj.id ?? null;
      if (!studentId) return null;
      return {
        studentId: String(studentId).trim(),
        studentName: obj.studentName ?? obj.name ?? undefined,
        dept: obj.dept ?? obj.department ?? obj.class ?? undefined,
      };
    } catch {
      return null;
    }
  }

  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const studentId =
        url.searchParams.get('roll') ??
        url.searchParams.get('studentId') ??
        url.searchParams.get('id');
      if (studentId) {
        return {
          studentId: studentId.trim(),
          studentName: url.searchParams.get('name') ?? undefined,
          dept: url.searchParams.get('dept') ?? undefined,
        };
      }
    } catch {
      // fall through to plain text
    }
  }

  if (text.includes('|')) {
    const [roll, name, dept] = text.split('|').map((s) => s.trim());
    if (roll) {
      return {
        studentId: roll,
        studentName: name || undefined,
        dept: dept || undefined,
      };
    }
  }

  if (/^[A-Za-z0-9][A-Za-z0-9._-]{2,}$/.test(text)) {
    return { studentId: text };
  }

  return null;
};
