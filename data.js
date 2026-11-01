/*
 * Grizzlift — contenu des séances (Bloc 1).
 *
 * Modes :
 *   sets    : séries classiques  → Phase A (exercice) ⇄ Phase B (chrono de repos)
 *   circuit : stations enchaînées, repos uniquement entre les tours
 *   auto    : auto-pilot chronométré (maintien / transition), aucun clic
 *   pick    : liste à piocher (écran de sélection), puis moteur "sets"
 *
 * Visuels : déposer assets/exercises/<id>.webp (ou renseigner "image": "fichier.gif").
 * Sans fichier, un visuel de remplacement s'affiche.
 */
window.GRIZZLIFT_DATA = {
  sessions: [
    {
      id: 'push',
      emoji: '💥',
      subtitle: 'Dips, Développé, Épaules & Triceps',
      title: 'Push',
      estimatedTime: '~50 min',
      icon: 'press',
      mode: 'sets',
      exercises: [
        {
          id: 'dips_leste', name: 'Dips lestés', target: 'Pectoraux bas/moyen, Triceps',
          icon: 'press', sets: 4, reps: '8 reps', rest: 120,
          info: {
            action: 'Buste légèrement penché, descendre les coudes à 90°.',
            focus: 'Pousse fort dans la paume des mains en gainant les abdos.',
            avoid: 'Ne pas écarter les coudes sur les côtés.'
          }
        },
        {
          id: 'dev_incline_halteres', name: 'Développé incliné haltères', target: 'Pec claviculaire (haut)',
          icon: 'press', sets: 4, reps: '10 reps', rest: 90,
          info: {
            action: 'Banc à 30°, omoplates serrées, haltères au-dessus du haut des pecs.',
            focus: 'Pousse en rapprochant les haltères, serre le haut des pecs en haut.',
            avoid: 'Ne pas décoller les fesses du banc ni rebondir en bas.'
          }
        },
        {
          id: 'dev_militaire_assis', name: 'Développé militaire assis', target: 'Épaules (global)',
          icon: 'press', sets: 3, reps: '10 reps', rest: 90,
          info: {
            action: 'Dos plaqué au dossier, charge à hauteur d’oreilles, coudes un peu devant.',
            focus: 'Pousse à la verticale en serrant abdos et fessiers.',
            avoid: 'Ne pas cambrer le bas du dos pour finir la rep.'
          }
        },
        {
          id: 'elevations_laterales', name: 'Élévations latérales', target: 'Deltoïde latéral',
          icon: 'press', sets: 3, reps: '15 reps', rest: 60,
          info: {
            action: 'Debout, buste très légèrement penché, coudes à peine fléchis.',
            focus: 'Monte en écartant, coudes en premier, jusqu’à hauteur d’épaules.',
            avoid: 'Pas d’élan ni de haussement des trapèzes.'
          }
        },
        {
          id: 'face_pull', name: 'Face pull à la poulie', target: 'Deltoïde postérieur (équilibre postural)',
          icon: 'pull', sets: 3, reps: '15 reps', rest: 60,
          info: {
            action: 'Poulie haute, corde, pouces vers l’arrière, un pas en recul.',
            focus: 'Tire vers le front en écartant les mains, serre les omoplates.',
            avoid: 'Ne pas tirer avec le bas du dos ni monter les épaules.'
          }
        },
        {
          id: 'extension_triceps_corde', name: 'Extension triceps (corde, poulie)', target: 'Triceps',
          icon: 'press', sets: 3, reps: '12 reps', rest: 60,
          info: {
            action: 'Poulie haute, coudes collés au buste, buste légèrement penché.',
            focus: 'Tends complètement en écartant la corde en bas.',
            avoid: 'Les coudes ne partent pas vers l’avant.'
          }
        }
      ]
    },

    {
      id: 'pull',
      emoji: '🏋️',
      subtitle: 'Tractions, Rowing & Biceps',
      title: 'Pull',
      estimatedTime: '~50 min',
      icon: 'pull',
      mode: 'sets',
      exercises: [
        {
          id: 'tractions_lestees', name: 'Tractions pronation lestées', target: 'Dos, Biceps',
          icon: 'pull', sets: 4, reps: '8 reps', rest: 120,
          info: {
            action: 'Prise pronation un peu plus large que les épaules, départ bras tendus.',
            focus: 'Tire les coudes vers les hanches, poitrine vers la barre.',
            avoid: 'Pas de kipping ni de demi-amplitude en bas.'
          }
        },
        {
          id: 'rowing_barre', name: 'Rowing barre buste penché', target: 'Épaisseur du dos',
          icon: 'pull', sets: 4, reps: '10 reps', rest: 90,
          info: {
            action: 'Buste penché à ~45°, dos neutre, genoux légèrement fléchis.',
            focus: 'Tire la barre vers le nombril et serre les omoplates.',
            avoid: 'Ne pas arrondir le dos ni se redresser pour tricher.'
          }
        },
        {
          id: 'tirage_horizontal', name: 'Tirage horizontal poulie, prise neutre', target: 'Trapèzes moy/bas, Rhomboïdes',
          icon: 'pull', sets: 3, reps: '12 reps', rest: 90,
          info: {
            action: 'Assis, buste droit, pieds calés, poignée neutre.',
            focus: 'Coudes en arrière, omoplates vers le bas et ensemble.',
            avoid: 'Ne pas basculer le buste en arrière à chaque rep.'
          }
        },
        {
          id: 'oiseau_halteres', name: 'Oiseau haltères buste penché', target: 'Deltoïde postérieur',
          icon: 'pull', sets: 3, reps: '15 reps', rest: 60,
          info: {
            action: 'Buste presque à l’horizontale, dos plat, bras pendants.',
            focus: 'Écarte les bras en croix, pousse les haltères vers les murs.',
            avoid: 'Pas d’élan : charge légère et contrôlée.'
          }
        },
        {
          id: 'curl_ez', name: 'Curl biceps barre EZ', target: 'Biceps',
          icon: 'press', sets: 3, reps: '10 reps', rest: 60,
          info: {
            action: 'Debout, coudes collés aux flancs, prise sur les angles de la barre.',
            focus: 'Contracte fort en haut, descends en 2-3 secondes.',
            avoid: 'Pas de balancier avec le buste.'
          }
        },
        {
          id: 'curl_marteau', name: 'Curl marteau haltères', target: 'Brachial, Avant-bras',
          icon: 'press', sets: 3, reps: '12 reps', rest: 60,
          info: {
            action: 'Prise neutre (pouces vers le haut), coudes fixes.',
            focus: 'Serre fort les poignées tout le long du mouvement.',
            avoid: 'Ne pas avancer les coudes en haut du mouvement.'
          }
        }
      ]
    },

    {
      id: 'legs',
      emoji: '🦵',
      subtitle: 'Presse, Ischios, Fessiers & Mollets',
      title: 'Legs',
      estimatedTime: '~50 min',
      icon: 'legs',
      mode: 'sets',
      // Volume de reprise volontairement bas : ajuster selon ce que le genou tolère
      exercises: [
        {
          id: 'leg_press', name: 'Leg press', target: 'Quadriceps',
          icon: 'legs', sets: 4, reps: '10 reps', rest: 120,
          info: {
            action: 'Dos et bassin plaqués au dossier, pieds largeur d’épaules au milieu du plateau.',
            focus: 'Pousse dans les talons, genoux dans l’axe des pieds.',
            avoid: 'Ne pas verrouiller les genoux en haut ; stop à la moindre douleur au genou.'
          }
        },
        {
          id: 'leg_curl', name: 'Leg curl allongé / assis', target: 'Ischios',
          icon: 'legs', sets: 4, reps: '12 reps', rest: 90,
          info: {
            action: 'Boudin juste au-dessus des chevilles, genoux alignés avec l’axe de la machine.',
            focus: 'Ramène les talons vers les fesses, descente lente en 2-3 s.',
            avoid: 'Ne pas décoller les hanches pour tricher.'
          }
        },
        {
          id: 'hip_thrust', name: 'Hip thrust', target: 'Fessiers, Ischios',
          icon: 'legs', sets: 3, reps: '10 reps', rest: 90,
          info: {
            action: 'Haut du dos sur le banc, barre dans le pli de la hanche, pieds à plat.',
            focus: 'Pousse les hanches vers le haut et serre fort les fessiers en haut.',
            avoid: 'Ne pas cambrer : menton rentré, côtes basses.'
          }
        },
        {
          id: 'mollets_debout', name: 'Mollets debout à la machine', target: 'Mollets',
          icon: 'legs', sets: 4, reps: '15 reps', rest: 60,
          info: {
            action: 'Avant des pieds sur la marche, épaules sous les boudins, jambes tendues.',
            focus: 'Monte au maximum sur la pointe, pause 1 s en haut, descente complète.',
            avoid: 'Pas de rebond en bas du mouvement.'
          }
        }
      ]
    },

    {
      id: 'fullbody',
      emoji: '⚡',
      subtitle: 'Ski erg, Pompes, Rameur & Gainage',
      title: 'Full Body',
      estimatedTime: '~45 min',
      icon: 'cardio',
      mode: 'circuit',
      rounds: 4,
      roundRest: 210,
      exercises: [
        {
          id: 'ski_erg', name: 'Ski erg', target: 'Cardio, Dos, Gainage', icon: 'cardio', reps: '500 m',
          info: {
            action: 'Debout face à la machine, bras tendus en haut.',
            focus: 'Tire avec le dos et les abdos, allure soutenue mais pas sprint.',
            avoid: 'Ne pas tirer seulement avec les bras.'
          }
        },
        {
          id: 'pompes', name: 'Pompes', target: 'Pecs, Triceps, Gainage', icon: 'press', reps: '15 reps',
          info: {
            action: 'Mains un peu plus larges que les épaules, corps aligné.',
            focus: 'Gaine fessiers et abdos, poitrine jusqu’au sol.',
            avoid: 'Ne pas laisser les hanches s’affaisser.'
          }
        },
        {
          id: 'rameur', name: 'Rameur', target: 'Cardio, Chaîne postérieure', icon: 'cardio', reps: '500 m',
          warn: 'Genou : remplace par ski erg ou vélo si la flexion gêne.',
          info: {
            action: 'Pieds sanglés, départ jambes fléchies, bras tendus.',
            focus: 'Jambes → buste → bras, puis retour dans l’ordre inverse.',
            avoid: 'Stop si le genou tire en position fléchie.'
          }
        },
        {
          id: 'fentes_halteres', name: 'Fentes avant haltères', target: 'Quadriceps, Fessiers', icon: 'legs', reps: '10 / jambe',
          warn: 'Genou : saute cette station à la moindre douleur.',
          skippable: true,
          info: {
            action: 'Haltères le long du corps, grand pas en avant.',
            focus: 'Descends à la verticale, genou arrière vers le sol.',
            avoid: 'Genou avant qui rentre vers l’intérieur.'
          }
        },
        {
          id: 'planche', name: 'Gainage (planche)', target: 'Sangle abdominale', icon: 'core', reps: '30 sec',
          duration: 30, // station chronométrée
          info: {
            action: 'Avant-bras au sol, coudes sous les épaules.',
            focus: 'Bascule le bassin, serre fessiers et abdos.',
            avoid: 'Ne pas creuser le dos ni monter les fesses.'
          }
        }
      ]
    },

    {
      id: 'abs',
      emoji: '🔥',
      subtitle: 'Toes to bar, Dragon flag, Swiss ball',
      tag: 'À la carte',
      title: 'Abdos / Gainage',
      estimatedTime: 'À la carte',
      icon: 'core',
      mode: 'pick',
      // "Séance complète" : un passage (1 série) sur chaque exo non avancé
      fullSets: 1,
      note: 'Pour piocher 2-3 exos, prends-les à la suite dans l’ordre. Toes to bar et dragon flag : quand les suspendus (3 à 5) deviennent faciles.',
      exercises: [
        {
          id: 'toes_to_bar', name: 'Toes to bar', target: 'Abdos complet, Contrôle athlétique', cat: 'lsit', advanced: true,
          pattern: 'suspendu',
          icon: 'pull', sets: 3, reps: '8 reps', rest: 90,
          info: {
            action: 'Suspendu à la barre, prise pronation, épaules actives.',
            focus: 'Enroule le bassin et monte les pieds jusqu’à la barre.',
            avoid: 'Pas de balancier : contrôle la descente.'
          }
        },
        {
          id: 'dragon_flag', name: 'Dragon flag (ou négatives)', target: 'Gainage total', cat: 'core', advanced: true,
          pattern: 'anti_extension',
          icon: 'core', sets: 3, reps: '6 reps', rest: 90,
          info: {
            action: 'Allongé sur un banc, mains agrippées derrière la tête.',
            focus: 'Corps gainé d’un bloc, des épaules aux pieds, descente lente.',
            avoid: 'Ne pas casser aux hanches ni cambrer.'
          }
        },
        {
          id: 'releves_jambes_suspendu', name: 'Relevés de jambes suspendu', target: 'Abdos bas, Base du L-sit', cat: 'lsit',
          pattern: 'suspendu',
          icon: 'pull', sets: 3, reps: '10 reps', rest: 60,
          info: {
            action: 'Suspendu, épaules engagées, jambes tendues.',
            focus: 'Monte les jambes à l’horizontale en enroulant le bassin.',
            avoid: 'Pas d’élan ni de balancement.'
          }
        },
        {
          id: 'tuck_lsit', name: 'Tuck L-sit hold', target: 'Compression hanche, L-sit', cat: 'lsit',
          pattern: 'compression',
          icon: 'core', sets: 3, reps: '25 sec', rest: 60, duration: 25,
          info: {
            action: 'Mains sur parallettes ou bancs, bras tendus, genoux ramenés.',
            focus: 'Pousse le sol, épaules basses, compresse les hanches.',
            avoid: 'Ne pas hausser les épaules vers les oreilles.'
          }
        },
        {
          id: 'trx_knee_tuck', name: 'Suspended knee tuck (TRX)', target: 'Gainage dynamique', cat: 'core',
          pattern: 'ramene',
          icon: 'core', sets: 3, reps: '10 reps', rest: 60,
          info: {
            action: 'Pieds dans les sangles, position de pompe bras tendus.',
            focus: 'Ramène les genoux vers la poitrine, dos plat.',
            avoid: 'Ne pas laisser les hanches s’affaisser au retour.'
          }
        },
        {
          id: 'pallof_press', name: 'Pallof press (poulie)', target: 'Anti-rotation, Stabilité', cat: 'core',
          pattern: 'anti_rotation',
          icon: 'core', sets: 3, reps: '12 / côté', rest: 45,
          info: {
            action: 'De profil à la poulie, mains à la poitrine, pieds largeur d’épaules.',
            focus: 'Tends les bras devant sans laisser le buste tourner.',
            avoid: 'Ne pas compenser en tournant les hanches.'
          }
        },
        {
          id: 'woodchop', name: 'Woodchop à la poulie', target: 'Rotation puissance (padel, ski)', cat: 'oblique',
          pattern: 'rotation',
          icon: 'core', sets: 3, reps: '10 / côté', rest: 45,
          info: {
            action: 'Poulie haute, de profil, bras quasi tendus.',
            focus: 'Tourne le buste en diagonale vers le bas avec les obliques.',
            avoid: 'Ne pas tirer seulement avec les bras.'
          }
        },
        {
          id: 'russian_twist', name: 'Russian twist lesté', target: 'Obliques, Rotation', cat: 'oblique',
          pattern: 'rotation',
          icon: 'core', sets: 3, reps: '12 / côté', rest: 45,
          info: {
            action: 'Assis, buste incliné en arrière, disque ou médecine ball en main.',
            focus: 'Tourne les épaules d’un côté à l’autre, la charge suit.',
            avoid: 'Ne pas arrondir le bas du dos.'
          }
        },
        {
          id: 'farmer_carry', name: 'Farmer carry (haltères)', target: 'Anti-flexion latérale', cat: 'core',
          pattern: 'porte',
          icon: 'press', sets: 3, reps: '25 m', rest: 60,
          info: {
            action: 'Haltères lourds le long du corps, debout bien droit.',
            focus: 'Petits pas, épaules basses, abdos serrés.',
            avoid: 'Ne pas pencher sur le côté.'
          }
        },
        {
          id: 'rollout', name: 'Rollout (roue ou swiss ball)', target: 'Gainage antérieur', cat: 'core',
          pattern: 'anti_extension',
          icon: 'core', sets: 3, reps: '8 reps', rest: 60,
          info: {
            action: 'À genoux sur un tapis, mains sur la roue ou le ballon.',
            focus: 'Avance bassin rentré, reviens en tirant avec les abdos.',
            avoid: 'Ne pas creuser le dos en extension.'
          }
        },
        {
          id: 'pike_swiss_ball', name: 'Pike sur swiss ball', target: 'Abdos bas, Gainage dynamique', cat: 'lsit',
          pattern: 'ramene',
          icon: 'core', sets: 3, reps: '10 reps', rest: 60,
          info: {
            action: 'Position de pompe, pieds sur le ballon (genoux fléchis pour débuter).',
            focus: 'Monte les hanches vers le plafond en roulant le ballon.',
            avoid: 'Épaules au-dessus des mains, pas d’affaissement.'
          }
        },
        {
          id: 'rotation_bassin_swissball', name: 'Rotation de bassin (swiss ball)', target: 'Obliques, Rotation hanche', cat: 'oblique',
          pattern: 'rotation',
          icon: 'core', sets: 3, reps: '10 / côté', rest: 45,
          info: {
            action: 'Allongé sur le dos, jambes sur le ballon, bras en croix.',
            focus: 'Fais rouler le ballon d’un côté à l’autre avec les obliques.',
            avoid: 'Stop si ça tire sur le genou d’appui.'
          }
        },
        {
          id: 'extension_lombaire', name: 'Extension lombaire (swiss ball)', target: 'Lombaires', cat: 'lombaire',
          pattern: 'lombaire',
          icon: 'core', sets: 3, reps: '12 reps', rest: 60,
          info: {
            action: 'Ventre sur le ballon (ou banc à lombaires), pieds calés.',
            focus: 'Remonte jusqu’à l’alignement en serrant fessiers et lombaires.',
            avoid: 'Ne pas hyper-cambrer en haut.'
          }
        },
        {
          id: 'stir_the_pot', name: 'Stir the pot', target: 'Gainage, Stabilité', cat: 'core',
          pattern: 'anti_extension',
          icon: 'core', sets: 3, reps: '30 sec', rest: 45, duration: 30,
          info: {
            action: 'Planche, avant-bras posés sur le swiss ball.',
            focus: 'Dessine de petits cercles avec les avant-bras.',
            avoid: 'Le bassin ne bouge pas, pas de dos creux.'
          }
        },
        {
          id: 'crunch_swissball', name: 'Crunch lesté (swiss ball)', target: 'Abdos supérieurs', cat: 'sup',
          pattern: 'crunch',
          icon: 'core', sets: 3, reps: '12 reps', rest: 45,
          info: {
            action: 'Bas du dos sur le ballon, disque contre la poitrine.',
            focus: 'Enroule le buste en rapprochant côtes et bassin.',
            avoid: 'Ne pas tirer sur la nuque.'
          }
        }
      ]
    },

    {
      id: 'mobility',
      emoji: '🧘',
      subtitle: '14 postures guidées (55 s / 5 s)',
      tag: 'Auto-pilot',
      title: 'Mobilité',
      estimatedTime: '14 min',
      icon: 'stretch',
      mode: 'auto',
      prepare: 10,
      exercises: [
        {
          id: 'chat_vache', name: 'Chat-vache', target: 'Mise en route colonne vertébrale', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'colonne',
          info: {
            action: 'À quatre pattes, mains sous les épaules, genoux sous les hanches.',
            focus: 'Alterne lentement dos rond / dos creux avec la respiration.',
            avoid: 'Ne force pas l’amplitude dans le bas du dos.'
          }
        },
        {
          id: 'extension_thoracique', name: 'Extension thoracique (foam roller)', target: 'Cyphose dorsale', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'thoracique',
          info: {
            action: 'Rouleau sous le haut du dos, mains derrière la tête.',
            focus: 'Laisse le haut du dos s’ouvrir sur le rouleau en expirant.',
            avoid: 'Ne descends pas le rouleau sur les lombaires.'
          }
        },
        {
          id: 'couch_stretch_droit', image: 'couch_stretch.webp', name: 'Couch stretch (droit)', target: 'Antéversion du bassin', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'avant_cuisse', pair: 'couch',
          info: {
            action: 'Genou arrière collé au mur, pied avant à plat.',
            focus: 'Contracte le fessier arrière et rentre le nombril.',
            avoid: 'Ne cambre pas le bas du dos.'
          }
        },
        {
          id: 'couch_stretch_gauche', image: 'couch_stretch.webp', name: 'Couch stretch (gauche)', target: 'Antéversion du bassin', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'avant_cuisse', pair: 'couch',
          info: {
            action: 'Genou arrière collé au mur, pied avant à plat.',
            focus: 'Contracte le fessier arrière et rentre le nombril.',
            avoid: 'Ne cambre pas le bas du dos.'
          }
        },
        {
          id: 'ischio_droit', image: 'ischio.webp', name: 'Étirement ischio-jambiers (droit)', target: 'Raideur jambes, L-sit', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'ischios', pair: 'ischio',
          info: {
            action: 'Talon posé sur un banc bas, jambe tendue, dos droit.',
            focus: 'Bascule le bassin vers l’avant, poitrine vers le genou.',
            avoid: 'Ne pas arrondir le dos pour aller plus loin.'
          }
        },
        {
          id: 'ischio_gauche', image: 'ischio.webp', name: 'Étirement ischio-jambiers (gauche)', target: 'Raideur jambes, L-sit', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'ischios', pair: 'ischio',
          info: {
            action: 'Talon posé sur un banc bas, jambe tendue, dos droit.',
            focus: 'Bascule le bassin vers l’avant, poitrine vers le genou.',
            avoid: 'Ne pas arrondir le dos pour aller plus loin.'
          }
        },
        {
          id: 'quad_droit', image: 'quad_debout.webp', name: 'Étirement quadriceps debout (droit)', target: 'Raideur jambes, L-sit', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'avant_cuisse', pair: 'quad',
          info: {
            action: 'Debout, attrape la cheville, genoux côte à côte.',
            focus: 'Serre le fessier et pousse la hanche vers l’avant.',
            avoid: 'Arrête si ça tire sur le genou.'
          }
        },
        {
          id: 'quad_gauche', image: 'quad_debout.webp', name: 'Étirement quadriceps debout (gauche)', target: 'Raideur jambes, L-sit', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'avant_cuisse', pair: 'quad',
          info: {
            action: 'Debout, attrape la cheville, genoux côte à côte.',
            focus: 'Serre le fessier et pousse la hanche vers l’avant.',
            avoid: 'Arrête si ça tire sur le genou.'
          }
        },
        {
          id: 'hanche_90_90', name: 'Mobilité hanche 90/90', target: 'Hanches (escalade, ski)', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'hanche',
          info: {
            action: 'Assis, une jambe à 90° devant, l’autre à 90° sur le côté.',
            focus: 'Buste droit, penche-toi doucement sur la jambe avant.',
            avoid: 'La rotation vient de la hanche, pas des genoux.'
          }
        },
        {
          id: 'grenouille', name: 'Étirement adducteurs (grenouille)', target: 'Ski, Padel (appuis latéraux)', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'adducteurs',
          info: {
            action: 'À quatre pattes, genoux écartés, chevilles dans l’axe des genoux.',
            focus: 'Recule doucement les hanches vers les talons.',
            avoid: 'Aucune douleur aux genoux : mets un tapis épais.'
          }
        },
        {
          id: 'open_book', name: 'Rotation thoracique (open book)', target: 'Vélo, Ski, Padel (rotation)', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'thoracique',
          info: {
            action: 'Allongé sur le côté, genoux fléchis à 90°, bras tendus devant.',
            focus: 'Ouvre le bras du dessus vers l’arrière en suivant la main des yeux.',
            avoid: 'Les genoux restent collés au sol.'
          }
        },
        {
          id: 'rotation_externe_epaule', name: 'Rotation externe épaule (élastique)', target: 'Protraction des épaules', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'epaule',
          info: {
            action: 'Élastique en main, coude collé au flanc à 90°.',
            focus: 'Tourne l’avant-bras vers l’extérieur, omoplate basse.',
            avoid: 'Le coude ne décolle pas du corps.'
          }
        },
        {
          id: 'dislocations_epaule', name: 'Dislocations d’épaule (bâton)', target: 'Mobilité épaule, Escalade', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'epaule',
          info: {
            action: 'Bâton ou élastique en prise très large, bras tendus.',
            focus: 'Passe lentement de l’avant à l’arrière, bras toujours tendus.',
            avoid: 'Élargis la prise plutôt que de plier les coudes.'
          }
        },
        {
          id: 'dorsiflexion_cheville', name: 'Cheville en dorsiflexion (mur)', target: 'Chevilles (escalade, ski)', icon: 'stretch', duration: 55, transition: 5,
          pattern: 'cheville',
          info: {
            action: 'Face au mur, pied à ~10 cm, talon au sol.',
            focus: 'Avance le genou vers le mur sans décoller le talon, alterne.',
            avoid: 'Genou dans l’axe du pied, stop si douleur au genou.'
          }
        }
      ]
    }
  ]
};
