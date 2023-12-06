window.customElements.define(
  "revalidate-frame",
  class extends HTMLElement {
    connectedCallback() {
      let form = this.closest("form");
      form.addEventListener("submit", e => {
        window.parent.window.registerRevalidation(
          window.frameElement.getAttribute("name"),
          this.getAttribute("target"),
        );
      });
    }
  },
);

window.registerRevalidation = (originName, targetName) => {
  let targetFrame = document.querySelector(`iframe[name=${targetName}]`);
  let originFrame = document.querySelector(`iframe[name=${originName}]`);
  originFrame.addEventListener("load", handleLoad);
  function handleLoad() {
    console.log("load");
    targetFrame.contentWindow.location.reload();
    originFrame.removeEventListener("load", handleLoad);
  }
};
