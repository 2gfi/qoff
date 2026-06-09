# QOff Back-Office Bar — Backlog

Éléments identifiés en revue, à planifier (non implémentés dans le POC).

## Badges — gestion confiée aux responsables de bar
**Statut : backlog** · _ajouté le 8 juin 2026_

Aujourd'hui les badges d'article (`Nouveau`, `Happy Hour`, `Signature`, `Bio`,
`Végé`, `Vegan`, `Sans lactose`…) sont une **liste figée**, simplement
activable/désactivable par article dans l'éditeur.

À faire :
- Permettre au **responsable de bar** (patron / manager délégué) de **gérer les
  badges** : créer, renommer, choisir une couleur/icône, ordonner, masquer.
- **Afficher** ces badges côté responsable (vue de gestion dédiée) et les
  propager côté client.
- Articuler avec le catalogue QOff (badges par défaut vs badges propres au bar,
  remontés au superadmin — même logique que les catégories / sous-filtres).

Repère dans le code : champ « Badges » de l'éditeur d'article
(`bar/bar-menu.jsx` → `ArticleSheetBar`, constante `ALL_BADGES`).
