(function () {
  "use strict";

  var API_BASE = "https://sicereview.se";
  var STYLE_ID = "sice-review-widget-styles";
  var CONTAINER_ID = "sice-review-widget";

  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  if (!currentScript) {
    return;
  }

  var companyId = currentScript.getAttribute("data-company-id");
  if (!companyId) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderStars(rating) {
    var clamped = Math.max(0, Math.min(5, Math.round(rating)));
    var stars = "";
    for (var i = 0; i < 5; i++) {
      stars += i < clamped ? "\u2605" : "\u2606";
    }
    return stars;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "#" + CONTAINER_ID + "{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;}" +
      "#" + CONTAINER_ID + " .srw-grid{display:flex;flex-wrap:wrap;gap:16px;}" +
      "#" + CONTAINER_ID + " .srw-card{flex:1 1 200px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 3px rgba(15,23,42,0.08),0 1px 2px rgba(15,23,42,0.04);padding:18px;box-sizing:border-box;}" +
      "#" + CONTAINER_ID + " .srw-stars{color:#f59e0b;font-size:16px;letter-spacing:2px;line-height:1;}" +
      "#" + CONTAINER_ID + " .srw-comment{color:#0f172a;font-size:14px;line-height:1.55;margin:10px 0 0 0;}" +
      "#" + CONTAINER_ID + " .srw-date{color:#94a3b8;font-size:12px;margin-top:10px;}" +
      "#" + CONTAINER_ID + " .srw-footer{margin-top:16px;text-align:center;}" +
      "#" + CONTAINER_ID + " .srw-footer a{color:#2563eb;font-size:12px;text-decoration:none;}" +
      "#" + CONTAINER_ID + " .srw-footer a:hover{text-decoration:underline;}";
    document.head.appendChild(style);
  }

  function render(data) {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) {
      return;
    }

    var reviews = (data && data.reviews) || [];
    if (!reviews.length) {
      // No reviews — hide the widget silently.
      container.style.display = "none";
      return;
    }

    injectStyles();

    var cards = reviews
      .map(function (review) {
        return (
          '<div class="srw-card">' +
          '<div class="srw-stars">' + renderStars(review.rating) + "</div>" +
          '<p class="srw-comment">' + escapeHtml(review.comment) + "</p>" +
          (review.date
            ? '<div class="srw-date">' + escapeHtml(review.date) + "</div>"
            : "") +
          "</div>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="srw-grid">' +
      cards +
      "</div>" +
      '<div class="srw-footer">' +
      '<a href="' + API_BASE + '" target="_blank" rel="noopener noreferrer">via SICE Review</a>' +
      "</div>";
  }

  function init() {
    var url = API_BASE + "/api/widget/" + encodeURIComponent(companyId);
    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Request failed");
        }
        return res.json();
      })
      .then(render)
      .catch(function () {
        var container = document.getElementById(CONTAINER_ID);
        if (container) {
          container.style.display = "none";
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
