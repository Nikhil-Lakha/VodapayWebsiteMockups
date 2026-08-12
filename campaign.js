(function () {
  "use strict";
  var PAGE_NAME = "vodacom: business: voucher advance: content landing page";
  var APPLE_STORE_URL = "https://apps.apple.com/za/app/vodapay/id1544702651";
  var GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=za.co.vodacom.vodapay&hl=en_ZA";

  function isAppleDevice() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function sendView() {
    if (window.utag && typeof window.utag.view === "function") {
      window.utag.view({ page_name: PAGE_NAME });
    }
  }

  function download(event) {
    event.preventDefault();
    if (window.utag && typeof window.utag.link === "function") {
      window.utag.link({ page_name: PAGE_NAME, link_id: "download vodapay app" });
    }
    window.location.assign(isAppleDevice() ? APPLE_STORE_URL : GOOGLE_PLAY_URL);
  }

  document.querySelectorAll(".download-vodapay").forEach(function (cta) {
    cta.addEventListener("click", download);
  });
  sendView();
})();
