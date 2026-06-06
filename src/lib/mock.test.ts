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
