# Statistics Page Documentation

## Overview

The Statistics page provides comprehensive analytics and insights into user study patterns, including time distribution, subject breakdown, session types, focus scores, and productivity insights.

## Features

### 1. Time Period Filters
- **Week**: Last 7 days
- **Month**: Last 30 days  
- **Year**: Last 365 days
- **All Time**: Complete history

### 2. Overview Metrics
Four key metric cards showing:
- **Total Study Time**: Hours and minutes with trend comparison
- **Study Sessions**: Session count with average length
- **Current Streak**: Active streak with best streak
- **Goals**: Completed and active goal counts

### 3. Visualizations

#### Time Distribution Chart
- **Type**: Area chart
- **Shows**: Study time progression over the selected period
- **Format**: Date on X-axis, minutes on Y-axis
- **Features**: Gradient fill, hover tooltip

#### Subject Breakdown Chart
- **Type**: Pie chart
- **Shows**: Time distribution across subjects
- **Features**: Subject colors, percentage labels, hover tooltips
- **Empty State**: Displays message when no subject data

#### Session Type Chart
- **Type**: Bar chart
- **Shows**: Breakdown by session type (timer/pomodoro/stopwatch)
- **Features**: Session count and total minutes
- **Format**: Type on X-axis, minutes on Y-axis

#### Focus Score Analysis
- **Type**: Composite (Average + Bar chart)
- **Shows**: 
  - Average focus score with emoji feedback (🎯 Excellent, 👍 Good, 😐 Fair, 📈 Keep improving)
  - Distribution of sessions by score ranges (0-20, 21-40, 41-60, 61-80, 81-100)
- **Empty State**: Message when no focus data available

### 4. Productivity Insights
Text-based insights card showing:
- **Most Productive Day**: Best performing weekday
- **Peak Study Time**: Hour of day with most activity (12h format)
- **Daily Average**: Average sessions per day
- **Tip**: Personalized productivity suggestion

### 5. Export Functionality
- Downloads stats as JSON file
- Includes all metrics and metadata
- Filename format: `study-stats-{period}-{timestamp}.json`

## Implementation Details

### Files Structure

```
app/(app)/stats/
  └── page.tsx                              # Stats page route

components/stats/
  ├── stats-view.tsx                        # Main stats component
  ├── stats-overview.tsx                    # Overview metric cards
  ├── time-distribution-chart.tsx           # Area chart
  ├── subject-breakdown-chart.tsx           # Pie chart
  ├── session-type-chart.tsx                # Bar chart
  ├── focus-score-chart.tsx                 # Focus analysis
  ├── productivity-insights.tsx             # Insights card
  └── export-stats-button.tsx               # Export button

actions/
  └── stats-actions.ts                      # Server actions for data aggregation

lib/
  └── stats-utils.ts                        # Utility functions and types
```

### Data Flow

1. **User selects period** → State updated in `stats-view.tsx`
2. **React Query fetches data** → Calls `getStudyStats(period)` server action
3. **Server aggregates data** → Queries sessions, goals, subjects from database
4. **Calculations performed** → Utilities in `stats-utils.ts` process data
5. **Components render** → Each chart/card displays relevant portion
6. **Comparison data fetched** → `getStatsComparison(period)` for trends

### Key Functions

#### `getStudyStats(period)`
Server action that:
- Authenticates user
- Queries completed sessions in date range
- Queries goals and subjects
- Calculates 13 different metrics
- Generates time series data
- Computes session type breakdown
- Analyzes focus scores
- Identifies productivity patterns
- Returns `StudyStats` object

#### `getStatsComparison(period)`
Server action that:
- Compares current period with previous period
- Calculates percentage change
- Determines trend direction (up/down/neutral)

#### Utility Functions
- `getDateRangeForPeriod()`: Calculate start/end dates
- `generateTimeSeriesData()`: Create chart-ready arrays
- `getMostProductiveDay()`: Analyze 7 days of week
- `getMostProductiveHour()`: Analyze 24 hours
- `getFocusScoreDistribution()`: Group into 5 ranges

### TypeScript Interfaces

```typescript
type StatsPeriod = 'week' | 'month' | 'year' | 'all-time';

interface StudyStats {
  // Time metrics
  totalMinutes: number;
  totalSessions: number;
  averageSessionLength: number;
  
  // Goal metrics
  dailyGoalProgress: number;
  goalsCompleted: number;
  goalsActive: number;
  currentStreak: number;
  longestStreak: number;
  
  // Breakdown data
  subjectBreakdown: SubjectStat[];
  timeDistribution: TimeSeriesData[];
  sessionTypeBreakdown: SessionTypeStat[];
  
  // Focus data
  averageFocusScore: number;
  focusScoreDistribution: FocusDistribution[];
  
  // Productivity insights
  mostProductiveDay: string;
  mostProductiveHour: number;
  averageSessionsPerDay: number;
}
```

## Database Queries

### Sessions Query
```typescript
const sessions = await db
  .select()
  .from(studySessionTable)
  .where(
    and(
      eq(studySessionTable.userId, session.user.id),
      eq(studySessionTable.status, "completed"),
      gte(studySessionTable.startTime, start),
      lte(studySessionTable.startTime, end)
    )
  )
  .orderBy(desc(studySessionTable.startTime));
```

### Goals & Subjects
- Fetches all goals for user (active and completed)
- Fetches all subjects for user
- Used for calculating streaks and subject breakdown

## Performance Considerations

1. **React Query Caching**: Data cached by period, avoids redundant fetches
2. **Suspense Boundaries**: Loading states handled at page level
3. **Lazy Calculations**: Charts only render when data available
4. **Empty States**: Quick early returns for no-data scenarios
5. **Date Range Filtering**: Database-level filtering for efficiency

## Error Handling

1. **Authentication**: Returns error if user not logged in
2. **Database Errors**: Wrapped in try-catch, returns error message
3. **Empty Data**: Graceful empty states in each component
4. **Loading States**: Skeleton loaders during data fetch

## Navigation

Stats page accessible via:
- **Route**: `/stats`
- **Icon**: BarChart3 (lucide-react)
- **Location**: Main navigation (desktop header, mobile sheet)
- **Label**: "Stats"

## Future Enhancements

Potential improvements:
- [ ] Custom date range picker
- [ ] Downloadable PDF reports
- [ ] Goal-specific analytics
- [ ] Subject comparison views
- [ ] Heatmap calendar view
- [ ] Study session recommendations
- [ ] Achievement badges
- [ ] Social comparison (anonymous)

## Testing Checklist

### Data States
- [ ] Empty state (no sessions)
- [ ] Single session
- [ ] Multiple sessions across periods
- [ ] Sessions without subjects
- [ ] Sessions without focus scores

### Period Filters
- [ ] Week filter shows last 7 days
- [ ] Month filter shows last 30 days
- [ ] Year filter shows last 365 days
- [ ] All-time shows complete history

### Charts
- [ ] Time distribution renders correctly
- [ ] Subject pie chart shows colors
- [ ] Session type bar chart displays all types
- [ ] Focus score shows average and distribution
- [ ] Empty states display when no data

### Functionality
- [ ] Period switching updates all components
- [ ] Trend indicators show correct direction
- [ ] Export downloads valid JSON
- [ ] Loading states appear during fetch
- [ ] Error states handle failures gracefully

### Responsive Design
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Charts resize properly
- [ ] Cards stack correctly on small screens

## Dependencies

- **recharts**: Chart library for visualizations
- **@tanstack/react-query**: Data fetching and caching
- **date-fns**: Date manipulation and formatting
- **drizzle-orm**: Database queries
- **lucide-react**: Icons for UI

## Related Documentation

- [Timezone System](./TIMEZONE_SYSTEM.md) - Goal reset timing
- [Session Tracking](./SESSION_TRACKING.md) - How sessions are recorded
- [Database Schema](./DATABASE_SCHEMA.md) - Table structures

---

Last updated: Phase 1-6 implementation complete
