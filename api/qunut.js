const data = [
  "Allaahummahdinii fii man hadaiit, wa 'aafinii fii man 'aafaiit, Wa tawallanii fii man tawallaiit, Wa baarik lii fiimaa a'thaiit.",

  "Wa qinii birahmatika syarra maa qadhaiit.",

  "Fa innaka taqdhii wa laa yuqdhaa 'alaiik.",

  "Wa innahuu laa yadzillu man waalaiit.",

  "Wa laa ya'izzu man 'aadaiit.",

  "Tabaarakta rabbannaa wa ta'aalaiit.",

  "Fa lakal-hamdu 'alaa maa qadhaiit astaghfiruka wa atuubu ilaiik.",

  "Wa shallallaahu 'alaa sayyidinaa Muhammadin-nabiyyil-ummiyyi wa 'alaa aalihii wa shahbihii wa sallam."
];

export default function handler(req, res) {
  const day = parseInt(req.query.day || "1");

  // looping 1-8 lalu kembali ke 1
  const index = (day - 1) % data.length;

  res.status(200).json({
    result: `hari ke ${index + 1}`,
    doa: data[index]
  });
}
