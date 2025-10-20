/**
 * Example service for handling study session analytics
 */

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  focusScore?: number;
}

/**
 * Calculate total study time for a user
 */
export function calculateTotalStudyTime(sessions: StudySession[]): number {
  return sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);
}

/**
 * Get study time breakdown by subject
 */
export function getStudyTimeBySubject(sessions: StudySession[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  sessions.forEach((session) => {
    if (session.subjectId && session.duration) {
      breakdown[session.subjectId] = (breakdown[session.subjectId] || 0) + session.duration;
    }
  });
  
  return breakdown;
}

/**
 * Calculate average focus score
 */
export function calculateAverageFocusScore(sessions: StudySession[]): number {
  const sessionsWithScore = sessions.filter((s) => s.focusScore !== undefined);
  
  if (sessionsWithScore.length === 0) return 0;
  
  const total = sessionsWithScore.reduce((sum, s) => sum + (s.focusScore || 0), 0);
  return Math.round((total / sessionsWithScore.length) * 10) / 10;
}

/**
 * Get study sessions for a specific date range
 */
export function getSessionsInRange(
  sessions: StudySession[],
  startDate: Date,
  endDate: Date
): StudySession[] {
  return sessions.filter((session) => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}
