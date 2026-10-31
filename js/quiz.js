/* ==========================================================
   quiz.js : moteur de quiz réutilisable par tous les modules
   Utilisation : creerQuiz(element, { id, seuil, questions: [...] })
   Chaque question : { enonce, choix: [...], bonne: numéro, explication }
   Options : nom (« Module » par défaut), messageReussite, messageEchec,
             lienReussite: { texte, href }
   Nécessite progress.js (chargé avant ce fichier).
   ========================================================== */

function creerQuiz(conteneur, config) {
  const total = config.questions.length;

  function demarrer() {
    let repondues = 0;
    let bonnes = 0;

    conteneur.replaceChildren();

    // Si le module est déjà validé, on le rappelle
    const deja = Progression.etat(config.id);
    if (deja && deja.valide) {
      const info = document.createElement("p");
      info.className = "quiz-info";
      info.textContent = (config.nom || "Module") + " déjà validé (meilleur score : " + deja.score + "/" + deja.total +
                         "). Vous pouvez refaire le quiz pour vous entraîner.";
      conteneur.appendChild(info);
    }

    // Zone où s'affichera le résultat final
    const resultat = document.createElement("div");
    resultat.className = "quiz-resultat";
    resultat.hidden = true;
    resultat.setAttribute("aria-live", "polite");

    // Une question = un bloc avec ses boutons de réponse
    config.questions.forEach(function (question, numero) {
      const bloc = document.createElement("fieldset");
      bloc.className = "quiz-question";

      const legende = document.createElement("legend");
      legende.textContent = (numero + 1) + ". " + question.enonce;
      bloc.appendChild(legende);

      const liste = document.createElement("div");
      liste.className = "quiz-choix";

      const explication = document.createElement("p");
      explication.className = "quiz-explication";
      explication.hidden = true;
      explication.setAttribute("aria-live", "polite");

      const boutons = [];

      question.choix.forEach(function (texte, index) {
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "choix";
        bouton.textContent = texte;
        bouton.addEventListener("click", function () { repondre(index); });
        boutons.push(bouton);
        liste.appendChild(bouton);
      });

      // Quand le visiteur clique sur un choix
      function repondre(index) {
        boutons.forEach(function (b) { b.disabled = true; });  // on bloque la question

        if (index === question.bonne) {
          bonnes++;
          boutons[index].classList.add("juste");
          explication.textContent = "Bonne réponse. " + question.explication;
        } else {
          boutons[index].classList.add("faux");
          boutons[question.bonne].classList.add("juste");
          explication.textContent = "Mauvaise réponse. La bonne réponse était : « " +
                                    question.choix[question.bonne] + " ». " + question.explication;
        }
        explication.hidden = false;

        repondues++;
        if (repondues === total) { afficherResultat(); }
      }

      bloc.appendChild(liste);
      bloc.appendChild(explication);
      conteneur.appendChild(bloc);
    });

    conteneur.appendChild(resultat);

    // Quand toutes les questions sont répondues : score + sauvegarde
    function afficherResultat() {
      const etat = Progression.enregistrerScore(config.id, bonnes, total, config.seuil);
      const reussi = bonnes >= config.seuil;

      resultat.replaceChildren();
      resultat.classList.toggle("reussi", reussi);

      const titre = document.createElement("h3");
      titre.textContent = "Score : " + bonnes + " sur " + total;
      resultat.appendChild(titre);

      const message = document.createElement("p");
      if (reussi) {
        message.textContent = config.messageReussite || "Bravo, module validé ! Vous pouvez passer au suivant.";
      } else {
        message.textContent = config.messageEchec ||
          ("Il faut au moins " + config.seuil + " bonnes réponses sur " + total +
           " pour valider le module. Relisez la leçon, puis réessayez.");
      }
      resultat.appendChild(message);

      // Après une réussite, on peut proposer un lien (par exemple vers la page d'accueil)
      if (reussi && config.lienReussite) {
        const lien = document.createElement("p");
        const a = document.createElement("a");
        a.href = config.lienReussite.href;
        a.textContent = config.lienReussite.texte;
        lien.appendChild(a);
        resultat.appendChild(lien);
      }

      const rejouer = document.createElement("button");
      rejouer.type = "button";
      rejouer.className = "bouton";
      rejouer.textContent = "Refaire le quiz";
      rejouer.addEventListener("click", demarrer);
      resultat.appendChild(rejouer);

      resultat.hidden = false;
    }
  }

  demarrer();
}
