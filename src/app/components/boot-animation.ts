/** systemd console status field is exactly 8 columns. */
export const JOB_SPINNER_FRAMES = [
  "[  *   ]",
  "[ **   ]",
  "[ ***  ]",
  "[  **  ]",
  "[   *  ]",
  "[  *   ]",
  "[ **   ]",
  "[  *** ]",
] as const;

export const JOB_SPINNER_MS = 120;

export const OK_TAG = "[  OK  ]";

export const JOB_DONE_TAG = OK_TAG;

export function getJobSpinnerTag(frame: number): string {
  return JOB_SPINNER_FRAMES[frame % JOB_SPINNER_FRAMES.length];
}

export function getOkTag(): string {
  return OK_TAG;
}
