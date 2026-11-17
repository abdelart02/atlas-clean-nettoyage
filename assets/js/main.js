(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  document.documentElement.classList.remove("no-js");

  /* ---- Remplissage des infos depuis config.js ---- */
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  var waBase = C.whatsapp ? "https://wa.me/" + C.whatsapp : "";

  each("[data-cfg]", function (el) {
    var v = C[el.getAttribute("data-cfg")];
    if (v) el.textContent = v;
  });
  each("[data-tel]", function (el) { if (C.phoneLink) el.href = "tel:" + C.phoneLink; });
  each("[data-mail]", function (el) { if (C.email) el.href = "mailto:" + C.email; });
  each("[data-social]", function (el) {
    var v = C.social && C.social[el.getAttribute("data-social")];
    if (v && v !== "#") { el.href = v; el.target = "_blank"; el.rel = "noopener"; }
  });
  each("[data-wa]", function (el) {
    var msg = el.getAttribute("data-wa") || ("Bonjour " + (C.name || "") + ", je souhaite un devis de nettoyage.");
    if (waBase) {
      el.href = waBase + "?text=" + encodeURIComponent(msg);
      el.target = "_blank"; el.rel = "noopener";
    } else {
      // Pas encore de numéro WhatsApp : on renvoie vers le formulaire de contact.
      el.href = el.getAttribute("data-fallback") || el.href;
    }
  });
  each("[data-map]", function (el) { if (C.mapEmbed) el.src = C.mapEmbed; });
  each("[data-year]", function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Lien actif du menu ---- */
  var page = document.body.getAttribute("data-page");
  each(".nav a[data-nav]", function (a) { if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page"); });

  /* ---- En-tête : ombre au défilement ---- */
  var header = document.querySelector(".header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- Menu mobile ---- */
  var burger = document.querySelector(".burger"), nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { burger.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }
    });
  }

  /* ---- Apparition au défilement ---- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Curseur avant / après ---- */
  each(".ba", function (ba) {
    var range = ba.querySelector("input[type=range]"), before = ba.querySelector(".ba__before"), handle = ba.querySelector(".ba__handle");
    if (!range) return;
    function set() {
      var v = range.value;
      before.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
      handle.style.left = v + "%";
    }
    range.addEventListener("input", set); set();
  });

  /* ---- Formulaire de devis ---- */
  var form = document.getElementById("devis-form");
  if (form) {
    var params = new URLSearchParams(location.search);
    var pre = params.get("service");
    if (pre && form.service) {
      Array.prototype.forEach.call(form.service.options, function (o) { if (o.value === pre) form.service.value = pre; });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["nom", "tel", "service", "ville"].forEach(function (name) {
        var f = form.elements[name], wrap = f.closest(".field");
        var bad = !f.value.trim() || (name === "tel" && f.value.replace(/\D/g, "").length < 9);
        wrap.classList.toggle("invalid", bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;

      var d = function (n) { return (form.elements[n] && form.elements[n].value.trim()) || "—"; };
      var text =
        "Bonjour " + (C.name || "") + ",\nJe souhaite recevoir un devis.\n\n" +
        "• Nom : " + d("nom") + "\n• Téléphone : " + d("tel") + "\n• Service : " + d("service") +
        "\n• Ville / quartier : " + d("ville") + "\n• Surface : " + d("surface") +
        "\n• Date souhaitée : " + d("date") + "\n\nMessage : " + d("message");

      var okBox = document.getElementById("form-ok");
      if (waBase) {
        window.open(waBase + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        okBox.textContent = "Merci ! WhatsApp s'est ouvert avec votre demande pré-remplie : il ne reste qu'à appuyer sur « Envoyer ».";
      } else {
        location.href = "mailto:" + (C.email || "") + "?subject=" + encodeURIComponent("Demande de devis — " + d("service")) + "&body=" + encodeURIComponent(text);
        okBox.textContent = "Merci ! Votre messagerie s'est ouverte avec la demande pré-remplie. Vous pouvez aussi nous appeler au " + (C.phoneDisplay || "") + ".";
      }
      okBox.classList.add("show");
    });
    form.addEventListener("input", function (e) {
      var w = e.target.closest(".field"); if (w) w.classList.remove("invalid");
    });
  }
})();
