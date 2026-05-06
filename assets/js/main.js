async function includeHTML(id, file, appendToHead = false) {
  try {
    const base = `/${location.pathname.split('/')[1]}`;
    const el = document.getElementById(id);
    const response = await fetch(`${base}/section/${file}`);
    if (!response.ok) throw new Error(`Gagal memuat ${file}: ${response.status}`);

    let html = await response.text();
    html = html.replace(/\r?\n|\r/g, ""); // hapus newline
    html = html.replace(/\s{2,}/g, " ");  // rapikan spasi berlebih

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

includeHTML("brain", "brain.html", true);
includeHTML("header", "header.html");
includeHTML("postscript", "postscript.html");
includeHTML("footer", "footer.html");
