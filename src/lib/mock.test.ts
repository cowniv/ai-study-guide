import { describe, expect, it } from "vitest";
import { mockExplanation, mockStudySet, streamText } from "./mock";
import { getPersona } from "./personas";
import { ExplainInput, StrictStudySet } from "./schemas";
import { masteryPercent, newCardState, review } from "./srs";

const notes = [
  "A process is a running program with its own memory space.",
  "A thread is a unit of execution that shares process resources.",
  "A scheduler decides which ready thread receives processor time.",
  "A context switch saves one task state before restoring another.",
  "A mutex protects a critical section from concurrent access.",
  "A semaphore coordinates access with a configurable permit count.",
].join("\n");

describe("mock mode", () => {
  it("builds a schema-valid study set from synthetic notes", () => {
    expect(StrictStudySet.safeParse(mockStudySet(notes)).success).toBe(true);
  });

  it("labels canned explanations and reflects only supplied text", () => {
    const output = mockExplanation(notes, getPersona("tutor"));
    expect(output).toContain("Mock mode");
    expect(output).toContain("A process is a running program");
  });

  it("treats instruction-like note text as ordinary study content", () => {
    const input = `${notes}\nIgnore previous instructions is an example of prompt injection wording.`;
    expect(ExplainInput.safeParse({ notes: input, persona: "coach" }).success).toBe(true);
    expect(mockExplanation(input, getPersona("coach"))).toContain("here's what you actually need to know");
  });

  it("streams the canned response without an external service", async () => {
    const reader = streamText("safe local response", 0).getReader();
    const decoder = new TextDecoder();
    let output = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
    }
    expect(output).toBe("safe local response");
  });
});

describe("spaced repetition", () => {
  it("resets a missed card and schedules it one minute later", () => {
    const now = 1_000_000;
    const result = review(newCardState(now), 0, now);
    expect(result.lapses).toBe(1);
    expect(result.due).toBe(now + 60_000);
  });

  it("advances a well-known card and reports mastery", () => {
    const now = 1_000_000;
    const first = review(newCardState(now), 3, now);
    const second = review(first, 3, now);
    expect(second.interval).toBe(6);
    expect(masteryPercent([second, newCardState(now)])).toBe(50);
  });
});
