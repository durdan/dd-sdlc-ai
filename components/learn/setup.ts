"use client"
// Where the learning library lives on this site, and where its assets come from.
import { configure } from "design-player/core"
import "design-player/style.css"

configure({
  base: "/learn",
  assets: "/learn",
  audio: process.env.NEXT_PUBLIC_LEARN_AUDIO_BASE || "/learn/audio",
})
