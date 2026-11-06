# Sprite-Vorbereitung: Brutalität/Freiheit + Charakteranpassung

Ziel: Eine vollständige Liste, welche Grafiken du vorbereiten musst, bevor wir die beiden Pläne bauen. Danach bauen wir zuerst die Charakteranpassung, weil sie alle späteren Spieleranimationen betrifft.

## Grundregeln für alle neuen Sprites
- Frame 32×32, Figur mittig, Füße auf gleicher Höhe wie bisher (Standfläche ca. Pixelzeile 30).
- 8 Richtungen (S, SW, W, NW, N, NO, O, SO). Norden darf fehlen – wir nutzen NO/NW als Ersatz.
- Gleiche Palette/Outline wie dein bisheriger Spieler.
- Je Animation ein ZIP mit allen Richtungen, Name = Animation (z. B. `walk`, `attack_axe`).

## Teil A – Charakteranpassung

### Variante 1 (empfohlen, credit-sparend): komplette Skins
Jeder Skin ist ein kompletter Satz aller Spieleranimationen. Kein Ebenen-System nötig.
Pro Skin benötigt (alle 8 Richtungen):
1. Idle / Stehen
2. Gehen
3. Sprinten (falls eigene Animation, sonst Gehen)
4. Ducken / Schleichen
5. Steinkeil-Angriff
6. Knie-Schlag-Finisher
7. Axt-Enthauptung (11 Frames)
8. Tragen (Gefangener auf Schultern)
9. Knien (für Nähe-/Ergebungsposen)
10. Getroffen / Niedergeschlagen
11. Tod (für Erbfolge später wichtig)

Bart/Haare = einfach eigene Skin-Varianten (z. B. „kurz/kein Bart“, „lang/Vollbart“).

### Variante 2: Baukasten (Körper + Haare + Bart getrennt)
Flexibler, aber deutlich mehr Grafikarbeit: Jede Haar- und Bartvariante braucht **jede** Animation oben in allen Richtungen als transparente Ebene, pixelgenau passend zum Körper.
- Körper ohne Haare/Bart: alle 11 Animationen
- Je Frisur (z. B. 3–4): alle 11 Animationen, nur Haarebene
- Je Bart (z. B. 3): alle 11 Animationen, nur Bartebene
- Optional Hautton/Bemalung per Farbtausch im Spiel (keine extra Sprites)

### Im Spiel geplant
- Auswahl beim ersten Start zusammen mit der Namenswahl, später änderbar im Lager.
- Vorschau-Portrait im HUD.
- Wahl wird im Spielstand gespeichert.

## Teil B – Brutalität & Freiheit (nächste Features)

### 1. Feuer & Ruinen (Dörfer/Hütten anzünden)
- Fackel in der Hand: Idle + Gehen + Werfen/Anzünden (8 Richtungen) – pro Skin
- Feuer-Animation klein und groß (4–6 Frames, ohne Richtungen)
- Rauch (4–6 Frames)
- Abgebrannte Ruine je Haustyp (Nordic-Häuser, 7 Drachenhütten)
- Glut/Asche-Boden (1–2 Tiles)
- Dorfbewohner: Löschen / Panik-Rennen (kann vorerst Gehen nutzen)

### 2. Gefangenenflucht & Rettungstrupps
- Gefangene: Fesseln lösen / sich befreien (4–6 Frames, 8 Richtungen) – je Volk eine Vorlage reicht
- Gefesselt kriechen/humpeln (optional, sonst Gehen langsam)
- Pfahl/Käfig für Gefangene im Lager (bebaubar, statisch)

### 3. Erbfolge (Tod des Spielers → Nachfolger spielen)
- Nutzt die Skins aus Teil A – kein extra Sprite, wenn ein anderer Skin/Variante übernimmt
- Optional: Grab/Steinhügel (statisch), Trauerpose (kniend, vorhanden)

### 4. Wolfszähmung / Aasfresser (vorhandene Wölfe)
- Bereits vorhanden; optional Wolf an Leine/folgend, Sitzen.

## Empfohlene Reihenfolge
1. Charakteranpassung mit Variante 1 (fertige Skins) – du lieferst 2–3 Skins.
2. Feuer & Ruinen.
3. Gefangenenflucht.
4. Erbfolge (nutzt die Skins).

## Technische Details
- Neue engine-freie Datei `appearance.ts` (Skin-Definitionen, Auswahl, Speicherung), Spieler-Atlas pro Skin gepackt wie die Tribe-Atlanten.
- `world.ts` lädt den gewählten Skin dynamisch; fehlende Animationen eines Skins fallen auf den Standard-Skin zurück, damit Teil-Lieferungen funktionieren.
- Feuer/Ruinen-Regeln später engine-frei in `fire.ts`, Hauszustand im bestehenden Spielstand.
