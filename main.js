/* =========================================================
   Royal Hôtel — Scripts de l'interface (front-end)
   ========================================================= */

/* ---------- Utilitaires ---------- */
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];

const nombreFR = new Intl.NumberFormat("fr-FR");
const formatFCFA = (valeur) => `${nombreFR.format(Math.round(valeur))} FCFA`;

const dateFR = (valeur) => {
  const date = new Date(valeur);
  const texte = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  /* En français, le premier jour du mois s'écrit « 1er ». */
  return date.getDate() === 1 ? texte.replace(/^1\s/, "1er ") : texte;
};

/* ---------- Notification ---------- */
let minuteurToast = null;

function afficherToast(message, icone = "ri-checkbox-circle-line") {
  let toast = qs("#toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="${icone}"></i><span>${message}</span>`;
  toast.classList.add("show");

  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.remove("show"), 3400);
}

/* =========================================================
   1. NAVIGATION FIXE
   ========================================================= */
const nav = qs("#nav");
const menuBtn = qs("#menu-btn");
const navLinks = qs("#nav-links");

if (menuBtn && navLinks) {
  const menuBtnIcon = menuBtn.querySelector("i");

  const fermerMenu = () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-3-line");
  };

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const ouvert = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute(
      "class",
      ouvert ? "ri-close-line" : "ri-menu-3-line"
    );
  });

  navLinks.addEventListener("click", fermerMenu);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 786) fermerMenu();
  });
}

const boutonHaut = qs("#scroll-top");

function auDefilement() {
  const y = window.scrollY;
  if (nav) nav.classList.toggle("scrolled", y > 60);
  if (boutonHaut) boutonHaut.classList.toggle("show", y > 600);
}

window.addEventListener("scroll", auDefilement);
auDefilement();

/* Lien actif */
(() => {
  if (!navLinks) return;
  const page = window.location.pathname.split("/").pop() || "index.html";

  qsa("a", navLinks).forEach((lien) => {
    const cible = lien.getAttribute("href");
    if (cible === page) lien.classList.add("active");
  });
})();

/* =========================================================
   2. DATES : valeurs par défaut et cohérence
   ========================================================= */
const auFormatInput = (date) => date.toISOString().split("T")[0];

(() => {
  const aujourdhui = new Date();
  const demain = new Date(aujourdhui);
  demain.setDate(demain.getDate() + 1);
  const surlendemain = new Date(aujourdhui);
  surlendemain.setDate(surlendemain.getDate() + 3);

  qsa('input[type="date"][data-arrivee]').forEach((champ) => {
    champ.min = auFormatInput(aujourdhui);
    if (!champ.value) champ.value = auFormatInput(demain);
  });

  qsa('input[type="date"][data-depart]').forEach((champ) => {
    champ.min = auFormatInput(demain);
    if (!champ.value) champ.value = auFormatInput(surlendemain);
  });

  /* Le départ reste toujours postérieur à l'arrivée */
  qsa("form").forEach((form) => {
    const arrivee = qs("[data-arrivee]", form);
    const depart = qs("[data-depart]", form);
    if (!arrivee || !depart) return;

    arrivee.addEventListener("change", () => {
      const suivant = new Date(arrivee.value);
      suivant.setDate(suivant.getDate() + 1);
      depart.min = auFormatInput(suivant);
      if (new Date(depart.value) <= new Date(arrivee.value)) {
        depart.value = auFormatInput(suivant);
      }
      depart.dispatchEvent(new Event("change"));
    });
  });
})();

/* =========================================================
   3. RECHERCHE DE DISPONIBILITÉ (héros et fiches)
   ========================================================= */
const CLE_RESERVATION = "royal_reservation";

const lireReservation = () => {
  try {
    return JSON.parse(localStorage.getItem(CLE_RESERVATION)) || {};
  } catch (erreur) {
    return {};
  }
};

const ecrireReservation = (donnees) =>
  localStorage.setItem(
    CLE_RESERVATION,
    JSON.stringify({ ...lireReservation(), ...donnees })
  );

qsa("form[data-recherche]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    ecrireReservation({
      destination: qs("[data-destination]", form)?.value || "",
      arrivee: qs("[data-arrivee]", form)?.value || "",
      depart: qs("[data-depart]", form)?.value || "",
      voyageurs: qs("[data-voyageurs]", form)?.value || "2",
    });

    window.location.href = "hotels.html";
  });
});

/* Boutons « Réserver » : mémorisent l'établissement ou la chambre */
document.addEventListener("click", (e) => {
  const bouton = e.target.closest("[data-reserver]");
  if (!bouton) return;

  ecrireReservation({
    hotel: bouton.dataset.hotel || lireReservation().hotel || "",
    chambre: bouton.dataset.chambre || "",
    prix: bouton.dataset.prix ? Number(bouton.dataset.prix) : undefined,
  });
});

/* =========================================================
   4. FILTRES (hôtels et chambres)
   ========================================================= */
function initialiserFiltres(config) {
  const grille = qs(config.grille);
  if (!grille) return;

  const cartes = qsa(config.carte, grille);
  cartes.forEach((carte, i) => (carte.dataset.index = i));

  const compteur = qs(config.compteur);
  const vide = qs(config.vide);
  const tri = qs(config.tri);
  const champs = config.champs.map((c) => ({ ...c, element: qs(c.selecteur) }));

  function appliquer() {
    let visibles = 0;

    cartes.forEach((carte) => {
      const visible = champs.every(({ element, attribut, comparateur }) => {
        if (!element || !element.value) return true;
        const valeurCarte = carte.dataset[attribut];
        return comparateur(valeurCarte, element.value);
      });

      carte.style.display = visible ? "" : "none";
      if (visible) visibles += 1;
    });

    if (compteur) compteur.textContent = visibles;
    if (vide) vide.style.display = visibles ? "none" : "block";
  }

  function trier() {
    const valeur = tri ? tri.value : "";

    [...cartes]
      .sort((a, b) => {
        switch (valeur) {
          case "prix-asc":
            return Number(a.dataset.prix) - Number(b.dataset.prix);
          case "prix-desc":
            return Number(b.dataset.prix) - Number(a.dataset.prix);
          case "nom":
            return a.dataset.nom.localeCompare(b.dataset.nom, "fr");
          case "note":
            return Number(b.dataset.note || 0) - Number(a.dataset.note || 0);
          default:
            return Number(a.dataset.index) - Number(b.dataset.index);
        }
      })
      .forEach((carte) => grille.appendChild(carte));
  }

  champs.forEach(({ element }) => {
    element && element.addEventListener("change", appliquer);
  });

  tri && tri.addEventListener("change", trier);

  const reinit = qs(config.reinit);
  reinit &&
    reinit.addEventListener("click", () => {
      champs.forEach(({ element }) => element && (element.value = ""));
      if (tri) tri.value = "";
      trier();
      appliquer();
      afficherToast("Filtres réinitialisés.", "ri-refresh-line");
    });

  /* Pré-remplissage depuis la recherche du héros */
  const memorise = lireReservation();
  const champVille = champs.find((c) => c.attribut === "ville");
  if (champVille?.element && memorise.destination) {
    const options = [...champVille.element.options].map((o) => o.value);
    if (options.includes(memorise.destination)) {
      champVille.element.value = memorise.destination;
    }
  }

  appliquer();
}

/* Égalité stricte / valeur numérique inférieure ou égale */
const egal = (valeurCarte, valeurFiltre) => valeurCarte === valeurFiltre;
const inferieurOuEgal = (valeurCarte, valeurFiltre) =>
  Number(valeurCarte) <= Number(valeurFiltre);
const superieurOuEgal = (valeurCarte, valeurFiltre) =>
  Number(valeurCarte) >= Number(valeurFiltre);

initialiserFiltres({
  grille: "#hotels-grid",
  carte: ".hotel__card",
  compteur: "#hotels-count",
  vide: "#hotels-empty",
  tri: "#hotels-sort",
  reinit: "#hotels-reset",
  champs: [
    { selecteur: "#filtre-ville", attribut: "ville", comparateur: egal },
    { selecteur: "#filtre-prix", attribut: "prix", comparateur: inferieurOuEgal },
    {
      selecteur: "#filtre-etoiles",
      attribut: "etoiles",
      comparateur: superieurOuEgal,
    },
  ],
});

initialiserFiltres({
  grille: "#rooms-grid",
  carte: ".room__card",
  compteur: "#rooms-count",
  vide: "#rooms-empty",
  tri: "#rooms-sort",
  reinit: "#rooms-reset",
  champs: [
    { selecteur: "#filtre-type", attribut: "type", comparateur: egal },
    { selecteur: "#filtre-prix", attribut: "prix", comparateur: inferieurOuEgal },
    {
      selecteur: "#filtre-capacite",
      attribut: "capacite",
      comparateur: superieurOuEgal,
    },
  ],
});

/* =========================================================
   5. ACCORDÉON FAQ
   ========================================================= */
qsa(".faq__item").forEach((item) => {
  const question = qs(".faq__question", item);
  const reponse = qs(".faq__answer", item);

  question.addEventListener("click", () => {
    const dejaOuvert = item.classList.contains("open");

    qsa(".faq__item").forEach((autre) => {
      autre.classList.remove("open");
      qs(".faq__answer", autre).style.maxHeight = null;
    });

    if (!dejaOuvert) {
      item.classList.add("open");
      reponse.style.maxHeight = `${reponse.scrollHeight}px`;
    }
  });
});

/* =========================================================
   6. GALERIE DE LA FICHE ÉTABLISSEMENT
   ========================================================= */
(() => {
  const principale = qs("#detail-main");
  if (!principale) return;

  qsa("#detail-thumbs img").forEach((vignette) =>
    vignette.addEventListener("click", () => {
      qsa("#detail-thumbs img").forEach((v) => v.classList.remove("active"));
      vignette.classList.add("active");
      principale.src = vignette.dataset.grande || vignette.src;
    })
  );
})();

/* =========================================================
   7. CALCUL DU SÉJOUR (fiche et page réservation)
   ========================================================= */
function initialiserDevis(racine) {
  const bloc = qs(racine);
  if (!bloc) return;

  const TAXE_SEJOUR = 1500; // FCFA par nuit et par voyageur
  const SERVICE = 0.05; // 5 % de frais de service

  const arrivee = qs("[data-arrivee]", bloc);
  const depart = qs("[data-depart]", bloc);
  const voyageurs = qs("[data-voyageurs]", bloc);
  const chambres = qs("[data-chambres]", bloc);
  const choixChambre = qs("[data-choix-chambre]", bloc);

  const sortieNuits = qs("[data-sortie-nuits]", bloc);
  const sortieSousTotal = qs("[data-sortie-soustotal]", bloc);
  const sortieTaxe = qs("[data-sortie-taxe]", bloc);
  const sortieService = qs("[data-sortie-service]", bloc);
  const sortieTotal = qs("[data-sortie-total]", bloc);
  const sortieDates = qs("[data-sortie-dates]", bloc);
  const sortieChambre = qs("[data-sortie-chambre]", bloc);

  function prixNuit() {
    if (choixChambre?.selectedOptions?.length) {
      return Number(choixChambre.selectedOptions[0].dataset.prix || 0);
    }
    return Number(bloc.dataset.prix || 0);
  }

  function calculer() {
    const d1 = new Date(arrivee.value);
    const d2 = new Date(depart.value);
    const nuits = Math.max(
      1,
      Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) || 1
    );

    const nbVoyageurs = Number(voyageurs?.value || 2);
    const nbChambres = Number(chambres?.value || 1);
    const prix = prixNuit();

    const sousTotal = prix * nuits * nbChambres;
    const taxe = TAXE_SEJOUR * nuits * nbVoyageurs;
    const service = sousTotal * SERVICE;
    const total = sousTotal + taxe + service;

    if (sortieNuits)
      sortieNuits.textContent = `${nuits} nuit${nuits > 1 ? "s" : ""} × ${
        nbChambres > 1 ? nbChambres + " chambres" : "1 chambre"
      }`;
    if (sortieSousTotal) sortieSousTotal.textContent = formatFCFA(sousTotal);
    if (sortieTaxe) sortieTaxe.textContent = formatFCFA(taxe);
    if (sortieService) sortieService.textContent = formatFCFA(service);
    if (sortieTotal) sortieTotal.textContent = formatFCFA(total);
    if (sortieDates && arrivee.value && depart.value)
      sortieDates.textContent = `Du ${dateFR(arrivee.value)} au ${dateFR(
        depart.value
      )}`;
    if (sortieChambre && choixChambre?.selectedOptions?.length)
      sortieChambre.textContent =
        choixChambre.selectedOptions[0].dataset.nom ||
        choixChambre.selectedOptions[0].textContent;

    ecrireReservation({
      arrivee: arrivee.value,
      depart: depart.value,
      voyageurs: nbVoyageurs,
      chambres: nbChambres,
      total,
    });
  }

  [arrivee, depart, voyageurs, chambres, choixChambre].forEach((champ) => {
    champ && champ.addEventListener("change", calculer);
  });

  /* Reprise des choix mémorisés */
  const memorise = lireReservation();
  if (memorise.arrivee && arrivee) arrivee.value = memorise.arrivee;
  if (memorise.depart && depart) depart.value = memorise.depart;
  if (memorise.voyageurs && voyageurs) voyageurs.value = memorise.voyageurs;
  if (memorise.chambres && chambres) chambres.value = memorise.chambres;
  if (memorise.chambre && choixChambre) {
    const option = [...choixChambre.options].find(
      (o) => o.dataset.nom === memorise.chambre
    );
    if (option) choixChambre.value = option.value;
  }

  calculer();
}

initialiserDevis("#devis-hotel");
initialiserDevis("#devis-reservation");

/* Établissement choisi sur la page réservation */
(() => {
  const cible = qs("#reservation-hotel");
  const selection = qs("#r-hotel");
  if (!cible) return;

  const memorise = lireReservation();

  /* Pré-sélection depuis la fiche d'où vient le visiteur */
  if (selection && memorise.hotel) {
    const option = [...selection.options].find((o) =>
      o.textContent.trim().startsWith(memorise.hotel)
    );
    if (option) selection.value = option.value || option.textContent.trim();
  }

  const rafraichir = () => {
    const valeur = selection?.value || memorise.hotel || "";
    cible.textContent = valeur || "Séjour Royal Hôtel Côte d'Ivoire";
    if (valeur) ecrireReservation({ hotel: valeur.split(" — ")[0] });
  };

  selection && selection.addEventListener("change", rafraichir);
  rafraichir();
})();

/* =========================================================
   8. FORMULAIRES
   ========================================================= */
qsa("form[data-validate]").forEach((form) => {
  const succes = qs(".form__success", form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valide = true;

    qsa(".form__group", form).forEach((groupe) => {
      const champ = qs("input, textarea, select", groupe);
      if (!champ || !champ.required) return;

      let ok = champ.value.trim() !== "";

      if (ok && champ.type === "email") {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(champ.value.trim());
      }

      if (ok && champ.type === "tel") {
        ok = champ.value.replace(/[^\d]/g, "").length >= 8;
      }

      groupe.classList.toggle("error", !ok);
      if (!ok) valide = false;
    });

    if (!valide) {
      afficherToast(
        "Merci de vérifier les champs signalés en rouge.",
        "ri-error-warning-line"
      );
      return;
    }

    if (succes) {
      succes.classList.add("show");
      succes.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => succes.classList.remove("show"), 8000);
    }

    afficherToast(
      form.dataset.validate === "reservation"
        ? "Demande de réservation enregistrée. Nous vous confirmons sous 2 heures."
        : "Votre message a bien été envoyé. Merci !"
    );

    if (form.dataset.validate !== "reservation") form.reset();
  });
});

/* Newsletter */
qsa("form[data-newsletter]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const champ = qs("input", form);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(champ.value.trim())) {
      afficherToast(
        "Veuillez saisir une adresse e-mail valide.",
        "ri-error-warning-line"
      );
      return;
    }

    champ.value = "";
    afficherToast("Merci ! Vous êtes inscrit à notre lettre d'information.");
  });
});

/* =========================================================
   9. COMPTEURS ANIMÉS
   ========================================================= */
(() => {
  const compteurs = qsa("[data-count]");
  if (!compteurs.length) return;

  if (!("IntersectionObserver" in window)) {
    compteurs.forEach((el) => (el.textContent = el.dataset.count));
    return;
  }

  const animer = (element) => {
    const cible = Number(element.dataset.count);
    const suffixe = element.dataset.suffix || "";
    const duree = 1600;
    const debut = performance.now();

    const etape = (maintenant) => {
      const progression = Math.min((maintenant - debut) / duree, 1);
      element.textContent =
        nombreFR.format(Math.floor(progression * cible)) + suffixe;
      if (progression < 1) requestAnimationFrame(etape);
    };

    requestAnimationFrame(etape);
  };

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (entree.isIntersecting) {
          animer(entree.target);
          observateur.unobserve(entree.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  compteurs.forEach((el) => observateur.observe(el));
})();

/* =========================================================
   10. CARROUSEL D'INSPIRATION (duplication des cartes)
   ========================================================= */
(() => {
  const piste = qs(".inspiration__wrapper");
  if (!piste) return;

  [...piste.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    piste.appendChild(clone);
  });
})();

/* =========================================================
   11. ANIMATIONS D'APPARITION
   ========================================================= */
if (typeof ScrollReveal !== "undefined") {
  const options = { distance: "50px", origin: "bottom", duration: 1000 };

  ScrollReveal().reveal(".header__content .section__tag", { ...options });
  ScrollReveal().reveal(".header__content h1", { ...options, delay: 200 });
  ScrollReveal().reveal(".header__content .section__description", {
    ...options,
    delay: 400,
  });
  ScrollReveal().reveal(".header__btns", { ...options, delay: 600 });
  ScrollReveal().reveal(".booking", { ...options, delay: 800 });
  ScrollReveal().reveal(".header__stat", {
    ...options,
    delay: 1000,
    interval: 100,
  });
  ScrollReveal().reveal(".page__banner__container h1", { ...options });
  ScrollReveal().reveal(".page__banner__container .breadcrumb", {
    ...options,
    delay: 300,
  });

  /* Les grilles filtrables gèrent elles-mêmes l'affichage */
  ScrollReveal().reveal(
    ".hotel__grid:not(#hotels-grid) .hotel__card, .rooms__grid:not(#rooms-grid) .room__card",
    { ...options, interval: 150 }
  );
  ScrollReveal().reveal(".steps__card", { ...options, interval: 200 });
  ScrollReveal().reveal(".property__card", { ...options, interval: 150 });
  ScrollReveal().reveal(".trip__card", { ...options, interval: 150 });
  ScrollReveal().reveal(".amenity__card", { ...options, interval: 120 });
  ScrollReveal().reveal(".review__card", { ...options, interval: 150 });
  ScrollReveal().reveal(".stats__card", { ...options, interval: 120 });
  ScrollReveal().reveal(".gallery__item", { ...options, interval: 80 });
  ScrollReveal().reveal(".team__card", { ...options, interval: 120 });
  ScrollReveal().reveal(".timeline__item, .faq__item", {
    ...options,
    interval: 100,
  });
  ScrollReveal().reveal(".service__row", { ...options });
}
