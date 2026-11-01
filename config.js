// =====================================================
// GANTI dengan URL Web App dari Google Apps Script
// (Deploy > Manage deployments > salin Web app URL)
// =====================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSUBp5aSiRDBCWay_EClxUAg-CtAMqc7wun2gEgtJpFIfB5jO7j0Ay9rnyZK3gGslv/exec";

const TIMINGS = [];

// ---- Token lokasi: ada di link (?t=...). Disimpan di HP supaya tetap jalan walau link dibuka tanpa ?t= ----
function getToken() {
  let t = new URLSearchParams(location.search).get("t") || "";
  try {
    if (t) localStorage.setItem("artisi_token", t);
    else t = localStorage.getItem("artisi_token") || "";
  } catch (e) {}
  return t;
}
const TOKEN = getToken();

async function api(params, body) {
  if (params) params = Object.assign({ t: TOKEN }, params);
  if (body && body.action === "absen") body = Object.assign({ t: TOKEN }, body);
  const t0 = performance.now(), aksi = body ? body.action : params.action;
  let ok = false;
  try {
    let res;
    if (body) {
      // text/plain supaya browser tidak mengirim preflight (Apps Script tidak mendukung OPTIONS)
      res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body)
      });
    } else {
      res = await fetch(SCRIPT_URL + "?" + new URLSearchParams(params));
    }
    const data = await res.json();
    ok = true;
    return data;
  } finally {
    TIMINGS.push({ aksi: aksi, ms: Math.round(performance.now() - t0), ok: ok });
    tampilDebug();
  }
}

// Alat ukur: buka halaman dengan tambahan ?debug=1 (contoh: index.html?debug=1)
function tampilDebug() {
  if (!/[?&]debug=1/.test(location.search) || !document.body) return;
  let el = document.getElementById("debugBox");
  if (!el) {
    el = document.createElement("div");
    el.id = "debugBox";
    el.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;max-width:420px;background:#111;color:#fff;font:12px/1.6 monospace;padding:8px 12px;border-radius:8px;z-index:99;opacity:.93";
    document.body.appendChild(el);
  }
  const nav = performance.getEntriesByType("navigation")[0];
  const halaman = nav && nav.domContentLoadedEventEnd ? Math.round(nav.domContentLoadedEventEnd) : "?";
  el.innerHTML = "Halaman siap: " + halaman + " ms<br>" +
    TIMINGS.map(function (t) { return "Server " + t.aksi + ": " + t.ms + " ms" + (t.ok ? "" : " (GAGAL)"); }).join("<br>");
}
window.addEventListener("load", tampilDebug);

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function jamPendek(j) { return j ? String(j).slice(0, 5).replace(":", ".") : ""; }

function menitSekarangWIB() {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false
  }).formatToParts(new Date());
  const h = +p.find(function (x) { return x.type === "hour"; }).value % 24;
  const m = +p.find(function (x) { return x.type === "minute"; }).value;
  return h * 60 + m;
}

function ketClass(ket) {
  if (!ket) return "";
  if (ket === "Izin" || ket === "Sakit") return "b-blue";
  if (String(ket).indexOf("Terlambat") === 0) return "b-amber";
  return "b-green";
}

const NAV = [
  ["index.html", "Absen"],
  ["belum-absen.html", "Hari ini"],
  ["riwayat.html", "Riwayat"],
  ["admin.html", "Admin"]
];

function renderTopbar(aktif) {
  const q = TOKEN ? "?t=" + encodeURIComponent(TOKEN) : "";
  // Tanpa token, hanya Admin yang ditampilkan (admin memakai password, bukan link lokasi)
  const menu = NAV.filter(function (n) { return TOKEN || n[0] === "admin.html"; });
  document.getElementById("topbar").innerHTML =
    '<a class="brand" href="' + (TOKEN ? "index.html" + q : "admin.html") + '" aria-label="ARTISI Bakmie dan Kopi"><img src="img/logo-putih.png" alt="ARTISI Bakmie &amp; Kopi"></a>' +
    '<span id="lokChip" class="lokchip" hidden></span>' +
    "<nav>" + menu.map(function (n) {
      const href = n[0] === "admin.html" ? n[0] : n[0] + q;
      return '<a href="' + href + '"' + (n[0] === aktif ? ' class="on" aria-current="page"' : "") + ">" + n[1] + "</a>";
    }).join("") + "</nav>";
}

function setLokasiLabel(nama) {
  const el = document.getElementById("lokChip");
  if (!el || !nama) return;
  el.textContent = nama; el.hidden = false;
}

function pesanTokenTidakValid(el) {
  el.innerHTML = '<div class="empty">Link absen tidak valid atau belum ada. Minta link absen yang benar ke admin.</div>';
}
