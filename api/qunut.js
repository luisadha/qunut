const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'qunut.json');

    const data = JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );

    // hari sejak pertama kali buka
    const startDate = new Date('2026-05-25'); // hari pertama

    const now = new Date();

    // hitung selisih hari
    const diffTime = now - startDate;
    const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // query opsional
    const requestedDay = parseInt(req.query.day || day);

    // jika paksa lompat hari
    if (requestedDay > day) {
      return res.status(200).json({
        message: 'Kembali lagi besok'
      });
    }

    // index looping
    const index = (requestedDay - 1) % data.length;

    res.status(200).json({
      hari_ke: requestedDay,
      doa: data[index]
    });

  } catch (error) {
    res.status(500).send('Terjadi kesalahan');
  }
};
