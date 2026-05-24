function getCurrentDay(firstVisitDate) {
  const now = new Date();

  const first = new Date(firstVisitDate);

  const diffTime = now - first;

  const diffDays =
    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

async function loadDoa() {
  let firstVisit = localStorage.getItem("qunut_first_visit");

  // pertama kali buka situs
  if (!firstVisit) {
    firstVisit = new Date().toISOString();

    localStorage.setItem(
      "qunut_first_visit",
      firstVisit
    );
  }

  const day = getCurrentDay(firstVisit);

  const response = await fetch(
    `/api/qunut?day=${day}`
  );

  const json = await response.json();

  document.getElementById("app").innerHTML = `
<pre>${JSON.stringify(json, null, 2)}</pre>
`;
}

loadDoa();
