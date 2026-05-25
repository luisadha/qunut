const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    // =========================
    // LOAD DATA
    // =========================
    const filePath = path.join(
      __dirname,
      '..',
      'qunut.json'
    );

    const data = JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );

    // =========================
    // GLOBAL DAY SYSTEM
    // =========================
    const startDate = new Date('2026-05-25');

    const now = new Date();

    const diffTime = now - startDate;

    const currentDay =
      Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
      ) + 1;

    // =========================
    // PARSE COOKIE
    // =========================
    const cookies = Object.fromEntries(
      (req.headers.cookie || '')
        .split(';')
        .filter(Boolean)
        .map(cookie => {
          const parts = cookie.trim().split('=');

          return [
            parts[0],
            decodeURIComponent(parts[1] || '')
          ];
        })
    );

    // terakhir user lihat hari berapa
    const lastSeenDay = parseInt(
      cookies.last_seen_day || '0'
    );

    // =========================
    // OPTIONAL QUERY
    // =========================
    const requestedDay = parseInt(
      req.query.day || currentDay
    );

    // =========================
    // VALIDASI
    // =========================

    // gak boleh lompat masa depan
    if (requestedDay > currentDay) {
      return res.status(200).json({
        success: false,
        message: 'Kembali lagi besok'
      });
    }

    // optional:
    // cegah mundur terlalu jauh
    // kalau gak mau fitur ini tinggal hapus

    /*
    if (
      lastSeenDay > 0 &&
      requestedDay < lastSeenDay
    ) {
      return res.status(200).json({
        success: false,
        message:
          'Tidak bisa membuka hari sebelumnya'
      });
    }
    */

    // =========================
    // LOOPING INDEX
    // =========================
    const index =
      (requestedDay - 1) % data.length;

    // =========================
    // SAVE COOKIE
    // =========================
    res.setHeader(
      'Set-Cookie',
      [
        `last_seen_day=${requestedDay}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
      ]
    );

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      success: true,

      hari_ke: requestedDay,

      hari_global: currentDay,

      terakhir_dibuka: lastSeenDay,

      doa: data[index]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan'
    });

  }
};
