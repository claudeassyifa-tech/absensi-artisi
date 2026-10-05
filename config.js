// =====================================================
// GANTI dengan URL Web App dari Google Apps Script
// (Deploy > Manage deployments > salin Web app URL)
// =====================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSUBp5aSiRDBCWay_EClxUAg-CtAMqc7wun2gEgtJpFIfB5jO7j0Ay9rnyZK3gGslv/exec";

async function api(params, body) {
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
  return res.json();
}

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
  document.getElementById("topbar").innerHTML =
    '<a class="brand" href="index.html" aria-label="ARTISI Bakmie dan Kopi, ke halaman absen"><img src="img/logo-putih.png" alt="ARTISI Bakmie &amp; Kopi"></a>' +
    "<nav>" + NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === aktif ? ' class="on" aria-current="page"' : "") + ">" + n[1] + "</a>";
    }).join("") + "</nav>";
}
