---
id: android-background
title: Background work, WorkManager and foreground services
summary: Deferrable work goes to WorkManager; user-visible work gets a notification
why: "Android limits what apps may do when the user isn't looking: Doze, App Standby buckets and background-start rules. Work that ignores them simply doesn't run."
requires: [android-processes, android-coroutines]
lesson: none
points:
  - { title: "WorkManager for work that must finish", text: "It persists the request, survives process death and reboots, honours constraints like network and charging, and retries with backoff." }
  - { title: "Foreground services for work the user is watching", text: "Music, navigation, an active call: they show a notification and, from Android 14, must declare a service type." }
  - { title: "The system batches the rest", text: "Doze and standby buckets defer jobs, alarms and network access to maintenance windows when the device is idle or the app is rarely used." }
quiz:
  - q: An app must upload a photo the user just took, even if they close the app. What fits best?
    options:
      - A coroutine in viewModelScope
      - A OneTimeWorkRequest with a network constraint (expedited if it should start right away)
      - A Thread started from the Activity
    answer: 1
    explain: "viewModelScope and plain threads die with the screen or the process. WorkManager stores the request and runs it, retrying with backoff, until it succeeds or you give up."
  - q: What is the shortest repeat interval for a PeriodicWorkRequest?
    options:
      - 1 minute
      - 15 minutes
      - 1 hour
    answer: 1
    explain: "WorkManager follows JobScheduler's minimum of 15 minutes, and the actual run time also depends on constraints, Doze and the app's standby bucket."
  - q: An app targeting Android 15 runs a dataSync foreground service while in the background. What limit applies?
    options:
      - None; foreground services can run indefinitely
      - About 6 hours in total per 24 hours, after which onTimeout() is called and the service must stop
      - 10 minutes per start
    answer: 1
    explain: "From Android 15, dataSync and mediaProcessing foreground services share a 6-hour budget per 24 hours while the app is in the background. Stop the service in onTimeout() or the system raises an error."
links:
  - { title: "Persistent work with WorkManager (Android Developers)", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }
  - { title: "Foreground services overview (Android Developers)", url: "https://developer.android.com/develop/background-work/services/fgs" }
  - { title: "Optimize for Doze and App Standby (Android Developers)", url: "https://developer.android.com/training/monitoring-device-state/doze-standby" }
  - { title: "App Standby Buckets (Android Developers)", url: "https://developer.android.com/topic/performance/appstandby" }
---
Once your app leaves the screen, its process becomes a candidate for killing and its access to CPU, network and alarms is rationed. Android offers two honest ways to keep working: hand the job to **WorkManager**, which the system runs when conditions allow, or run a **foreground service**, which keeps the process important in exchange for a notification the user can see.

## WorkManager

```kotlin
class UploadWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val uri = inputData.getString("uri") ?: return Result.failure()
        return try {
            uploader.upload(uri)          // suspend, main-safe
            Result.success()
        } catch (e: IOException) {
            Result.retry()                // rescheduled with backoff
        }
    }
}

val request = OneTimeWorkRequestBuilder<UploadWorker>()
    .setInputData(workDataOf("uri" to uri.toString()))
    .setConstraints(Constraints(requiredNetworkType = NetworkType.CONNECTED))
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
    .build()

WorkManager.getInstance(context).enqueueUniqueWork("upload-$id", ExistingWorkPolicy.KEEP, request)
```

WorkManager writes the request to its own database, so it survives process death and reboots. It runs on JobScheduler underneath. Useful extras:

- **Unique work** stops duplicates when the user taps twice.
- **Chains** (`beginWith(a).then(b)`) run steps in order.
- **Periodic work** repeats no more often than every 15 minutes.
- **Expedited work** (`setExpedited`) starts as soon as possible for short, user-important tasks, within a quota; on Android 11 and lower it is backed by a foreground service, so provide `getForegroundInfo()`.
- `getWorkInfoByIdFlow(id)` lets the UI show progress.

Because a worker may run more than once, make it idempotent: uploading the same photo twice should not create two posts.

## Foreground services

Use one only when the user is aware of the task while it runs: playing media, navigation, a call, tracking a workout. It must show a notification, and:

- From Android 14 (API 34) every foreground service declares a type in the manifest (`mediaPlayback`, `location`, `dataSync`, `shortService`, ...) and holds the matching permission.
- From Android 12 (API 31) apps generally can't start a foreground service from the background, with listed exceptions such as a high-priority FCM message or an exact alarm.
- From Android 15 (API 35), `dataSync` and `mediaProcessing` services get about 6 hours per 24 hours while the app is in the background, then `onTimeout()` asks them to stop.

```kotlin
// After startForegroundService(intent), call this within 5 seconds:
ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
```

For one-off user-initiated transfers on Android 14+, a user-initiated data transfer job (JobScheduler) is often a better fit than a `dataSync` service.

## Doze and standby buckets

**Doze** (Android 6+) kicks in when the device is unplugged, still and screen-off for a while. Network access is cut and jobs, syncs and normal alarms wait for periodic maintenance windows, which get further apart over time. **App Standby buckets** (Android 9+) rank apps as active, working set, frequent, rare or restricted by how recently and often they are used; lower buckets get fewer job runs, alarms and network. The restricted bucket arrived in Android 12. These limits apply on battery only, and manufacturers can add their own on top.

Ways through, used sparingly: high-priority FCM messages, `setExactAndAllowWhileIdle` alarms (exact alarms need permission and, from Android 14, are denied by default for most new installs), and asking the user to exempt the app from battery optimisation, which Play allows only for specific use cases.
