# Frachtwerk – feste Spielregeln

Diese Datei beschreibt die **aktuell implementierten Werte und Freischaltungen** der lokalen Spielversion. `M` bedeutet Münzen, `t` Tonnen und `XP` Erfahrungspunkte.

## 1. Start und Ablauf

- Vor einem neuen Spielstand wählt der Spieler **einen festen Hauptsitz**. Danach beginnt er auf **Spielerlevel 1** mit **1.000 M Startguthaben**, zwei kostenlosen **4-t-7,5-Tonnern** (LKW-01 und LKW-02, jeweils 0 km und Common 0 ★) und fünf gemischten Angeboten. Der erste selbst gekaufte LKW erhält die Nummer 03. Den Stadthub eröffnet man kostenlos; anschließend kann der erste Stadttransporter gekauft werden. Bestehende Spielstände behalten Guthaben, Fahrzeuge und laufende Aufträge und erhalten keinen zusätzlichen Starter-LKW.
- Auf dem Dashboard gibt es vorübergehend den Knopf **„+50.000 M (Test)“**. Jeder Klick schreibt dem aktuellen Spielstand 50.000 M gut. Die Gutschrift bleibt nach dem Neuladen erhalten und wird in der Münzenbilanz getrennt vom Transportertrag als „Testmünzen“ ausgewiesen.
- Ein freier LKW kann genau einen verfügbaren Auftrag übernehmen. Ein Auftrag hat genau einen zugewiesenen LKW.
- Pro Tour transportiert der LKW höchstens seine aktuelle Kapazität. Die nötigen Touren sind `aufrunden(Restvolumen / Kapazität)`.
- Das Fahrtempo hängt von der tatsächlichen Ladung jeder Tour ab. Jede geladene Tonne senkt das Tempo um 1 %; das gilt auch für die Grundkapazität direkt nach dem Kauf. Eine nur teilweise beladene letzte Tour ist entsprechend schneller.
- Nach jeder abgeschlossenen Tour werden die transportierten Tonnen, Münzen und XP gebucht. Bei Aufträgen im Regionalverkehr und Fernverkehr endet eine Tour erst nach Hin- und Rückfahrt. Die nächste Tour beginnt automatisch.
- Sobald das gesamte Auftragsvolumen geliefert ist, wird der Auftrag abgeschlossen und der LKW wieder frei. Ohne neuen Auftrag fährt und verdient er nicht weiter.
- Der Spielstand liegt lokal im Browser (`localStorage`). Beim erneuten Öffnen werden inzwischen fällige Touren nachberechnet. Konten und Firebase sind noch nicht eingebaut.
- Die Firma startet ohne freigeschaltete Abteilungen und ohne Mitarbeitende. Das Führungsteam im Modul „Personal“ hat fünf aktive Kartenplätze; der Spieler belegt keinen davon.

### Startorte und Auftragsumgebung

Jeder mögliche Startort hat nahe Ziele innerhalb seines Landes und Ziele in anderen Ländern seiner Region. Alle Angebote starten am gewählten Hauptsitz. Stadtverkehr läuft im Stadthub ohne einzelne Auftragsangebote. Regionalverkehr und Fernverkehr bezeichnen Transportsegmente, nicht den Grenzübertritt. Für beide Segmente wählt das Spiel eine Route aus der jeweils hinterlegten Ortsliste; der Kilometerwert bleibt unverändert. Es werden keine Schiffsfahrten simuliert. Die Ortslisten und Kilometerwerte stehen in `app.js` unter `START_CITIES`.

| Kontinent | Wählbare Startorte |
| --- | --- |
| Europa | Antwerpen (Belgien), Hamburg (Deutschland), Marseille (Frankreich) |
| Asien | Ho-Chi-Minh-Stadt (Vietnam), Hongkong (China), Shanghai (China) |
| Afrika | Tanger (Marokko), Durban (Südafrika) |
| Nordamerika | Los Angeles und New York (USA) |
| Südamerika | Santos (Brasilien), Callao (Peru) |

Antwerpen und Rotterdam wurden wegen ihrer räumlichen Nähe nicht beide als Startorte aufgenommen. Bestehende Aufträge aus älteren Spielständen behalten ihre ursprünglichen Orte und werden nicht umgeschrieben. Beim Zurücksetzen des Spielstands erscheint die Startortwahl erneut.

## 2. Spielerlevel und Kunden

Für den Aufstieg vom aktuellen Level `L` auf `L + 1` werden bis einschließlich Level 24 `100 × L` Spieler-XP benötigt. Ab Level 25 kostet der nächste Aufstieg `4 × L²` XP. Die Tabelle zeigt die **insgesamt** nötigen XP seit Spielbeginn für neue Spielstände.

| Erreichtes Level | Gesamt-XP |
| ---: | ---: |
| 1 | 0 |
| 3 | 300 |
| 7 | 2.100 |
| 10 | 4.500 |
| 12 | 6.600 |
| 17 | 13.600 |
| 25 | 30.000 |
| 26 | 32.500 |
| 27 | 35.204 |
| 50 | 172.100 |

Bereits erreichte Level aus älteren Spielständen bleiben bei der Umstellung als Untergrenze gespeichert. Auch die daran gebundenen LKW-Plätze bleiben erhalten. Der bisherige XP-Stand wird nicht umgerechnet; die nächste Stufe wird erst bei Erreichen ihrer Schwelle nach der neuen Kurve vergeben. Bereits gewährte Expeditionspunkte-Refills werden nicht erneut ausgezahlt. Die Migration wird einmalig im Spielstand gespeichert.

Aufträge im Regionalverkehr und Fernverkehr sind von Anfang an verfügbar. Stammkunden werden erst nach Abschluss und Abholung des einmaligen Transportauftrags am Endlosort ihrer Region freigeschaltet. Bis dahin erscheinen sie nicht in den Stammdaten und ihre regulären Aufträge werden nicht angeboten.

## 3. LKW und erlaubte Auftragsarten

| LKW | Grundkapazität | Fahrzeugpreis je km | Kaufpreis | Erlaubte Aufträge |
| --- | ---: | ---: | ---: | --- |
| Sprinter | 1 t | 0,20 M | 4.000 M | Stadthub |
| 3,5-Tonner | 1,5 t | 0,50 M | 20.000 M | Stadthub |
| 7,5-Tonner | 4 t | 0,65 M | 25.000 M | Regionalverkehr |
| 18-Tonner | 8,5 t | 0,70 M | 100.000 M | Nur Regionalverkehr |
| 26-Tonner | 13 t | 1,05 M (vorläufig) | 250.000 M | Regionalverkehr und Fernverkehr |
| Sattelzug | 18 t | 1,60 M | 500.000 M | Nur Fernverkehr |
| 40-t-Tautliner | 24 t | 2,10 M (vorläufig) | 1.000.000 M | Nur Fernverkehr |

Die Modellnamen bezeichnen gängige Fahrzeugtypen; die angegebene Grundkapazität ist die im Spiel transportierbare Nutzlast. Die Auftragsart wird anhand der **Fahrzeugklasse** geprüft. Die Kapazität ist je Fahrzeugklasse fest. Alle Fahrzeugtypen und Auftragsarten sind unabhängig vom Spielerlevel verfügbar. Für einen Kauf sind genügend Münzen und ein freier LKW-Platz erforderlich; für die Zuweisung ein geeigneter freier LKW.

Die Seite **Garage** zeigt zwei Tabellen übereinander: oben reguläre LKW für Regionalverkehr und Fernverkehr, darunter Sprinter und 3,5-Tonner für den Stadthub. Bei laufenden Aufträgen zählt dort die Restzeit bis zum Abschluss des gesamten Auftrags herunter. Ein Klick auf eine Fahrzeugzeile öffnet die Details mit Auftrag, Status und Fahrzeugrang. Der **Händler** zeigt zwei Bereiche: Stadttransporter (Sprinter und 3,5-Tonner) sowie Langstreckentransporter nach Grundkapazität geordnet (7,5-Tonner, 18-Tonner, 26-Tonner, Sattelzug und 40-t-Tautliner).

### Fahrzeugstufen und Seltenheit

Jeder LKW beginnt bei **Common 0 ★**. Es gibt fünf Seltenheitsstufen mit jeweils zehn Aufwertungen:

| Seltenheit | Farbe | Gesamtstufe |
| --- | --- | ---: |
| Common | Grau | 0–9 |
| Uncommon | Grün | 10–19 |
| Rare | Blau | 20–29 |
| Epic | Lila | 30–39 |
| Legendär | Orange/Gold | 40–50 |

Beim Wechsel in die nächste Seltenheit beginnt deren angezeigte Stufe wieder bei **0 ★**: Gesamtstufe 10 ist Uncommon 0 ★, Gesamtstufe 20 ist Rare 0 ★. Das Maximum ist **Legendär 10 ★** bei Gesamtstufe 50. Jede Aufwertung verbraucht die unten angegebene Menge **Zahnräder der aktuellen Seltenheit**, keine Münzen. Der Vorrat wird von allen LKW geteilt. Bestehende Ränge bleiben erhalten. Jede Gesamtstufe erhöht das Basistempo um **0,5 Prozentpunkte**. Common 0 fährt leer 1,00 km/s; Uncommon 0 fährt 1,05, Rare 0 fährt 1,10, Epic 0 fährt 1,15, Legendär 0 fährt 1,20 und Legendär 10 fährt 1,25 km/s.

| Seltenheit der Aufwertung | Kosten für die Stufen 1 bis 10 | Summe |
| --- | --- | ---: |
| Common | 1.000, 2.000, 2.000, 2.000, 3.000, 3.000, 3.000, 4.000, 4.000, 5.000 | 29.000 |
| Uncommon | 100, 200, 200, 200, 300, 300, 300, 400, 400, 500 | 2.900 |
| Rare | 25, 50, 50, 50, 75, 75, 75, 100, 100, 125 | 725 |
| Epic | 5, 10, 10, 10, 15, 15, 15, 20, 20, 25 | 145 |
| Legendär | 1, 2, 2, 2, 3, 3, 3, 4, 4, 5 | 29 |

Für reguläre LKW stehen auf Level 1 **5 globale Kaufplätze** bereit. Auf Level 5, 10, 15 und jedem weiteren durch 5 teilbaren Level kommt ein Platz hinzu: `5 + abrunden(Spielerlevel / 5)`, ohne Obergrenze. Auf Level 25 sind es **10 Plätze**, auf Level 100 **25 Plätze**. Stadttransporter haben ein getrenntes Limit von `max(1, abrunden(Spielerlevel × 0,75))`; auf Level 100 sind es **75**. Vorhandene Fahrzeuge aus alten Spielständen bleiben erhalten. Die **Disposition erweitert die gemeinsame Auftragsbörse**.

### Tempo und Kapazitätsmodule

Tempo kann nicht manuell ausgebaut werden; nur der Fahrzeugrang erhöht das Basistempo. Jede neue Kapazitätsstufe kostet **genau 1 Kapazitätsmodul** und bringt **+0,5 t**. Die fahrzeugspezifischen Grenzen stehen unten. Module liegen in den Vorräten und werden in der Garage verbraucht; ein direkter Münzkauf ist nicht möglich.

| Vorhandenes Fahrzeugmodell | Grundkapazität | Neue Ausbaustufen | Maximale Kapazität |
|---|---:|---:|---:|
| Sprinter | 1,0 t | 1 | 1,5 t |
| 3,5-Tonner | 1,5 t | 2 | 2,5 t |
| 7,5-Tonner | 4,0 t | 3 | 5,5 t |
| 18-Tonner | 8,5 t | 5 | 11,0 t |
| 26-Tonner | 13,0 t | 8 | 17,0 t |
| Sattelzug | 18,0 t | 12 | 24,0 t |
| 40-t-Tautliner | 24,0 t | 0 | 24,0 t |

Die Tabellenwerte sind nach vorhandener Grundkapazität zugeordnet; der zusätzliche 40-t-Tautliner hat bereits 24 t und bleibt dort. Modellnamen, IDs, Leerpreise und Fahrzeugrangboni bleiben bestehen. Alte +1-t-Ausbaustufen werden beim Laden in jeweils zwei +0,5-t-Stufen übertragen, ohne Kapazität zu entziehen oder neue Module einzuziehen. Dadurch kann ein altes Fahrzeug seine neue Modellgrenze überschreiten; diese erworbene Kapazität bleibt erhalten, weitere Ausbauten sind dann gesperrt.

`Tempo = 1 km/s × (1 + 0,005 × Rangstufen) × (1 − 0,01 × tatsächlich geladene Tonnen)`.

Bei Leerfahrt sind 0 t geladen. Der Ladungsabschlag gilt auch für die ursprüngliche Kaufkapazität. Ein 18-t-LKW mit Legendär 10 fährt voll mit **1,025 km/s** und leer mit **1,25 km/s**. Tourdauer, ETA und Gewinn pro Zeit verwenden dasselbe Tempo. Die letzte Teilfracht wird mit ihrer tatsächlichen Tonnenzahl berechnet. Rang ändert weder Vergütung noch Gewinn pro Tour.



## 4. Aufträge

| Auftragsart | Geeignete LKW | Strecke je Tour | Auftragsvolumen |
| --- | --- | ---: | ---: |
| Regionalverkehr | 7,5-Tonner, 18-Tonner und 26-Tonner | 30–100 km einfach | 10–40 t, in ganzen Tonnen |
| Fernverkehr | 26-Tonner, Sattelzug und 40-t-Tautliner | 100–200 km einfach, geografische Ausnahmen unten | 10–50 t, in ganzen Tonnen |

Alle Ziele werden aus den hinterlegten Ortsrouten gewählt. Gibt es im Basisbereich keine passende Route, wird die hinterlegte Strecke mit der geringsten Abweichung gewählt; ihre Kilometerzahl wird nicht verändert. Im Regionalverkehr hat jeder Startort mindestens eine Route im Bereich 30–100 km. Abweichungen im Fernverkehr vom Bereich 100–200 km:

| Startort | Nächstliegende hinterlegte Fernverkehrsroute |
| --- | --- |
| Hamburg | Groningen, Niederlande · 290 km |
| Marseille | Monaco, Monaco · 230 km |
| Hongkong | Móng Cái, Vietnam · 750 km |
| Shanghai | Ulaanbaatar, Mongolei · 2.500 km |
| Tanger | Ceuta, Spanien · 70 km |
| Durban | Maseru, Lesotho · 510 km |
| Los Angeles | Tijuana, Mexiko · 220 km |
| New York | Montréal, Kanada · 600 km |
| Santos | Ciudad del Este, Paraguay · 1.100 km |
| Callao | Guayaquil, Ecuador · 1.100 km |

Alte noch verfügbare Marktangebote außerhalb der neuen Grenzen werden beim Laden ersetzt. Laufende Altaufträge und bereits erhaltene Sonder- oder Empfehlungsfahrten behalten ihre gespeicherten Routen und Mengen und dürfen abgeschlossen werden. Alte verfügbare Stadtangebote werden beim Laden entfernt; laufende und abgeschlossene Stadtaufträge bleiben erhalten.

Die Basiswerte stehen zentral in `TRANSPORT_BASE` in `app.js`. Prämie, Menge und Reichweite lassen sich je Segment getrennt ausbauen. Bei Mengenstufe `S` gilt: `Untergrenze = Basisuntergrenze + floor(S / 2)` und `Obergrenze = Basisobergrenze + S`; die Menge wird in ganzen Tonnen ausgewürfelt. Reichweite erhöht nur die Obergrenze, nie die Mindeststrecke. Die vorhandenen Ortsrouten bleiben maßgeblich; ein Ausbau erfindet keine zusätzliche Route. Privatabholungen behalten ihre eigenen Basiswerte.

| Ausbau | Regionalverkehr | Fernverkehr |
| --- | --- | --- |
| Abschlussprämie | 100 Stufen à +1 Prozentpunkt, maximal +100 % | 100 Stufen à +1 Prozentpunkt, maximal +100 % |
| Auftragsmenge | 50 Stufen: 10–40 t → 35–90 t | 150 Stufen: 10–50 t → 85–200 t |
| Reichweite | 50 Stufen: 30–100 km → 30–150 km | 100 Stufen: 100–200 km → 100–300 km |

Die Basisprämie bleibt **1 M je tatsächlich transportierter Tonne**. Der Firmenbonus erhöht nur diese einmalige Abschlussprämie; Tonnenkilometervergütung, Fahrzeugkosten, Lastkosten und Beute bleiben unverändert.

Die **gemeinsame Auftragsbörse** zeigt ab Spielbeginn **fünf verfügbare Angebote insgesamt**. Jeder neue Platz wird unabhängig mit **80 % Regionalverkehr und 20 % Fernverkehr** besetzt. Die Disposition erweitert die gemeinsame Liste auf bis zu **15 Angebote**. Sobald ein Auftrag zugewiesen wird, wird sein Platz sofort neu ausgewürfelt und aufgefüllt. Die Auftragsseite zeigt nur verfügbare Angebote; Fortschritt laufender Aufträge ist in der Garage sichtbar. Die Liste zeigt die **Frachtvergütung** unabhängig vom LKW; das Zuweisungsfenster zerlegt den Gewinn je passendem LKW.

Pro neuem Angebot im Regionalverkehr oder Fernverkehr besteht unabhängig eine 5-%-Grundchance auf einen bereits freigeschalteten Stammkunden dieses Segments. Eine Liste kann daher auch ganz ohne Kundenauftrag sein. Charakterboni und Boni auf Sonder- und Empfehlungsfahrten bleiben unverändert additiv; die regionalen Expeditions-Fundchancen ändern sich nicht.

Angebote im Regionalverkehr und Fernverkehr haben zusätzlich eine Fahrart: **90 % Single Way** und **10 % Dual Way**. Bei beiden fährt der LKW für jede Ladung zum Ziel und zurück zur Ladestelle. Beim Single Way bleibt die Rückfahrt leer und unbezahlt; beim Dual Way nimmt er am Ziel die gleiche Frachtmenge als Rückfracht mit. Die Strecke im Angebot bezeichnet eine einfache Fahrt. Laufende alte Stadtaufträge behalten ihre direkte Tour ohne Rückfahrt.

Für die Fahrzeit gilt: **Stadtverkehr** `Strecke / Tempo beladen`; **Single Way** `Strecke / Tempo beladen + Strecke / Tempo leer`; **Dual Way** `2 × Strecke / Tempo beladen`. Jede Tour wird einzeln mit ihrer Ladung berechnet, auch wenn das Spiel nach einer Pause mehrere Touren nachholt. Das neue Ladungstempo gilt auch für bereits laufende Aufträge. Es verändert die Fahrzeit, aber nicht die Münzen und XP je abgeschlossener Tour.

**Automatische Aktualisierung:** Alle nicht gehaltenen verfügbaren Angebote sämtlicher Auftragsarten werden **alle 15 Minuten kostenlos** ersetzt. Der nächste Zeitpunkt und ein Countdown stehen im Spielstand und auf der Auftragsseite. Nach einer Spielpause wird beim erneuten Öffnen eine überfällige Aktualisierung ausgeführt; verpasste Intervalle werden nicht einzeln nachgespielt. Erst ein tatsächlich ausgeführter automatischer Angebotswechsel setzt den Zähler für manuelle Aktualisierungen auf null. Bei der einmaligen Migration von der 5-Minuten-Regel wird der gespeicherte nächste Wechsel um 10 Minuten verschoben.

**Manuelle Aktualisierung:** Der Knopf **„Neue Angebote“** ersetzt alle nicht gehaltenen verfügbaren Angebote der gemeinsamen Börse. Der Preis des nächsten Klicks beträgt **250 M × max(1, Anzahl aller eigenen Fahrzeuge) × (1 + Anzahl erfolgreicher manueller Aktualisierungen seit dem letzten automatischen Angebotswechsel)**. Mit fünf Fahrzeugen kosten die ersten drei manuellen Wechsel 1.250 M, 2.500 M und 3.750 M. Der Zähler bleibt im Spielstand erhalten und hat kein Limit. Eine manuelle Aktualisierung verschiebt den automatischen Timer nicht.

In der normalen Auftragsbörse lässt sich **von Beginn an 1 verfügbarer Auftrag halten**, gemeinsam über Regional- und Fernverkehr. Das offene Schloss ganz rechts hält einen Auftrag beim Klick fest und wird geschlossen hervorgehoben. Erneutes Klicken gibt ihn frei. Ist der Platz belegt, bleiben die anderen Schlösser anklickbar und zeigen den Hinweis „Du kannst nur 1 Auftrag halten.“ Gehaltene Angebote belegen weiterhin einen Platz in der gemeinsamen Börse und bleiben bei manuellen sowie automatischen Angebotswechseln mit allen Auftragsdaten unverändert. Bei Zuweisung an einen LKW wird der Halteplatz frei; der Angebotsplatz wird wie üblich aufgefüllt. Die Auswahl bleibt nach Reload bestehen.

## 5. Fahrtzeit, Münzen und XP

- Leer-Tempo: **1 km pro Sekunde** bei Common 0. Der Fahrzeugrang erhöht es gemäß der Formel oben. Beladen sinkt dieses Tempo je tatsächlich geladener Tonne um 1 %, auch bei der Grundkapazität. Tempo kann nicht manuell ausgebaut werden; Kapazität nur über Module in der Garage.
- Dauer einer Stadttour: `Strecke / Tempo beladen`. Single Way: `Strecke / Tempo beladen + Strecke / Tempo leer`. Dual Way: `2 × Strecke / Tempo beladen`. Die Zahlung und der Auftragsfortschritt werden bei den beiden Fernverkehrsarten erst nach der Rückfahrt gebucht; auch nach der letzten Lieferung fährt der LKW zurück.
- Fahrzeugkosten: `gefahrene Kilometer × (Fahrzeugpreis je km − 0,001 × Werkstattstufe)`. Stadtverkehr bezahlt eine Strecke, Single Way und Dual Way bezahlen **Hin- und Rückfahrt**. Die Basispreise je Fahrzeug stehen in der Tabelle oben.
- Lastkosten: `beladene Tonnenkilometer × 0,10 M`. Tatsächlich geladene Tonnen zählen; eine teilweise gefüllte letzte Fahrt kostet entsprechend weniger.
- Frachtvergütung: `beladene Tonnenkilometer × 1,00 M`. Die Fähigkeit **Vergütung** erhöht nur diesen Frachtanteil für Aufträge des jeweiligen Kunden um **0,1 % je Punkt**. Fahrzeugkilometer und Lastkosten bleiben unverändert. Stadtverkehr und Single Way vergüten nur die Hinfracht, Dual Way vergütet Hin- und Rückfracht. Entsprechend zählt die Rückfracht bei Dual Way auch für Tonnen, Tonnenkilometer und Spieler-XP.
- Spieler-XP je abgeschlossener Tour: `tatsächlich transportierte Tonnen`. Bei Single Way zählt die Hinfracht, bei Dual Way die gleich große Hin- und Rückfracht. Eine teilweise beladene letzte Tour gibt nur für ihre tatsächliche Fracht XP. Es gibt weder einen pauschalen Tourbonus noch Abschluss-XP. Stadthub und Expeditionsmissionen geben keine Spieler-XP.
- Transportgewinn: Summe der Vergütungen minus Summe der Betriebskosten. LKW-Käufe mindern das Guthaben zusätzlich.

**Beispiel ohne Werkstattausbau:** Ein Single-Way-Auftrag über **40 t und 46 km** mit einem **4-t-7,5-Tonner** benötigt 10 Hin- und Rückfahrten. Die Frachtvergütung beträgt **1.840 M**, die Fahrzeugkosten **598 M** (10 × 92 km × 0,65 M) und die Lastkosten **184 M**. Das ergibt **1.058 M Transportgewinn**. Die erst nach Auftragsabschluss abholbare Prämie beträgt zusätzlich **40 M**; zusammen sind es **1.098 M**. Münzen werden pro Tour auf zwei Nachkommastellen gerundet. Die Tourbuchung verteilt die Rundungsreste so, dass der Frachtumsatz unabhängig vom gewählten LKW gleich bleibt.

Bereits gebuchte Touren in vorhandenen Spielständen behalten ihre historischen Münzen, XP und Statistikwerte. Für alle künftig abgeschlossenen Touren gilt das neue XP-Modell, auch wenn ihr Auftrag schon läuft. Eine Gewinnvorschau verwendet die aktuelle Werkstattstufe; spätere Änderungen daran ändern noch nicht gebuchte Touren.

Bereits laufende Aufträge im Regionalverkehr eines 3,5-Tonners aus älteren Spielständen dürfen zu Ende gefahren werden. Neue Aufträge im Regionalverkehr können ihm nicht mehr zugewiesen werden.

Nach der letzten Tour eines Auftrags entsteht genau **eine Auftragsprämie**. Der Auftrag erscheint im Dashboard unter „Auftragsprämien“. Ein Klick holt die einzelne Prämie ab; danach verschwindet der Auftrag aus dieser Liste. Mit „Alles sammeln“ erscheint eine Übersicht der Münzen, Zahnräder und Firmenausbau-Items aller derzeit offenen Prämien. Erst „Bestätigen“ schreibt sie gesammelt gut und entfernt die Aufträge aus der Liste. Pro tatsächlich transportierter Tonne gibt es **1 M** zusätzlich (40 t ergeben 40 M; bei Dual Way zählen gleich große Hin- und Rückfrachten, also 80 M). Der segmentspezifische Firmen-Prämienbonus erhöht ausschließlich diese Abschlussprämie. Er verändert weder die Tonnenkilometervergütung noch Fahrzeug- und Lastkosten oder Loot. Diese Münzen werden beim Abholen gutgeschrieben und in der Statistik getrennt vom Tourenertrag erfasst. Jede Prämie kann nur einmal abgeholt werden; ihr Inhalt wird beim Abschluss festgelegt und gespeichert.

Zahnräder werden **einmal je vollständig abgeschlossenem Auftrag** festgelegt und erst beim Abholen der Prämie gutgeschrieben. Einzelne Touren geben keine Zahnräder. Die Basis ist `einfache Strecke in km × Auftragsvolumen in t` (tkm). Dual Way verdoppelt diese Basis nicht. Die Seltenheiten werden unabhängig gewürfelt und parallel gesammelt; es gibt kein Tageslimit. Angefangene Blöcke werden mit ihrem Anteil gewürfelt (z. B. 50 zusätzliche tkm ergeben eine 50-%-Chance auf einen weiteren Common-Wurf). Die tatsächlichen Mengen stehen in der Prämienansicht.

| Seltenheit | Je tkm-Block | 0 Zahnräder | 1 Zahnrad | 2 Zahnräder | Mittelwert je Block |
| --- | ---: | ---: | ---: | ---: | ---: |
| Common | 100 tkm | 40 % | 40 % | 20 % | 0,8 |
| Uncommon | 1.000 tkm | 75 % | 18 % | 7 % | 0,32 |
| Rare, nur Stammkunden | 1.000 tkm | 92 % | 8 % | – | 0,08 |

Sonderfahrten behalten zusätzlich **20 % auf 5–10 Epic**, Empfehlungsfahrten **25 % auf 5–10 Epic sowie 1 Legendär garantiert und 25 % auf ein zweites**. Diese höheren Seltenheiten werden vorläufig nicht neu balanciert; alte Common-, Uncommon- und Rare-Pakete dieser Fahrten werden nicht zusätzlich ausgezahlt. Privatabholungen aus dem Hub geben keine Zahnräder. Normale Stammkundenaufträge erhalten kein Kapazitätsmodul. Alte bereits festgelegte Zahnradfunde bleiben bei der Migration erhalten. Die Vorräte zeigen vorhandene Zahnräder aller fünf Seltenheiten als Item-Karten im Seitenverhältnis 2:3. Dort werden nur Bestände und hergestellte Aufträge verwaltet; Herstellungen finden in Entwicklung statt.

Frühere Laufzeitschätzungen für eine Mischflotte gelten nach der geänderten Fahrzeugzulassung nicht mehr. Sattelzug und Tautliner fahren nur Aufträge im Fernverkehr; eine neue Balancing-Stichprobe für die Zahnradziele steht aus.

## 6. Kunden und Vertrauen

Die fünf Stammkunden erscheinen erst nach Abschluss und Abholung des einmaligen Endlosort-Auftrags ihrer jeweiligen Region in den Stammdaten. Spielerlevel sperrt weder Kunden noch Kundenskills. Neue normale Kundenangebote erscheinen ausschließlich im Regionalverkehr und Fernverkehr; Nordbau kann im Regionalverkehr erscheinen.

| Kunde | Auftragsart | Typische Fracht |
| --- | --- | --- |
| Nordbau GmbH | Regionalverkehr | Baustoffe |
| Frischgut AG | Regionalverkehr | Lebensmittel |
| Stahlwerk West | Regionalverkehr | Stahlträger |
| Alpenhandel KG | Regionalverkehr | Werkzeuge |
| EuroLog SE | Fernverkehr | Maschinenteile |

Bei jedem neu erzeugten Angebot im Regionalverkehr oder Fernverkehr besteht eine unabhängige **5-%-Grundchance** auf einen Kunden der gewählten Auftragsart. Es gibt keinen garantierten Kundenauftrag pro Liste. Bereits vorhandene Angebote bleiben im Spielstand erhalten.

Jeder Kunde beginnt bei **Vertrauenslevel 0**, ohne freie Fähigkeitspunkte. Erst der vollständige Abschluss eines Auftrags dieses Kunden gibt Vertrauen: **+10** für einen normalen Stammkundenauftrag, **+25** für eine Sonderfahrt und **+100** für eine Empfehlungsfahrt. Freie Frachtbörsenaufträge geben keines. Eine Tour allein und das Abholen der Prämie geben kein Vertrauen. Jeder Auftrag wird genau einmal gewertet, auch nach einem Reload.

Für den Aufstieg von Vertrauenslevel `L` auf `L + 1` sind `110 + 10 × L` Vertrauen nötig. Überschuss zählt zur nächsten Stufe. Der erste Aufstieg kostet 110, der zweite 120, der letzte von 149 auf 150 kostet 1.600. **Level 150** ist das Maximum und erfordert insgesamt **128.250 Vertrauen**. Jeder Aufstieg gibt genau **einen Fähigkeitspunkt für diesen Kunden**; danach gibt es keine weiteren Punkte. Bereits gesammelte Kunden-XP aus älteren Spielständen werden als Vertrauen übernommen und nach dieser Kurve neu bewertet. Alte Skillverteilungen werden ohne Doppelzählung als freie, vom neuen Level gedeckte Punkte erstattet; vorhandene Kunden und Aufträge bleiben erhalten.

| Fähigkeit | Wirkung je Punkt | Maximum |
| --- | --- | --- |
| Vergütung | +0,1 % auf den Frachtanteil pro Tonnenkilometer bei normalen, Sonder- und Empfehlungsaufträgen dieses Kunden | 100 Punkte / +10 % |
| Sonderfahrtchance | +0,1 Prozentpunkte auf die Chance nach einem normalen Auftrag dieses Kunden | 25 Punkte / +2,5 Prozentpunkte |
| Empfehlungschance | +0,1 Prozentpunkte auf die Chance nach einer Sonderfahrt dieses Kunden | 25 Punkte / +2,5 Prozentpunkte |

Die Grundchance auf eine Sonderfahrt beträgt im Regionalverkehr 20 % und im Fernverkehr 40 %, mit maximaler Fähigkeit also 22,5 % und 42,5 %. Die Grundchance auf eine Empfehlungsfahrt beträgt im Regionalverkehr 4 % und im Fernverkehr 6 %, maximal 6,5 % und 8,5 %. Diese Boni addieren sich in **Prozentpunkten**. Nur die Fähigkeiten des betreffenden Kunden wirken. Punkte können weder über das freie Budget noch über das jeweilige Maximum hinaus vergeben werden. Es gibt keine Kundenfähigkeit für Spieler-XP, Frachtmenge, Zahnräder oder Kapazitätsmodule.

## 7. Statistik und CO₂

Die Statistik zählt LKW in allen Garagen, abgeschlossene und aktive Aufträge, beendete Touren, gelieferte Tonnen, **alle Fahrkilometer einschließlich Rückfahrten**, Tonnenkilometer beladener Strecken, alle Spieler-XP, Transportertrag, abgeholte Auftragsprämien, Betriebskosten, Transportgewinn, LKW-Käufe, historische Mitarbeitereinstellungen, Abteilungsfreischaltungen, Auftragslisten-, Werkstatt- und Vertriebsausbau, manuelle Angebotswechsel und aktuelles Guthaben. Einmalige Erstattungen für frühere Fahrzeugausbauten, Niederlassungen und Mitarbeitereinstellungen bleiben in der Münzenbilanz sichtbar.

Die CO₂-Anzeige ist eine **grobe Spielschätzung**, keine Messung eines konkreten Fahrzeugs: `beladene Tonnenkilometer × 0,05275 kg CO₂/tkm`. Der Faktor entspricht 52,75 g CO₂/tkm als [EEA-Referenzwert für neue schwere Fahrzeuge](https://climate-energy.eea.europa.eu/topics/transport/emissions-from-heavy-duty-vehicles/intro). Die Rückfracht bei Dual Way zählt mit. Fahrzeugtyp, Fahrweise und leere Rückfahrten werden dafür nicht gesondert berechnet.

## 8. Firma und Abteilungen

Die Firmenansicht zeigt die Abteilungen des Hauptsitzes in kompakten Karten. Über **Ausbauen** öffnet sich ein Fenster, in dem die jeweilige Abteilung freigeschaltet oder ausgebaut wird. Der gewählte Startort bleibt der **Hauptsitz** für die derzeitige Auftragsbörse und Garage. Weitere Niederlassungen können nicht mehr gekauft werden. Ältere Spielstände behalten ihre LKW und laufenden Aufträge. Freigeschaltete Abteilungen werden zusammengeführt; bei Ausbaustufen gilt jeweils der höchste erreichte Wert. Die erfassten Kaufkosten zusätzlicher Niederlassungen werden einmalig erstattet. Verfügbare Angebote früherer Standorte entfallen und die Angebotsliste am Hauptsitz wird aufgefüllt.

**Firmenausbau-Items** stammen aus abgeschlossenen normalen Börsen- und Stammkundenaufträgen einschließlich **hergestellter** normaler Kundenaufträge sowie aus Material-Expeditionsaufträgen. Für Transporte zählt die tatsächlich beladene Strecke: `gelieferte Tonnen × einfache Kilometer × beladene Fahrtrichtungen`. Dual Way zählt Hin- und Rückfracht, eine leere Rückfahrt nicht. Alle berechtigten Transporte nutzen einen **gemeinsamen dauerhaften Fortschrittszähler**: Pro **750.000 beladene Tonnenkilometer** wird genau 1 Item in der Abschlussprämie festgelegt. Der Rest bleibt im Spielstand für spätere Aufträge erhalten; es gibt keinen Restwurf. Die Items werden beim Abholen der Prämie genau einmal gutgeschrieben. Sonder-, Empfehlungs- und Privatabholungen sowie der Stadthub erhöhen den Zähler nicht. Material-Expeditionsaufträge haben beim Abschluss zusätzlich **6 % Chance** auf **1/2/3 Items** auf Stufe 1/2/3. Andere Expeditionsaufträge geben keine Firmenausbau-Items.

Die Firmenausbauten für **Prämie, Menge und Reichweite** haben in Regional- und Fernverkehr jeweils eigene Stufen. Zielstufe `S` kostet **`2 + floor((S − 1) / 10)` Items** und zusätzlich **`10 × S² M`** für Prämie, **`50 × S² M`** für Menge beziehungsweise **`100 × S² M`** für Reichweite. Beide Ressourcen müssen vorliegen und werden zusammen abgebucht. Die bestehenden Wirkungen und Maximalstufen bleiben gleich. Über alle sechs Ausbauzweige ergeben sich **550 Stufen, 3.700 Items und 103.854.500 M**. Die schon bestehenden Ausbauten von Disposition, Werkstatt, Vertrieb und Stadthub behalten ihre bisherige separate Testkurve von `1 + floor((S − 1) / 25)` Items sowie `500 + 50 × S M` dort, wo diese Kurve bisher galt; ihre sonstigen Münz- und Kontaktkosten bleiben unverändert. Die Freischaltung von Abteilungen behält ihre bisherigen einmaligen Münzkosten.

**Balanceeinordnung:** 3.700 Items in rund 18 Monaten entsprechen im Mittel etwa **206 Items pro Monat**, wenn sie überwiegend in diese sechs Firmenausbauten fließen. Ohne Materialfunde wären dafür rund **154,2 Millionen beladene tkm pro Monat** nötig. Bei 432 Expeditionsauslosungen pro 30 Tagen, 75 % Materialaufträgen und 6 % Itemchance ergeben sich je nach regionalem Stufenmix rechnerisch rund **19–46 Material-Items pro Monat**; der verbleibende Bedarf läge grob bei **120–140 Millionen beladenen tkm pro Monat**. Hinzu kommen im Mittel **5,77 Millionen M pro Monat** für die sechs Ausbauzweige. Das ist eine Rechnung für ein sehr aktives Profil mit fortgeschrittenen Auftragsgrößen, keine garantierte Dauer; tatsächliche Fahrleistung, Regionswahl, anderweitiger Itemverbrauch und Münzverdienst bestimmen den Fortschritt.

Alte Spielstände erhalten ihre bereits gekauften Ausbaustufen, LKW, Aufträge und vorhandenen Belohnungen; es werden keine neuen Kosten rückwirkend eingezogen. Frühere vorbereitete Werte für Prämie, Zusatzmenge und Zusatzreichweite werden einmalig in Stufen überführt und auf die neuen Höchstwerte begrenzt. Bei der ursprünglichen Einführung der Items begann der Itembestand bei null. Bereits damals festgelegte Auftragsbelohnungen wurden nicht nachträglich um Items ergänzt.

**Migration auf Spielstandversion 41:** Bereits vorhandene Firmenausbau-Items, gekaufte Stufen, laufende Aufträge und festgelegte offene Prämien bleiben erhalten. Der neue gemeinsame tkm-Restzähler beginnt einmalig bei null. Historische Transporte werden nicht nachberechnet; alte Abschlussprämien erhalten weder nachträgliche Items noch neue tkm. Der Zähler und die neue Prämie eines frisch abgeschlossenen Auftrags werden zusammen gespeichert. Eine bereits abgeholte Prämie und ein bereits abgeschlossener Materialauftrag können dadurch nicht erneut Items buchen.

### Stadthub und Privatabholungen

Es gibt **einen Stadthub** am Hauptsitz. Seine Eröffnung kostet **0 M**. Sprinter und 3,5-Tonner werden getrennt von regulären LKW gezählt. Neu gekaufte Stadttransporter werden direkt im Hub eingesetzt. Stadtfahrzeuge aus alten Spielständen bleiben erhalten und können im Hub eingesetzt werden, sobald ihre alten Aufträge abgeschlossen sind. Ein Hub-Fahrzeug kann nicht gleichzeitig einen Einzelauftrag übernehmen.

Ein Einkaufszyklus dauert **eine Stunde**: 45 Minuten Verteilung, 15 Minuten Pause. Die mögliche Stundenmenge ist die Summe der vollen Touren jedes eingesetzten Fahrzeugs in 45 Minuten. Eine Tour fährt 12 km beladen und 12 km leer; Kapazität, Ladungsabschlag und Fahrzeugrang bestimmen die Fahrzeit. Der Vertrieb kauft auf Stufe 0 **75 %** dieser möglichen Menge ein. Jede seiner **25 Stufen** erhöht die Menge um einen Prozentpunkt bis auf **100 %**. Es wird keine Ware über die abtransportierbare Menge hinaus eingekauft.

Vorläufig gelten **10 M Verkaufserlös** und **3 M Einkaufspreis** je verteilter Tonne. Der stündliche Hub-Ertrag ist damit `verteilte Tonnen × 7 M`. Der Hub erzeugt **keine XP und keine Zahnräder**. Münzen steigen während der **45 Arbeitsminuten laufend** im Kassenbestand; die **8–12 Abholhinweise** eines Zyklus erscheinen über diese Zeit verteilt. Während der 15-minütigen Pause kommt nichts hinzu. Beides kann **jederzeit abgeholt** werden, sobald etwas vorhanden ist. Das Abholen leert nur die Kasse und die Hinweise: Es startet weder Einkauf noch Arbeits- und Pausenrhythmus neu und bereits abgeholter Ertrag wird nicht erneut gebucht. Der Kassenbestand fasst derzeit **6 abgeschlossene Stundenzyklen** seit der letzten Abholung und muss dann abgeholt werden, bevor er weiter wächst. Auf dem Dashboard zeigt eine Karte Münzen, Abholhinweise und die Restzeit bis zur vollen Kasse; dort kann der Ertrag direkt abgeholt werden. Ohne eingesetzten Stadttransporter pausiert die Füllung. Abgeholte Münzen fließen in das Guthaben, abgeholte Hinweise in die Vorräte. Hub-Tonnen und abgeholter Hub-Ertrag erscheinen getrennt in den Statistiken.

In **Entwicklung** lassen sich **100 Abholhinweise zu einer Privatabholung** herstellen. Der hergestellte Auftrag bleibt in den **Vorräten** gespeichert und wird dort einem freien regulären LKW zugewiesen. Beim Abschluss erhält sie keine Zahnräder und kein Kapazitätsmodul, aber garantiert **1 Lieferantenkontakt** und mit vorläufig **20 % Chance** einen zweiten. Die Kontakte werden zusammen mit der Auftragsprämie abgeholt. Unverbrauchte Kontakte bleiben erhalten; weitere Verwendungen können später ergänzt werden.

Für **10 Firmenausbau-Items** lässt sich jederzeit ein normaler Kundenauftrag herstellen, auch ohne vollständig ausgebautes Unternehmen. Der Kunde wird **gleichverteilt** aus allen bereits freigeschalteten Stammkunden gewählt. Ohne freigeschalteten Kunden oder ausreichende Items findet keine Herstellung und kein Verbrauch statt. Der Auftrag nutzt die aktuellen Segment-, Mengen-, Strecken- und Fahrzeugregeln seines Kunden, bleibt in den Vorräten gespeichert und startet erst nach separater LKW-Zuweisung. Er gibt die üblichen Transportmünzen, Spieler-XP, Kundenvertrauen und Chancen auf Sonderfahrten und trägt nach Abschluss wie jeder normale Kundenauftrag zum gemeinsamen tkm-Zähler bei. Seine eigenen tkm können daher erst bei ausreichender Gesamtleistung ein Item erzeugen; die Herstellungskosten werden nicht pauschal zurückgezahlt.

Ein Stadthub-Vertriebsausbau kostet `5 × Zielstufe` **Lieferantenkontakte** sowie Firmenausbau-Items und Münzen nach der obigen Testkurve. Die erste Stufe dauert **12 Stunden**, jede folgende Stufe weitere **12 Stunden** länger: Stufe 2 dauert 24 Stunden, Stufe 25 dauert 300 Stunden. Während des Baus läuft der Hub normal weiter. Der höhere Einkaufswert gilt erst nach Abschluss und ab dem nächsten Einkaufszyklus.

| Abteilung | Geplante Aufgabe | Aktueller Status |
| --- | --- | --- |
| Buchhaltung | Finanzen und Abrechnungen | Gesperrt |
| Personalabteilung | Spätere Neugestaltung | Vorläufig keine Freischaltung oder Einstellung; bestehende Freischaltungen bleiben gespeichert |
| Disposition | Mehr Plätze in der gemeinsamen Auftragsbörse | Für 5.000 M freischaltbar |
| Werkstatt | Betriebskosten der LKW senken | Für 5.000 M freischaltbar |
| Fuhrpark | Spätere Verwaltung und Entwicklung des Fuhrparks | Gesperrt; Funktion und Freischaltung folgen |
| Lager | Spätere Verwaltung von Materialien und Gegenständen | Gesperrt; Funktion und Freischaltung folgen |
| Vertrieb & Kundenbetreuung | Zusätzliche Halteplätze für verfügbare Aufträge; später ggf. kürzerer Angebots-Timer und geringere manuelle Kosten | Für 5.000 M freischaltbar |

**Disposition, Werkstatt und Vertrieb kosten jeweils einmalig 5.000 M.** Buchhaltung, Fuhrpark und Lager bleiben bis zur Festlegung ihrer Funktionen gesperrt.

Die **Personalabteilung** ist bis zu ihrer Neugestaltung pausiert. Neue Einstellungen und Freischaltungen sind gesperrt. Vorhandene bezahlte Einstellungen werden beim Laden eines alten Spielstands einmalig erstattet; die Erstattung erscheint in der Münzenbilanz. Frühere Mitarbeitende geben weder LKW-Plätze noch einen Aufschlag auf Kilometerkosten. Bereits freigeschaltete Personalabteilungen bleiben als Fortschritt gespeichert. Das neue Navigationsmodul **Personal** ist unabhängig davon: Es zeigt eine Kartensammlung mit drei ausdrücklich als Beispiele markierten Figuren und genau fünf vorbereiteten Plätzen im Führungsteam. Erwerb, Aktivierung, Duplikat-Level und Bonuswirkungen sind noch nicht eingebaut.

Der **Vertrieb** startet nach der Freischaltung auf Stufe 0. Seine drei vorhandenen Ausbaustufen erhöhen die Zahl gleichzeitig haltbarer Aufträge vom kostenlosen Grundplatz auf **2, 3 oder 4**. Bereits gekaufte Stufen bleiben erhalten und zählen jeweils als zusätzlicher Platz. Die Stufen kosten **500 M**, **1.000 M** und **1.500 M**, jeweils zuzüglich **1 Firmenausbau-Item**. Das Limit gilt über Regionalverkehr und Fernverkehr zusammen. Die Funktion nutzt weiterhin den gespeicherten Pin-Zustand; es gibt kein zweites Haltesystem.

Nach der Freischaltung der Disposition kann die gemeinsame Auftragsbörse von **Stufe 0 bis Stufe 10** ausgebaut werden. Jede Stufe fügt **einen dauerhaft verfügbaren Platz** hinzu. Die Anzahl lautet `5 + Ausbaustufe`, also höchstens **15 Angebote insgesamt**. Beim Kauf wird der neue Platz sofort ausgewürfelt und aufgefüllt. Bisher getrennt gekaufte Stufen für Regionalverkehr und Fernverkehr werden beim Laden **addiert**; der gekaufte Ausbau geht nicht verloren.

| Nächste Stufe | Münzkosten (zusätzlich 1 Item) | Angebote insgesamt danach |
| ---: | ---: | ---: |
| 1 | 500 M | 6 |
| 2 | 1.000 M | 7 |
| 3 | 1.500 M | 8 |
| 4 | 2.000 M | 9 |
| 5 | 2.500 M | 10 |
| 6–10 | 3.000–5.000 M, je Stufe +500 M | 11–15 |

Die **Werkstatt** hat **50 Ausbaustufen**. Jede Stufe senkt den Fahrzeugpreis aller LKW um **0,001 M/km**. Der Satz lautet `Fahrzeuggrundpreis − 0,001 × Werkstattstufe M/km`. Auf Stufe 50 spart jeder LKW **0,05 M je gefahrenem Kilometer**; die Lastkosten und Frachtvergütung bleiben gleich. Der jeweils aktuelle Satz gilt beim Abschluss einer Tour; die Gewinnvorschau im Zuweisungsfenster sowie die Garagentabelle und Fahrzeugdetails zeigen diesen Satz. Bereits gebuchte Touren werden nicht rückwirkend geändert.

Die Werkstatt schaltet keine Tempo- oder Kapazitätsausbauten frei; Kapazität wird ausschließlich mit Modulen im Fahrzeugdetail erhöht. Bei älteren Spielständen entfallen gespeicherte manuelle Fahrzeugausbauten und ihre Werkstattfreigaben. Die dafür erfassten Münzausgaben werden einmalig erstattet. Fahrzeugkapazitäten entsprechen danach wieder der jeweiligen Grundklasse; neue Modulausbauten werden getrennt gespeichert. Vorhandene Fahrzeugränge und laufende Aufträge bleiben erhalten; laufende Aufträge verwenden das aktuelle Tempo und die Grundkapazität.

Die Münzkosten steigen in Fünfergruppen. Damit kosten fünf neue Stufen zusammen so viel wie eine Stufe im bisherigen 10-Stufen-System. Für die nächste Stufe `n` gilt: `100 × aufrunden(n / 5) M`; hinzu kommen **1 Item** bis Stufe 25 und **2 Items** ab Stufe 26.

| Werkstattstufen | Kosten je Stufe | Rabatt je km am Gruppenende |
| ---: | ---: | ---: |
| 1–5 | 100 M | 0,005 M |
| 6–10 | 200 M | 0,010 M |
| 11–15 | 300 M | 0,015 M |
| 16–20 | 400 M | 0,020 M |
| 21–25 | 500 M | 0,025 M |
| 26–30 | 600 M | 0,030 M |
| 31–35 | 700 M | 0,035 M |
| 36–40 | 800 M | 0,040 M |
| 41–45 | 900 M | 0,045 M |
| 46–50 | 1.000 M | 0,050 M |

Alte Werkstattstufen werden beim Laden mit fünf multipliziert: Bisherige Stufe 2 wird beispielsweise zu Stufe 10. Der erreichte Rabatt und bereits gezahlte Münzen bleiben erhalten.

Für **Vertrieb & Kundenbetreuung** ist zusätzlich vorgemerkt, die Wartezeit der automatischen Aktualisierung und die Kosten manueller Angebotswechsel später zu senken. Die genaue Ausbauform ist noch offen; derzeit gelten fest 15 Minuten und die oben beschriebene Preisstaffel.

## 9. Noch nicht umgesetzt

- Weitere Materialien und Items für **Vorräte** sowie zusätzliche Wirkungen der Fahrzeugstufen.
- Freischaltregeln und aktive Funktionen der übrigen Abteilungen; eine spätere Mitarbeiterverwaltung.
- Online-Konten, Firebase Auth, gemeinsame Datenbank und öffentliche Domain. Das Spiel läuft derzeit lokal im Browser.





## Sonderfahrten und Empfehlungsfahrten

Ein abgeschlossener normaler Stammkundenauftrag vergibt mit **20 % im Regionalverkehr** oder **40 % im Fernverkehr**, zuzüglich der kundenbezogenen Fähigkeit, eine sammelbare Sonderfahrt für genau diesen Kunden. Normale Kundenaufträge geben keine Kapazitätsmodule. Route, Frachtmenge, Fahrart, Kunde und Segment werden beim Erhalt der Sonderfahrt fest ausgewürfelt und gespeichert. Sonderfahrten laufen nicht ab. Sie starten erst nach bewusster Auswahl eines geeigneten freien LKW im Navigationsmodul **Sonderfahrten**. In dessen Hauptliste steht **Empfehlungsaufträge** mit der Zahl aller offenen Empfehlungsfahrten zuerst; danach folgen die Stammkunden mit ihren offenen Sonderfahrten. Die jeweilige Unterseite zeigt offene, laufende und abgeschlossene Fahrten sowie ihren Fortschritt und ihre Prämie. Für Transport, Hin- und Rückfahrt, Kosten, Vergütung und Freigabe des LKW gelten die normalen Regeln.

Beim Abschluss einer Sonderfahrt werden zwei unabhängige Chancen einmalig ausgewürfelt: Im Regionalverkehr **8 % Kapazitätsmodul** und **4 % Empfehlungsfahrt**, im Fernverkehr **12 % Kapazitätsmodul** und **6 % Empfehlungsfahrt**. Die kundenbezogene Fähigkeit erhöht nur die Empfehlungschance. Empfehlungsfahrten werden für denselben Kunden und dasselbe Segment mit festen Auftragsdaten gespeichert und später bewusst gestartet. Sie erzeugen keine weiteren Empfehlungsfahrten. Ihre vorläufige Modulchance beträgt **20 % im Regionalverkehr** und **30 % im Fernverkehr**. Die Grundwerte stehen zentral in `SPECIAL_CHANCES` in `app.js`. Modulbeute und die bestehende Auftragsprämie werden beim Abschluss festgelegt, nach dem Abholen gutgeschrieben und können auch nach Reload nur einmal abgeholt werden.

Die **Vorräte** zeigen Kapazitätsmodule. Im Garagen-Fahrzeugdetail stehen aktuelle und maximale Ausbaustufe, aktuelle und maximale Kapazität sowie **1 Kapazitätsmodul für die nächste Stufe**. Alte Spielstände behalten LKW, IDs, laufende Aufträge und bereits erworbene Kapazität; neue Modulstände beginnen bei null.

## Fahrzeugverkauf

In der Garage lassen sich freie Fahrzeuge ohne laufenden Auftrag nach einer gesonderten Bestätigung verkaufen. Mindestens ein regulärer Auftrags-LKW muss im Fuhrpark bleiben; Stadttransporter können vollständig verkauft werden. Ein dem Stadthub zugeteilter Stadttransporter darf verkauft werden, sofern er keinen Einzelauftrag fährt. Der Fahrzeugplatz wird frei.

Der Münzerlös beträgt bei 0 gefahrenen Kilometern 95 % des maßgeblichen Kaufpreises. Der Satz sinkt linear um 80 Prozentpunkte bis 500.000 km auf 15 % und bleibt danach bei 15 %. Gezählt werden die Kilometer des konkreten Fahrzeugs für jede abgeschlossene Tour, einschließlich der Rückfahrt bei Single Way und Dual Way. Der Erlös wird auf zwei Nachkommastellen gerundet. Für gekaufte Fahrzeuge gilt der beim Kauf tatsächlich gezahlte Preis, für beide kostenlosen Start-LKW der jeweils aktuelle 7,5-Tonner-Modellpreis. Jeder der beiden Starter kann verkauft werden, solange mindestens ein regulärer Auftrags-LKW bleibt. Bei alten Spielständen ohne historischen Einzelpreis wird für gekaufte Fahrzeuge der bisherige Modellpreis bei der Migration festgehalten; spätere Händlerpreise ändern ihn nicht.

Je Seltenheit werden zunächst alle Zahnräder der erreichten Rangstufen addiert. Davon werden einmalig 50 % berechnet und auf ganze Zahnräder **abgerundet**. Es gibt keinen zusätzlichen Rangbonus in Münzen. Eingebaute Kapazitätsmodule gehen endgültig verloren: Neue Stufen kosten jeweils 1 Modul; für alte Stufen bleibt der tatsächlich historische Einsatz von 1 beziehungsweise insgesamt 4 Modulen erfasst. Der Verkaufsdialog zeigt Münzen, Zahnräder jeder Seltenheit und verlorene Module vor der endgültigen Bestätigung. Ein neu gekauftes Fahrzeug beginnt wieder bei Rangstufe 0.

Fahrzeugdetails zeigen gefahrene Kilometer sowie abgeschlossene Touren und Aufträge. Bei älteren Spielständen werden diese Werte aus den noch vorhandenen, dem Fahrzeug zugeordneten Aufträgen soweit möglich rekonstruiert. Bereits entfernte Aufträge und frühere pauschale Stadthub-Leistung lassen sich keinem einzelnen Fahrzeug zuverlässig zuordnen und erscheinen daher nicht in dessen Zähler. Neue, im Stadthub vollendete Hin- und Rückfahrten zählen je Fahrzeug mit 24 km als Tour; sie zählen nicht als abgeschlossene Einzelaufträge.

## Expeditionen und Führungsteam

Diese Mechanik ist bewusst ohne feste Welt oder Zeitepoche angelegt. Fünf Regionen enthalten je sieben Orte, einen einmaligen Transportauftrag am Endlosort und wiederholbare Expeditionen. Die nächste Region öffnet sich, sobald der Endlosort der vorherigen Region freigelegt wurde.

- Start: 50 Expeditionspunkte. Unter der aktuellen Kapazität regeneriert sich 1 Punkt je 20 Minuten. Über der Kapazität pausiert die Regeneration. Jeder neu erreichte Spielerlevel gibt sofort 50 Punkte, auch über die Kapazität hinaus.
- Orte werden der Reihe nach für Expeditionspunkte entdeckt. Die Kosten je Ort betragen `3 + 9 × Regionsindex + abrunden(Ortsindex / 2)`; beide Indizes beginnen bei null. Region 2 benötigt damit insgesamt 93 Punkte für ihre Orte. Die sieben optionalen Ortsmissionen können jeweils von einem freien regulären LKW gefahren werden. Ihre Belohnung wird nach Abschluss abgeholt und erhöht dann einmalig die maximale Expeditionskapazität um 1. Ihre Erledigung ist keine Voraussetzung für weitere Entdeckungen.
- Beim Freilegen des siebten Ortes öffnen sich sofort der Endlosort, die nächste Region und die wiederholbaren Expeditionen. Einmalig wird 1 Kapazitätsmodul direkt vergeben. Am Endlosort steht zusätzlich ein einmaliger LKW-Transportauftrag ohne Expeditionspunktekosten bereit. Der zugehörige Stammkunde wird erst nach dessen Abschluss und Abholung freigeschaltet. **Region abgeschlossen** gilt erst, wenn alle sieben Orte entdeckt, alle sieben Ortsmissionen abgeschlossen und ihre Kapazitätsbelohnungen abgeholt, das Modul vergeben sowie der einmalige Endlosort-Transportauftrag abgeschlossen und abgeholt sind. Wiederholbare Aufträge zählen dabei nicht.
- Der Button **Endlosexpedition öffnen** zeigt ein Modal mit Punktestand, Fundchancen und regionalen Auftragsstufen. **Expedition starten · 5 Punkte** gibt in den Regionen 1–3 mit 2 % Chance direkt den regionalen Charakter (bei erneutem Fund genau 1 universellen Shard seiner Seltenheit). Sonst entsteht gemäß Auftragspool ein Charakterauftrag (20 %), Materialauftrag (75 %), Sonderfahrtauftrag (4,5 %) oder Empfehlungsauftrag (0,5 %). Diese Poolchancen gelten in Regionen 1–3 bedingt auf die verbleibenden 98 % der Auslosungen. In Regionen 4–5 gibt es keinen direkten Figurenfund; alle Auslosungen verwenden den Auftragspool. Charakter- und Materialaufträge bleiben bis zur separaten LKW-Zuweisung gespeichert und können mit verschiedenen LKW parallel gefahren werden. Sie stehen im eigenen Reiter **Expeditionsaufträge** mit drei Stufenspalten und einer Zeile je Auftragsart. Sonderfahrten und Empfehlungsaufträge landen sofort in der bestehenden Sonderfahrtenliste und werden dort einem passenden LKW zugewiesen.
- Die Stufenverteilung für Charakter- und Materialaufträge ist je Region ein vorläufiger Balancingwert: Region 1 = 100 % Stufe 1; Region 2 = 75 % Stufe 1 und 25 % Stufe 2; Region 3 = je 50 % Stufe 1 und 2; Region 4 = 25/50/25 % für Stufe 1/2/3; Region 5 = 10/45/45 % für Stufe 1/2/3.
- Charakteraufträge geben einen universellen Shard plus einen weiteren mit 20 % Grundchance; der aktive Shardbonus bleibt additiv auf diese Zusatzchance. Zusätzlich geben sie einen zweiten garantierten universellen Shard. In Regionen 1–3 besteht auf die regionale Figur eine Kartenchance von 35/20/12 %. Ein Duplikat dieser Figur gibt genau 1 universellen Shard ihrer Seltenheit. In Regionen 4–5 findet kein Figurenwurf statt. Materialaufträge geben 15 M je Regionsstufe, **6 % Chance auf 1/2/3 Firmenausbau-Items nach Auftragsstufe** und mit 20 % Grundchance ein oder mit Zusatzchance zwei universelle Shards oder ein Kapazitätsmodul (0,3 %). Charakteraufträge geben zusätzlich 5 M je Regionsstufe. Jede Shardrolle verwendet den gespeicherten Auftragsrang und dessen Pool. Die Beute wird beim Abschluss gespeichert und nur einmal vergeben.
- Als Testwerte dauern Ortsmissionen `2 + 8 × Regionsindex + 3 × Ortsindex` Stunden und einmalige Endlosort-Transportaufträge `8 + 40 × Regionsindex` Stunden. Ein aktiver Logistiker verkürzt diese Dauer beim Start. Region 1 ist binnen 1–2 Tagen erreichbar; Region 2 dauert ohne Level-Refills ungefähr 3–5 Tage. Diese Werte sind Balancingparameter.
- Ausgeloste Charakter- und Materialaufträge fahren mit der regulären Geschwindigkeitsformel: Stufe 1 benötigt 20 t, Stufe 2 40 t und Stufe 3 60 t. Je Tour fährt der LKW 30 km beladen hin und 30 km leer zurück. Die nächste Ladung beginnt nach der Rückfahrt; der Auftrag endet nach der letzten Rückfahrt. Kapazität, Fahrzeugrang, Ladungsabschlag und der aktive Logistiker beeinflussen die Fahrzeit. Ein 4-t-LKW auf Common 0 ohne Charakterbonus benötigt ungefähr 5:06, 10:13 beziehungsweise 15:19 Minuten. Menge, Touren, Fortschritt und Restzeit werden angezeigt und nach Offline-Zeit nachberechnet. Diese Fahrten geben außer der bestehenden Expeditionsbeute keine normale Frachtvergütung oder XP. Ihre Fundchancen, Beute, Punktekosten und Ortsmissionen bleiben unverändert. Aus Expeditionen erhaltene reguläre Sonder- und Empfehlungsfahrten verwenden die aktuellen Basiswerte ihres Segments im Regionalverkehr oder Fernverkehr.
- Die fünf regionalen Standardcharaktere besitzen weiterhin unterschiedliche Boni für Regeneration, maximale Kapazität, Shardchance, Expeditionsdauer und Charakter-Fundchance. Nur die fünf besetzten Sitze wirken. Neue Figuren starten auf Level 1; Maximum ist Level 10. Für Ziellevel 2–10 werden **1, 2, 4, 8, 16, 32, 64, 128, 256** universelle Shards der **eigenen Seltenheit** benötigt, insgesamt 511 je Figur. Shards lassen sich einzeln oder nur bis zum nächsten Level einzahlen; der Fortschritt bleibt gespeichert. Im Modul **Entwicklung** ergeben zehn universelle Shards einen der nächsthöheren Seltenheit; es gibt keine Rückumwandlung. Dieses 10:1-Verhältnis ist ein zentral konfigurierter Testwert.

### Shard-Fundraten und offene Figurenquellen

Die folgenden Pools sind zentrale **Testwerte** je Auftragsstufe. Die Angabe ist die Chance **pro einzelner Shardrolle**, nicht pro Auslosung. Die Stufenverteilung steht oben; Stufe 1 enthält weder Epic noch Legendary, Stufe 2 enthält Epic und Stufe 3 zusätzlich Legendary.

| Stufe | Common | Uncommon | Rare | Epic | Legendary |
|---|---:|---:|---:|---:|---:|
| 1 | 58 % | 32 % | 10 % | 0 % | 0 % |
| 2 | 37 % | 31 % | 24 % | 8 % | 0 % |
| 3 | 29 % | 25 % | 23 % | 17 % | 6 % |

Bei lückenloser natürlicher Regeneration entstehen `30 Tage × 24 h × 3 Punkte/h ÷ 5 Punkte = 432` Auslosungen pro 30 Tagen. Das setzt voraus, dass keine Punkte für Ortsfreilegungen ausgegeben werden und die Aufträge tatsächlich gefahren werden. Level-Refills, Regenerationsbonus und liegen gelassene volle Vorräte verändern die Zahl. Für die Rechnung bleiben Figurenboni aus. Je Charakterauftrag werden im Mittel 2,2 Shards gewürfelt; je Materialauftrag 0,24. Es ergeben sich in den Regionen 1–3 wegen der 2-%-Direktchance etwa 262,5 Shardrollen, in Regionen 4–5 etwa 267,8 Rollen monatlich. Die Zahlen sind **alternative Szenarien**, wenn alle Auslosungen in der genannten Region stattfinden:

| Region | Common direkt | Uncommon direkt | Rare direkt | Epic direkt | Legendary direkt | Kartenfunde, erster Fund eingeschlossen |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 152,2 | 84,0 | 26,2 | 0 | 0 | 38,3 Common |
| 2 | 138,5 | 83,3 | 35,4 | 5,2 | 0 | 25,6 Uncommon |
| 3 | 124,7 | 82,7 | 44,6 | 10,5 | 0 | 18,8 Rare |
| 4 | 107,8 | 79,7 | 54,2 | 22,1 | 4,0 | keine |
| 5 | 95,1 | 76,1 | 59,3 | 30,1 | 7,2 | keine |

Nach dem ersten Kartenfund werden weitere Funde in Regionen 1–3 zu je **einem** Duplikat-Shard der Figurenseltenheit: im obigen Szenario ungefähr 37,3 Common, 24,6 Uncommon bzw. 17,8 Rare zusätzlich, falls die Figur früh freigeschaltet wurde. Diese Duplikate sind **nicht** in den Spalten „direkt“ enthalten. Der Legendary-Testwert von 7 Shards pro Monat wird bei konzentriertem Spiel in Region 5 mit 7,2 direkten Shards annähernd erreicht. Die vorgeschlagenen Ziele Common 150, Uncommon 100, Rare 50 und Epic 30 werden je nach Regionswahl teils unter- oder überschritten; sie sind keine monatlichen Gutschriften und nicht gleichzeitig garantiert.

Umwandlungen sind ebenfalls **nicht** in der Tabelle enthalten: 10 verbrauchte Common ergeben 1 Uncommon, 10 Uncommon ergeben 1 Rare usw. Beispiel: Wer 100 Common in 10 Uncommon umwandelt, hat 100 Common weniger und 10 Uncommon mehr; dieselben 100 dürfen nicht in beiden Zuflüssen gezählt werden. Epic- und Legendary-**Shards** stammen aus Aufträgen der Stufen 2 bzw. 3. Für die Epic- und Legendary-**Figuren selbst** gibt es nach dem Deaktivieren der regionalen Kartenfunde derzeit keinen neuen Herkunftsweg. Ihre vorhandenen Exemplare bleiben erhalten; neue Figurenquellen sind offen.

**Migration auf Spielstandversion 40:** Alte Level bleiben. Ein alter Teilfortschritt wird als Anteil der alten Kosten für das nächste Level auf die neue Ziellevel-Kostenzahl übertragen und auf drei Nachkommastellen gerundet. Nicht eingesetzte alte Shards waren nach Ziellevel sortiert und daher nicht eins zu eins mit einer Figurenseltenheit vergleichbar. Jeder alte Vorrat wird als eindeutig nachvollziehbarer Näherungswert auf die gleichnamige neue Seltenheit abgebildet. Der Faktor ist `511 ÷ (45 × alter Seltenheitsfaktor)`, weil die alten Vollausbaukosten 45 × 5/10/20/30/40 Shards betrugen. Alte figurgebundene Shards werden mit demselben Faktor **einmal** dem universellen Vorrat ihrer Figurenseltenheit zugeschlagen. Beide Mengen werden getrennt gerundet; ein positiver Altbestand ergibt mindestens einen neuen Shard. Die alten Vorräte und figurgebundenen Shards werden danach entfernt. Die Migration läuft nur einmal und bucht weder alte Missionsbeute noch Kartenfunde erneut.

Die regionalen Namen, Chancen und Dauern sind vorläufige Testwerte. Einmalige Belohnungen und Abholungen werden gespeichert und können nicht doppelt vergeben werden. Bereits vorhandene Spielstände behalten ihre Aufträge, LKW und Kundenbeziehungen; Kunden mit vorhandenen Aufträgen oder Vertrauen bleiben freigeschaltet. Bereits früher abgeschlossene Großaufträge gelten als abgeholte einmalige Endlosort-Aufträge.
