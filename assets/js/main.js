async function includeHTML(id, file, appendToHead = false) {
  try {
    const base = `/${location.pathname.split('/')[1]}`;
    const el = document.getElementById(id);

    const response = await fetch(`${base}/partials/${file}`);

    if (!response.ok) {
      throw new Error(`Gagal memuat ${file}: ${response.status}`);
    }

    let html = await response.text();

    html = html.replace(/\r?\n|\r/g, "");
    html = html.replace(/\s{2,}/g, " ");

    if (appendToHead) {
      const template = document.createElement("template");

      template.innerHTML = html.trim();

      Array.from(template.content.children).forEach(node => {
        document.head.appendChild(node.cloneNode(true));
      });

    } else if (el) {
      el.insertAdjacentHTML("beforeend", html.trim());
    }

  } catch (err) {
    console.error(err);
  }
}

async function init() {

  await includeHTML("header", "header.html", true);

  await includeHTML("navigation", "navigation.html");

  await includeHTML("footer", "footer.html");

  initNavigation();
}

function initNavigation() {

  const menuToggle = document.getElementById("menuToggle");

  const navMenu = document.getElementById("navMenu");

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

init();
