import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { useTheme } from "../context/theme"
import { useKV } from "../context/kv"
import type { JSX } from "@opentui/solid"
import type { RGBA } from "@opentui/core"
import type { ColorGenerator } from "opentui-spinner"

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

export function Spinner(props: {
  children?: JSX.Element
  color?: RGBA
  frames?: string[]
  interval?: number
  colors?: ColorGenerator
}) {
  const { theme } = useTheme()
  const kv = useKV()
  const color = () => props.color ?? theme.textMuted
  const spinnerFrames = createMemo(() => props.frames ?? frames)
  const [frameIndex, setFrameIndex] = createSignal(0)

  createEffect(() => {
    if (!kv.get("animations_enabled", true)) return

    const list = spinnerFrames()
    if (list.length <= 1) return

    const timer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % list.length)
    }, props.interval ?? 80)

    return () => clearInterval(timer)
  })

  const renderedFrame = createMemo(() => {
    const list = spinnerFrames()
    const frame = list[frameIndex() % list.length] ?? ""

    if (!props.colors) return frame

    const chars = Array.from(frame)
    return chars.map((char, charIndex) => (
      <span style={{ fg: props.colors?.(frameIndex(), charIndex, list.length, chars.length) }}>{char}</span>
    ))
  })

  return (
    <Show
      when={kv.get("animations_enabled", true)}
      fallback={<text fg={color()}>{props.children ? <>⋯ {props.children}</> : "⋯"}</text>}
    >
      <box flexDirection="row" gap={1}>
        <Show when={props.colors} fallback={<text fg={color()}>{renderedFrame()}</text>}>
          <text>{renderedFrame()}</text>
        </Show>
        <Show when={props.children}>
          <text fg={color()}>{props.children}</text>
        </Show>
      </box>
    </Show>
  )
}
