// Copy buttons: <button data-copy-target="id"> copies the text of #id.
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copy-target]");
  if (!button) return;
  const source = document.getElementById(button.getAttribute("data-copy-target"));
  if (!source) return;
  const label = button.querySelector("[data-copy-label]") || button;
  const original = label.textContent;
  const done = (text) => {
    label.textContent = text;
    setTimeout(() => (label.textContent = original), 2000);
  };
  navigator.clipboard
    .writeText(source.textContent.trim())
    .then(() => done("Copied"))
    .catch(() => {
      // Clipboard blocked (permissions, older browser): show the text so it can be copied by hand.
      if (button.hasAttribute("data-reveal-on-fail")) source.hidden = false;
      const range = document.createRange();
      range.selectNodeContents(source);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      done("Press Ctrl/Cmd+C");
    });
});
