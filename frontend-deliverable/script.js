document.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = form.closest(".auth-card")?.querySelector(".auth-card__title")?.textContent ?? "送信";
    window.alert(`${title}画面のモックです。提出用フロントエンドとして表示しています。`);
  });
});
