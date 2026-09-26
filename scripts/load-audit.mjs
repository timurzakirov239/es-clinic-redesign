import { performance } from "node:perf_hooks";

const base = process.env.LOAD_URL || "http://127.0.0.1:4175";
const paths = (process.env.LOAD_PATHS || "/,/legal").split(",");
const levels = (process.env.LOAD_LEVELS || "1,10,30").split(",").map(Number);
const requestsPerLevel = Number(process.env.LOAD_REQUESTS || 120);

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function run(concurrency) {
  let next = 0;
  let failures = 0;
  let bytes = 0;
  const durations = [];
  const started = performance.now();
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < requestsPerLevel) {
      const index = next++;
      const path = paths[index % paths.length];
      const at = performance.now();
      try {
        const response = await fetch(new URL(path, base), {
          signal: AbortSignal.timeout(15000),
        });
        const body = await response.arrayBuffer();
        bytes += body.byteLength;
        if (!response.ok) failures++;
      } catch {
        failures++;
      }
      durations.push(performance.now() - at);
    }
  }));
  durations.sort((a, b) => a - b);
  const elapsed = (performance.now() - started) / 1000;
  return {
    concurrency,
    requests: requestsPerLevel,
    failures,
    requestsPerSecond: Math.round(requestsPerLevel / elapsed),
    p50Ms: Math.round(percentile(durations, 0.5)),
    p95Ms: Math.round(percentile(durations, 0.95)),
    maxMs: Math.round(durations.at(-1)),
    mibReceived: +(bytes / 1048576).toFixed(1),
  };
}

for (const path of paths) {
  const response = await fetch(new URL(path, base));
  await response.arrayBuffer();
}
const results = [];
for (const level of levels) results.push(await run(level));
console.log(JSON.stringify({ base, paths, results }, null, 2));
