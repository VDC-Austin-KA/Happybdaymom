// Serves the birthday song with HTTP Range support (needed for seeking and iOS playback).
import SONG from "./song.m4a";
const BYTES = new Uint8Array(SONG), SIZE = BYTES.length;
export default {
  fetch(req) {
    const h = { "content-type": "audio/mp4", "accept-ranges": "bytes", "cache-control": "public, max-age=86400" };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") || "");
    if (!m) return new Response(BYTES, { headers: { ...h, "content-length": SIZE } });
    let start = m[1] === "" ? SIZE - +m[2] : +m[1], end = m[1] === "" || m[2] === "" ? SIZE - 1 : Math.min(+m[2], SIZE - 1);
    if (start > end || start >= SIZE) return new Response(null, { status: 416, headers: { ...h, "content-range": `bytes */${SIZE}` } });
    return new Response(BYTES.slice(start, end + 1), { status: 206, headers: { ...h, "content-range": `bytes ${start}-${end}/${SIZE}`, "content-length": end - start + 1 } });
  }
};
