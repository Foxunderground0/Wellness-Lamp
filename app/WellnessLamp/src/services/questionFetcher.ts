/**
 * Question fetch orchestration.
 *
 * Request budget rules (to minimise API calls):
 *  - ONE prefetch fires when the user first opens the app (or Feel tab).
 *    That single call fetches ONE variant (~20 questions).  That's it until
 *    the user actually starts answering.
 *  - While answering, top-ups fire only when the unshown pool drops below
 *    LOW_WATER (8 questions ahead).  Each top-up = ONE variant call.
 *  - A top-up after every 20 answers to rotate question variety.
 *  - Global lock: only one request ever in-flight at a time — no floods.
 *  - Retry: up to 3 attempts with 1 s / 2 s / 4 s backoff before giving up.
 */

import {generateQuestionsVariant} from './openRouter';
import {addToPool, poolSize} from './questionBank';

type Listener = (added: number) => void;

let _active = false;
let _prefetchDone = false; // fire the initial fetch only once per session
let _nextVariant = 0;
let _listeners: Listener[] = [];

export function onPoolUpdate(cb: Listener): () => void {
  _listeners.push(cb);
  return () => { _listeners = _listeners.filter(l => l !== cb); };
}

export function isFetchActive(): boolean { return _active; }

// ─── core fetch with retry ────────────────────────────────────────────────────

async function fetchVariant(variantIdx: number): Promise<void> {
  if (_active) { return; }
  _active = true;
  _listeners.forEach(l => l(0)); // notify: fetch started

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const questions = await generateQuestionsVariant(variantIdx);
      if (questions.length > 0) {
        const added = addToPool(questions);
        _active = false;
        if (added > 0) { _listeners.forEach(l => l(added)); }
        else { _listeners.forEach(l => l(0)); }
        return;
      }
    } catch {}
    if (attempt < 2) {
      await new Promise<void>(r => setTimeout(() => r(), 1000 * Math.pow(2, attempt)));
    }
  }

  // All attempts failed — unlock silently
  _active = false;
  _listeners.forEach(l => l(0));
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Fire a single prefetch on app start.  Skips if already done or in flight.
 * Cost: 1 API call.
 */
export function prefetchBatch(): void {
  if (_prefetchDone || _active) { return; }
  _prefetchDone = true;
  fetchVariant(_nextVariant);
  _nextVariant = (_nextVariant + 1) % 4;
}

/**
 * Top up the pool with one variant when the user is running low.
 * No-ops if a fetch is already in flight.
 * Cost: 1 API call.
 */
export function topUpPool(): void {
  if (_active) { return; }
  fetchVariant(_nextVariant);
  _nextVariant = (_nextVariant + 1) % 4;
}

/** Exposed so FeelScreen can reset the done-flag when a new session starts. */
export function resetPrefetchFlag(): void {
  _prefetchDone = false;
}

export { poolSize };
