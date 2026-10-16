---
id: android-background
title: Background work, WorkManager and foreground services
summary: Deferrable work goes to WorkManager; user-visible work gets a notification
why: "Android limits what apps may do when the user isn't looking: Doze, App Standby buckets and background-start rules. Work that ignores them simply doesn't run."
requires: [android-processes, android-coroutines]
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: workmanager-upload
title: Handing an upload to WorkManager
subtitle: Enqueue, wait for the system, retry with backoff
kind: sequence
elements:
  - { id: app, label: App }
  - { id: wm, label: WorkManager }
  - { id: jobs, label: JobScheduler }
  - { id: worker, label: Worker }
edges:
  - { id: enqueue, from: app, to: wm, label: "enqueueUniqueWork, needs network" }
  - { id: persist, from: wm, to: wm, label: saves it to its database }
  - { id: schedule, from: wm, to: jobs, label: schedules a job }
  - { id: defer, from: jobs, to: jobs, label: "Doze, standby bucket: waits" }
  - { id: run, from: jobs, to: worker, label: "constraints met: doWork()" }
  - { id: upload, from: worker, to: worker, label: "upload(uri)" }
  - { id: fail, from: worker, to: worker, label: IOException, style: dashed }
  - { id: retry, from: worker, to: wm, label: "Result.retry()", style: dashed }
  - { id: backoff, from: wm, to: jobs, label: "reschedule after 30 s, then 60 s, ..." }
  - { id: rerun, from: jobs, to: worker, label: "doWork() again" }
  - { id: success, from: worker, to: wm, label: "Result.success()", style: dashed }
steps:
  - caption: Android rations what a backgrounded app may do. WorkManager is the honest way through. You describe the work and its constraints, and the system runs it when conditions allow.
  - caption: The app enqueues a unique upload that needs a network. WorkManager writes it to its own database, so it survives the process dying and the phone rebooting. Unique work means a double tap doesn't upload twice.
    trace: [enqueue, persist]
  - caption: Underneath, WorkManager schedules a JobScheduler job with the same constraints.
    trace: [schedule]
  - caption: The system decides when. In Doze, an idle device on battery defers jobs to maintenance windows. The app's standby bucket, from active down to restricted, sets how often its jobs may run.
    trace: [defer]
  - caption: Once the constraints hold, the UploadWorker's doWork() runs and starts uploading the photo to your server.
    trace: [run, upload]
  - caption: The network drops and the upload throws. The worker returns Result.retry() instead of giving up.
    trace: [fail, retry]
  - caption: WorkManager reschedules with exponential backoff, 30 seconds and then doubling, and the worker runs again. Because it can run more than once, it must be idempotent.
    trace: [backoff, rerun]
  - caption: This time it succeeds and the work is done. The UI can follow along with getWorkInfoByIdFlow.
    trace: [success]
  - caption: If the user is watching the work, like music, navigation or a call, use a foreground service with a notification instead. From Android 14 it must declare a type. From Android 15, dataSync services get about 6 hours a day in the background.
    focus: [app]
note: Periodic work repeats no more often than every 15 minutes, and expedited work starts right away within a quota.
```
