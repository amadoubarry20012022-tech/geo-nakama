/* ==========================================================
   progress.js : sauvegarde de la progression de l'apprenant
   Les données sont gardées dans le navigateur (localStorage).
   Forme des données : { "id-du-module": { score, total, valide } }
   ========================================================== */

const Progression = (function () {
  const CLE = "geo-nakama-progression";

  // Lire tout ce qui est sauvegardé (ou un objet vide s'il n'y a rien)
  function lire() {
    try {
      return JSON.parse(localStorage.getItem(CLE)) || {};
    } catch (erreur) {
      return {};
    }
  }

  // Écrire les données (si le navigateur refuse, on ignore sans planter)
  function ecrire(donnees) {
    try {
      localStorage.setItem(CLE, JSON.stringify(donnees));
    } catch (erreur) {
      /* rien à faire */
    }
  }

  return {
    // Enregistre le résultat d'un quiz. Un module validé le reste pour toujours.
    enregistrerScore: function (idModule, score, total, seuil) {
      const donnees = lire();
      const ancien = donnees[idModule] || {};
      donnees[idModule] = {
        score: Math.max(score, ancien.score || 0),
        total: total,
        valide: Boolean(ancien.valide) || score >= seuil
      };
      ecrire(donnees);
      return donnees[idModule];
    },

    // Renvoie { score, total, valide } ou null si le quiz n'a jamais été fait
    etat: function (idModule) {
      return lire()[idModule] || null;
    },

    estValide: function (idModule) {
      const e = lire()[idModule];
      return Boolean(e && e.valide);
    }
  };
})();
