# design-player (vendored build)

Built output of the design-player library (narrated architecture walkthroughs).
Do not edit here: change the library in the design-player repo, then run

    npm run build:lib
    npx tsx scripts/sync-host.ts ~/devel/projects/dd-sdlc-ai --audio

which refreshes this folder and the exported content in public/learn,
including the narration clips (committed; served by Vercel).
