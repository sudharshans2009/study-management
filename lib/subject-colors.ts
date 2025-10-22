export type SubjectColorVariant = {
  bg: string;
  border: string;
  softBg: string;
  text: string;
};

const DEFAULT_SUBJECT_COLOR_CLASSES: SubjectColorVariant = {
  bg: "subject-color-default-bg",
  border: "subject-color-default-border",
  softBg: "subject-color-default-soft-bg",
  text: "subject-color-default-text",
};

const SUBJECT_COLOR_CLASS_MAP: Record<string, SubjectColorVariant> = {
  "#3B82F6": {
    bg: "subject-color-blue-bg",
    border: "subject-color-blue-border",
    softBg: "subject-color-blue-soft-bg",
    text: "subject-color-blue-text",
  },
  "#EF4444": {
    bg: "subject-color-red-bg",
    border: "subject-color-red-border",
    softBg: "subject-color-red-soft-bg",
    text: "subject-color-red-text",
  },
  "#10B981": {
    bg: "subject-color-green-bg",
    border: "subject-color-green-border",
    softBg: "subject-color-green-soft-bg",
    text: "subject-color-green-text",
  },
  "#F59E0B": {
    bg: "subject-color-amber-bg",
    border: "subject-color-amber-border",
    softBg: "subject-color-amber-soft-bg",
    text: "subject-color-amber-text",
  },
  "#8B5CF6": {
    bg: "subject-color-violet-bg",
    border: "subject-color-violet-border",
    softBg: "subject-color-violet-soft-bg",
    text: "subject-color-violet-text",
  },
  "#EC4899": {
    bg: "subject-color-pink-bg",
    border: "subject-color-pink-border",
    softBg: "subject-color-pink-soft-bg",
    text: "subject-color-pink-text",
  },
  "#06B6D4": {
    bg: "subject-color-cyan-bg",
    border: "subject-color-cyan-border",
    softBg: "subject-color-cyan-soft-bg",
    text: "subject-color-cyan-text",
  },
  "#F97316": {
    bg: "subject-color-orange-bg",
    border: "subject-color-orange-border",
    softBg: "subject-color-orange-soft-bg",
    text: "subject-color-orange-text",
  },
};

export function getSubjectColorClasses(color: string): SubjectColorVariant {
  return SUBJECT_COLOR_CLASS_MAP[color] ?? DEFAULT_SUBJECT_COLOR_CLASSES;
}
