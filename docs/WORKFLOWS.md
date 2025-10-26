# Upstash Workflow Integration

This directory contains Upstash Workflow-based implementations for durable, multi-step processes.

## What is Upstash Workflow?

Upstash Workflow is a serverless framework for building durable, long-running functions with:
- **Automatic retries**: Failed steps retry automatically
- **State persistence**: Workflow state persists across server restarts
- **Long-running execution**: Can sleep for days/weeks between steps
- **Conditional logic**: Make decisions based on previous step results
- **Parallel execution**: Run multiple steps concurrently
- **Built-in observability**: Track workflow runs in Upstash console

## Available Workflows

### 1. QStash Setup Workflow (`/api/workflow/setup-qstash`)

**Purpose**: Configure QStash cron schedules with automatic retries and failure handling.

**Benefits over simple script**:
- ✅ Automatic retries on transient failures
- ✅ State persists if server crashes mid-setup
- ✅ Better error handling and logging
- ✅ Can be triggered remotely via API
- ✅ Failure notifications via webhook

**Usage**:

```bash
# Via script
bun run workflow:setup

# Via API
curl -X POST https://your-app.com/api/workflow/setup-qstash

# Force recreate all schedules
curl -X POST https://your-app.com/api/workflow/setup-qstash \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "deleted": 3,
    "created": 3,
    "failed": 0
  },
  "schedules": [
    {
      "name": "global-update-hourly",
      "scheduleId": "scd_abc123",
      "cron": "0 * * * *",
      "destination": "https://your-app.com/api/qstash/global-update"
    }
  ],
  "usage": {
    "scheduled": 29,
    "limit": 500,
    "available": 471
  }
}
```

**Workflow Steps**:
1. List existing schedules
2. Delete old schedules (if any)
3. Wait 2 seconds for propagation
4. Create 3 new schedules:
   - Hourly global updates
   - Batch onboarding (every 6h)
   - Daily goal reminders (8 PM UTC)
5. Calculate usage statistics
6. Return summary

### 2. Onboarding Workflow (`/api/workflow/onboarding`)

**Purpose**: Multi-day user onboarding sequence with timed email delivery.

**Features**:
- Sends welcome email immediately
- Waits 1 day, sends reminder
- Waits 3 more days, sends encouragement
- All state persists across the 4-day period

**Usage**:

```bash
# Trigger for a new user
curl -X POST https://your-app.com/api/workflow/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

**Response**:
```json
{
  "success": true,
  "userId": "user-123",
  "emailsSent": 3,
  "duration": "4 days",
  "completedAt": "2024-01-19T10:00:00.000Z"
}
```

**Workflow Steps**:
1. **Day 0**: Send welcome email
2. **Sleep 24 hours**
3. **Day 1**: Send reminder email
4. **Sleep 72 hours**
5. **Day 4**: Send final encouragement
6. Return completion summary

**Integration Example**:

```typescript
// In your user registration handler
import { nanoid } from "nanoid";

async function registerUser(data: RegisterData) {
  // Create user in database
  const userId = nanoid();
  await db.insert(users).values({
    id: userId,
    email: data.email,
    name: data.name,
  });

  // Trigger onboarding workflow
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      email: data.email,
      name: data.name,
    }),
  });

  return userId;
}
```

## Configuration

### Environment Variables

```env
# Required for workflows
QSTASH_TOKEN=your-qstash-token
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Workflow Options

Each workflow can be configured with:

```typescript
export const { POST } = serve<PayloadType>(
  async (context) => {
    // Workflow logic...
  },
  {
    retries: 3, // Retry failed steps up to 3 times
    failureUrl: "/api/workflow/failure", // Called when all retries fail
  }
);
```

## Monitoring

### Upstash Console

View workflow runs at: https://console.upstash.com/workflow

**Dashboard shows**:
- Active workflows
- Completed workflows
- Failed workflows
- Step-by-step execution logs
- Retry history
- Sleep timers

### Local Debugging

Workflows log to console during execution:

```
[Workflow] Fetching existing QStash schedules...
[Workflow] Found 3 existing schedules
[Workflow] Deleting 3 existing schedules...
[Workflow] Deleted schedule: scd_abc123
[Workflow] Creating 3 new schedules...
[Workflow] ✓ Created schedule: global-update-hourly
```

## Best Practices

### 1. Idempotency

Make workflow steps idempotent so retries don't cause issues:

```typescript
await context.run("create-resource", async () => {
  // Check if already exists
  const exists = await checkResourceExists(id);
  if (exists) {
    return { alreadyExists: true };
  }
  
  // Create only if doesn't exist
  return await createResource(id);
});
```

### 2. Error Handling

Wrap external API calls in try-catch:

```typescript
await context.run("send-email", async () => {
  try {
    await sendEmail(data);
    return { success: true };
  } catch (error) {
    console.error("Email failed:", error);
    throw error; // Triggers retry
  }
});
```

### 3. Step Naming

Use descriptive step names for debugging:

```typescript
// ❌ Bad
await context.run("step1", async () => {});

// ✅ Good
await context.run("send-welcome-email", async () => {});
```

### 4. Long Sleeps

Use sleeps for time-based workflows:

```typescript
// Sleep for 1 day (86400 seconds)
await context.sleep("wait-1-day", 60 * 60 * 24);

// Sleep for 1 week
await context.sleep("wait-1-week", 60 * 60 * 24 * 7);
```

### 5. Conditional Logic

Make decisions based on previous steps:

```typescript
const userActive = await context.run("check-activity", async () => {
  return await checkUserActivity(userId);
});

if (!userActive) {
  await context.run("send-reminder", async () => {
    await sendReminderEmail(userId);
  });
}
```

## Advanced Patterns

### Parallel Execution

Run multiple steps concurrently:

```typescript
await context.run("parallel-tasks", async () => {
  await Promise.all([
    sendEmail(user1),
    sendEmail(user2),
    sendEmail(user3),
  ]);
});
```

### Wait/Notify

Wait for external events:

```typescript
// In workflow
await context.waitForEvent("payment-confirmed", 60 * 60); // Wait 1 hour

// From external system (webhook)
await fetch(`${workflowUrl}/notify`, {
  method: "POST",
  body: JSON.stringify({
    eventId: "payment-confirmed",
    eventData: { amount: 100 },
  }),
});
```

### Cleanup on Failure

Use try-finally for cleanup:

```typescript
await context.run("process-with-cleanup", async () => {
  const lock = await acquireLock();
  try {
    await processData();
  } finally {
    await releaseLock(lock);
  }
});
```

## Troubleshooting

### Workflow stuck/not progressing

**Symptoms**: Workflow doesn't complete, stuck on a step

**Solutions**:
1. Check Upstash console for error messages
2. Verify environment variables are set
3. Check if external APIs are reachable
4. Review step logs for exceptions
5. Ensure workflow URL is publicly accessible

### Workflow failed after retries

**Symptoms**: Workflow shows as failed in console

**Solutions**:
1. Check failure webhook logs
2. Review error messages in workflow logs
3. Fix underlying issue (e.g., bad API credentials)
4. Manually retry from Upstash console

### Workflow never triggered

**Symptoms**: POST to workflow endpoint succeeds but workflow doesn't start

**Solutions**:
1. Verify `QSTASH_TOKEN` is set correctly
2. Check that workflow is properly exported: `export const { POST } = serve(...)`
3. Ensure route file is at correct path
4. Check Vercel/Next.js build logs for compilation errors

### Sleep durations incorrect

**Symptoms**: Workflow wakes up too early/late

**Solutions**:
1. Verify sleep duration is in **seconds** not milliseconds
2. Check timezone settings (workflows use UTC)
3. Account for processing time between steps

## Migration from Simple Scripts

**Before** (Simple script):
```typescript
// scripts/setup-schedules.ts
async function setup() {
  const schedules = await qstash.schedules.list();
  for (const s of schedules) {
    await qstash.schedules.delete(s.id);
  }
  // If script crashes here, partial state!
  await qstash.schedules.create(...);
}
```

**After** (Workflow):
```typescript
// app/api/workflow/setup/route.ts
export const { POST } = serve(async (context) => {
  const schedules = await context.run("list", async () => {
    return await qstash.schedules.list();
  });
  
  await context.run("delete", async () => {
    // State persists, can resume if crashes
    for (const s of schedules) {
      await qstash.schedules.delete(s.id);
    }
  });
  
  await context.run("create", async () => {
    await qstash.schedules.create(...);
  });
});
```

**Benefits**:
- ✅ Each step persists state
- ✅ Can resume after crashes
- ✅ Automatic retries
- ✅ Better observability

## Cost Considerations

Upstash Workflow pricing:
- **Free tier**: 1,000 workflow runs/month
- **Steps**: Each `context.run()` counts as one step
- **Sleeps**: Free, doesn't count as steps

**Optimization tips**:
- Combine related operations in one step
- Use `Promise.all()` for parallel operations
- Avoid unnecessary steps
- Use conditional logic to skip steps

Example:
```typescript
// ❌ Bad (3 steps)
await context.run("step1", () => task1());
await context.run("step2", () => task2());
await context.run("step3", () => task3());

// ✅ Good (1 step)
await context.run("combined", async () => {
  await Promise.all([task1(), task2(), task3()]);
});
```

## Resources

- [Upstash Workflow Docs](https://upstash.com/docs/workflow/getstarted)
- [Workflow Dashboard](https://console.upstash.com/workflow)
- [Workflow Examples](https://github.com/upstash/workflow-js/tree/main/examples)
- [API Reference](https://upstash.com/docs/workflow/basics/serve)

## Support

For issues:
1. Check workflow logs in Upstash console
2. Review troubleshooting section above
3. Check application logs in Vercel dashboard
4. Verify environment variables
5. Test workflow locally with `next dev`
