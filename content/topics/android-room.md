---
id: android-room
title: Local data with Room
summary: SQLite with checked queries, suspend calls and Flows
why: "The phone is often offline and the process is often killed. A local database is the one store that survives both, and Room makes it hard to get the threading or the SQL wrong."
requires: [android-coroutines]
lesson: none
points:
  - { title: "Three parts", text: "Entities are tables, DAOs are the queries, and the @Database class ties them together and hands out DAOs." }
  - { title: "Checked at build time", text: "Room's annotation processor (KSP) validates your SQL against the schema and generates the code; a typo fails the build." }
  - { title: "Observe, don't poll", text: "A DAO method that returns Flow emits again whenever the tables it reads change." }
  - { title: "Migrations are part of the schema", text: "Bump the version, and give Room a migration (automatic or written) for every step users might still be on." }
quiz:
  - q: "A DAO method is declared fun observeAll(): Flow<List<Note>>. When does it emit?"
    options:
      - Once, when first collected
      - When first collected, and again after every change to the note table
      - Only after you call refresh()
    answer: 1
    explain: "Room tracks which tables a query reads and re-runs it when a write to one of them commits. That is why the UI can just collect the Flow and never ask for updates."
  - q: You add a column and bump the database version from 3 to 4, but provide no migration. What happens on a phone that has version 3?
    options:
      - Room adds the column automatically
      - Opening the database fails with an exception, unless you allowed destructive migration (which deletes the data)
      - The app keeps using version 3
    answer: 1
    explain: "Room refuses to guess. Add an @AutoMigration (with an exported schema) or a Migration(3, 4) with the ALTER TABLE, or explicitly opt in to fallbackToDestructiveMigration if losing the data is acceptable."
  - q: Why does Room recommend a single RoomDatabase instance per process?
    options:
      - Each instance is expensive and keeps its own connections and observers
      - Two instances would use different schemas
      - Android limits each app to one SQLite file
    answer: 0
    explain: "The Room docs call each instance fairly expensive. Create it once (a DI singleton) and share it; multi-process apps add enableMultiInstanceInvalidation()."
links:
  - { title: "Save data in a local database using Room (Android Developers)", url: "https://developer.android.com/training/data-storage/room" }
  - { title: "Migrate your Room database (Android Developers)", url: "https://developer.android.com/training/data-storage/room/migrating-db-versions" }
  - { title: "Room 3.0 release notes (Android Developers)", url: "https://developer.android.com/jetpack/androidx/releases/room3" }
  - { title: "Build an offline-first app (Android Developers)", url: "https://developer.android.com/topic/architecture/data-layer/offline-first" }
---
Room is the Jetpack layer over SQLite, the database that ships with Android. You describe tables as Kotlin classes and queries as annotated functions, and at build time Room checks the SQL against the schema and generates the implementation. At run time your code calls suspend functions and collects Flows instead of handling cursors and threads by hand.

## The three parts

```kotlin
@Entity(tableName = "note")
data class Note(
    @PrimaryKey val id: String,
    val title: String,
    val body: String,
    val updatedAt: Long,
)

@Dao
interface NoteDao {
    @Query("SELECT * FROM note ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<Note>>

    @Query("SELECT * FROM note WHERE id = :id")
    suspend fun get(id: String): Note?

    @Upsert
    suspend fun save(note: Note)
}

@Database(entities = [Note::class], version = 1, exportSchema = true)
abstract class AppDatabase : RoomDatabase() {
    abstract fun notes(): NoteDao
}
```

Build the database once and share it (a DI singleton):

```kotlin
val db = Room.databaseBuilder<AppDatabase>(context, "app.db").build()
```

## Threads and observation

Room's suspend DAO functions are main-safe: they run on Room's own executor and resume you where you were. In Room 2.x, a blocking (non-suspend) query called on the main thread throws unless you explicitly allow it, which you shouldn't. A `Flow` return type turns a query into a live view: Room re-runs it whenever a write to a table it reads commits, so the screen updates itself after a save anywhere in the app.

Group writes that belong together in a transaction (`@Transaction` on a DAO method, or `db.withTransaction { ... }` in 2.x) so observers see all of them or none.

## Migrations

The schema version is part of your app's contract with every installed copy. When you change an entity, bump `version` and tell Room how to get there:

```kotlin
@Database(
    entities = [Note::class],
    version = 2,
    autoMigrations = [AutoMigration(from = 1, to = 2)],   // needs exported schema JSON for both versions
)
abstract class AppDatabase : RoomDatabase() { /* ... */ }

// For changes Room can't infer (renames, splitting tables), write it:
val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE note ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0")
    }
}
```

Keep the exported schema files in version control and test migrations with `MigrationTestHelper`. Without a migration path, opening the database fails; `fallbackToDestructiveMigration()` makes it wipe the data instead, which is only acceptable for pure caches.

## Room 2.x and Room 3.0

**Version note:** most apps today use Room 2.x (package `androidx.room`). Room 3.0, released in July 2026, moves to a new package (`androidx.room3`), is built around Kotlin Multiplatform, generates Kotlin only, requires KSP (no KAPT), and makes database operations coroutine-based: DAO functions must be `suspend` unless they return a reactive type like `Flow`. The `SupportSQLite` APIs (used in the migration above) are replaced by SQLite driver APIs unless you add the compatibility wrapper. The entity, DAO and database annotations stay the same, so the model on this page carries over.

## Room as the source of truth

A common offline-first shape: the UI observes Room; a repository fetches from the network and writes into Room; the Flow delivers the update. The screen works offline, survives process death, and has one place where data comes from.
