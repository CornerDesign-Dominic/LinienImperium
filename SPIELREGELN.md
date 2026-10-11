# Frachtwerk – feste Spielregeln

Diese Datei beschreibt die **aktuell implementierten Werte und Freischaltungen** der lokalen Spielversion. `M` bedeutet Münzen, `t` Tonnen und `XP` Erfahrungspunkte.

## 1. Start und Ablauf

- Vor einem neuen Spielstand wählt der Spieler **einen festen Hauptsitz**. Danach beginnt er auf **Spielerlevel 1** mit **1.000 M Startguthaben**, einem kostenlosen **4-t-Allrounder** und je fünf landesweiten und internationalen Angeboten. Der erste selbst gekaufte LKW erhält die Nummer 02. Den Stadthub eröffnet man kostenlos; anschließend kann der erste Stadttransporter gekauft werden. Bestehende Spielstände behalten Guthaben, Fahrzeuge und laufende Aufträge.
- Auf dem Dashboard gibt es vorübergehend den Knopf **„+50.000 M (Test)“**. Jeder Klick schreibt dem aktuellen Spielstand 50.000 M gut. Die Gutschrift bleibt nach dem Neuladen erhalten und wird in der Münzenbilanz getrennt vom Transportertrag als „Testmünzen“ ausgewiesen.
- Ein freier LKW kann genau einen verfügbaren Auftrag übernehmen. Ein Auftrag hat genau einen zugewiesenen LKW.
- Pro Tour transportiert der LKW höchstens seine aktuelle Kapazität. Die nötigen Touren sind `aufrunden(Restvolumen / Kapazität)`.
- Das Fahrtempo hängt von der tatsächlichen Ladung jeder Tour ab. Jede geladene Tonne senkt das Tempo um 1 %; das gilt auch für die Grundkapazität direkt nach dem Kauf. Eine nur teilweise beladene letzte Tour ist entsprechend schneller.
- Nach jeder abgeschlossenen Tour werden die transportierten Tonnen, Münzen und XP gebucht. Bei landesweiten und internationalen Aufträgen endet eine Tour erst nach Hin- und Rückfahrt. Die nächste Tour beginnt automatisch.
- Sobald das gesamte Auftragsvolumen geliefert ist, wird der Auftrag abgeschlossen und der LKW wieder frei. Ohne neuen Auftrag fährt und verdient er nicht weiter.
- Der Spielstand liegt lokal im Browser (`localStorage`). Beim erneuten Öffnen werden inzwischen fällige Touren nachberechnet. Konten und Firebase sind noch nicht eingebaut.
- Die Firma startet ohne freigeschaltete Abteilungen und ohne Mitarbeitende. Das spätere Führungsteam im Modul „Personal“ hat fünf Kartenplätze; der Spieler belegt keinen davon.

### Startorte und Auftragsumgebung

Jeder mögliche Startort hat nahe Ziele innerhalb seines Landes und Ziele in anderen Ländern seiner Region. Alle Angebote starten am gewählten Hauptsitz. Stadtverkehr läuft im Stadthub ohne einzelne Auftragsangebote. Für Landes- und internationale Aufträge wählt das Spiel eine Route aus der jeweiligen Ortsliste; die Entfernung schwankt um höchstens 5 % um den hinterlegten Spielwert. Es werden keine Schiffsfahrten simuliert. Die Ortslisten und Kilometerwerte stehen in `app.js` unter `START_CITIES`.

| Kontinent | Wählbare Startorte |
| --- | --- |
| Europa | Antwerpen (Belgien), Hamburg (Deutschland), Marseille (Frankreich) |
| Asien | Ho-Chi-Minh-Stadt (Vietnam), Hongkong (China), Shanghai (China) |
| Afrika | Tanger (Marokko), Durban (Südafrika) |
| Nordamerika | Los Angeles und New York (USA) |
| Südamerika | Santos (Brasilien), Callao (Peru) |

Antwerpen und Rotterdam wurden wegen ihrer räumlichen Nähe nicht beide als Startorte aufgenommen. Bestehende Aufträge aus älteren Spielständen behalten ihre ursprünglichen Orte und werden nicht umgeschrieben. Beim Zurücksetzen des Spielstands erscheint die Startortwahl erneut.

## 2. Spielerlevel und Kunden

Für den Aufstieg von Level `L` auf `L + 1` werden `100 × L` weitere Spieler-XP benötigt. Die Tabelle zeigt die **insgesamt** nötigen XP seit Spielbeginn.

| Erreichtes Level | Gesamt-XP |
| ---: | ---: |
| 1 | 0 |
| 3 | 300 |
| 7 | 2.100 |
| 10 | 4.500 |
| 12 | 6.600 |
| 17 | 13.600 |

Landesweite und internationale Aufträge sind von Anfang an verfügbar. Stammkunden sind ohne Spielerlevel-Sperre verfügbar.

## 3. LKW und erlaubte Auftragsarten

| LKW | Grundkapazität | Fahrzeugpreis je km | Kaufpreis | Erlaubte Aufträge |
| --- | ---: | ---: | ---: | --- |
| Kleintransporter | 1 t | 0,20 M | 450 M | Stadthub |
| Stadtlaster | 1,5 t | 0,50 M | 900 M | Stadthub |
| Allrounder | 4 t | 0,65 M | 1.600 M | Landesweit |
| Fernlaster | 8,5 t | 0,70 M | 2.600 M | Landesweit und International |
| Schwerlaster | 18 t | 1,60 M | 4.000 M | Landesweit und International |

Die Auftragsart wird anhand der **Fahrzeugklasse** geprüft. Die Kapazität ist je Fahrzeugklasse fest. Alle Fahrzeugtypen und Auftragsarten sind unabhängig vom Spielerlevel verfügbar. Für einen Kauf sind genügend Münzen und ein freier LKW-Platz erforderlich; für die Zuweisung ein geeigneter freier LKW.

Die Seite **Garage** zeigt zwei Tabellen übereinander: oben Allrounder, Fernlaster und Schwerlaster für landesweite und internationale Transporte, darunter Kleintransporter und Stadtlaster für den Stadthub. Bei laufenden Aufträgen zählt dort die Restzeit bis zum Abschluss des gesamten Auftrags herunter. Ein Klick auf eine Fahrzeugzeile öffnet die Details mit Auftrag, Status und Fahrzeugrang. Der **Händler** zeigt zwei Bereiche: Stadttransporter (Kleintransporter und Stadtlaster) sowie Langstreckentransporter (Allrounder, Fernlaster und Schwerlaster).

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

Für reguläre LKW stehen auf Level 1 **5 globale Kaufplätze** bereit. Auf Level 5, 10, 15 und jedem weiteren durch 5 teilbaren Level kommt ein Platz hinzu: `5 + abrunden(Spielerlevel / 5)`. Auf Level 100 sind es genau **25 Plätze**. Stadttransporter haben ein getrenntes Limit von `max(1, abrunden(Spielerlevel × 0,75))`; auf Level 100 sind es **75**. Vorhandene Fahrzeuge aus alten Spielständen bleiben erhalten. Die **Disposition erweitert nur die landesweiten und internationalen Auftragslisten**.

### Tempo und Kapazitätsmodule

Tempo kann nicht manuell ausgebaut werden; nur der Fahrzeugrang erhöht das Basistempo. Jeder LKW kann mit Kapazitätsmodulen zweimal um je 1 t über seinen Modellwert hinaus ausgebaut werden. Die erste Stufe kostet 1 Modul, die zweite 3 Module. Module liegen in den Vorräten und werden in der Garage verbraucht; ein direkter Münzkauf ist nicht möglich.

`Tempo = 1 km/s × (1 + 0,005 × Rangstufen) × (1 − 0,01 × tatsächlich geladene Tonnen)`.

Bei Leerfahrt sind 0 t geladen. Der Ladungsabschlag gilt auch für die ursprüngliche Kaufkapazität. Ein 18-t-LKW mit Legendär 10 fährt voll mit **1,025 km/s** und leer mit **1,25 km/s**. Tourdauer, ETA und Gewinn pro Zeit verwenden dasselbe Tempo. Die letzte Teilfracht wird mit ihrer tatsächlichen Tonnenzahl berechnet. Rang ändert weder Vergütung noch Gewinn pro Tour.



## 4. Aufträge

| Auftragsart | Geeignete LKW | Strecke je Tour | Auftragsvolumen |
| --- | --- | ---: | ---: |
| Landesweit | Allrounder, Fernlaster und Schwerlaster | abhängig vom Startort und regionalen Ziel | 40–150 t, in 10-t-Schritten |
| International | Fernlaster und Schwerlaster | abhängig vom Startort und Auslandsziel | 60–220 t, in 10-t-Schritten |

Nationale und internationale Strecken können je nach Startort deutlich länger sein; internationale LKW-Routen von Shanghai, Santos und Callao sind wegen ihrer Lage weit. Alte verfügbare Stadtangebote werden beim Laden entfernt; laufende und abgeschlossene Stadtaufträge bleiben erhalten.

Es gibt die Angebotsseiten **Landesweit** und **International**. Beide sind ab Spielbeginn offen und zeigen je **fünf verfügbare Angebote**. Die Disposition kann diese Zahl je Auftragsart auf **bis zu zehn** erhöhen. Sobald ein Auftrag zugewiesen wird, erscheint auf derselben Seite ein neues Angebot. Die Auftragsseite zeigt nur verfügbare Angebote; Fortschritt laufender Aufträge ist in der Garage sichtbar. Die Liste zeigt die **Frachtvergütung** unabhängig vom LKW; das Zuweisungsfenster zerlegt den Gewinn je passendem LKW.

Neue Angebote werden zufällig innerhalb der jeweiligen Auftragsart erstellt. Pro neuem landesweiten oder internationalen Angebot besteht unabhängig eine 10-%-Chance auf einen Stammkunden dieses Segments. Eine Liste kann daher auch ganz ohne Kundenauftrag sein.

Landesweite und internationale Angebote haben zusätzlich eine Fahrart: **90 % Single Way** und **10 % Dual Way**. Bei beiden fährt der LKW für jede Ladung zum Ziel und zurück zur Ladestelle. Beim Single Way bleibt die Rückfahrt leer und unbezahlt; beim Dual Way nimmt er am Ziel die gleiche Frachtmenge als Rückfracht mit. Die Strecke im Angebot bezeichnet eine einfache Fahrt. Laufende alte Stadtaufträge behalten ihre direkte Tour ohne Rückfahrt.

Für die Fahrzeit gilt: **Stadtverkehr** `Strecke / Tempo beladen`; **Single Way** `Strecke / Tempo beladen + Strecke / Tempo leer`; **Dual Way** `2 × Strecke / Tempo beladen`. Jede Tour wird einzeln mit ihrer Ladung berechnet, auch wenn das Spiel nach einer Pause mehrere Touren nachholt. Das neue Ladungstempo gilt auch für bereits laufende Aufträge. Es verändert die Fahrzeit, aber nicht die Münzen und XP je abgeschlossener Tour.

**Automatische Aktualisierung:** Alle nicht angehefteten verfügbaren Angebote sämtlicher Auftragsarten werden **alle 15 Minuten kostenlos** ersetzt. Der nächste Zeitpunkt und ein Countdown stehen im Spielstand und auf der Auftragsseite. Nach einer Spielpause wird beim erneuten Öffnen eine überfällige Aktualisierung ausgeführt; verpasste Intervalle werden nicht einzeln nachgespielt. Erst ein tatsächlich ausgeführter automatischer Angebotswechsel setzt den Zähler für manuelle Aktualisierungen auf null.

**Manuelle Aktualisierung:** Der Knopf **„Neue Angebote“** ersetzt nur die nicht angehefteten verfügbaren Angebote der gerade geöffneten Auftragsart. Der Preis des nächsten Klicks beträgt **50 M × max(1, Anzahl aller eigenen Fahrzeuge) × (1 + Anzahl erfolgreicher manueller Aktualisierungen seit dem letzten automatischen Angebotswechsel)**. Mit fünf Fahrzeugen kosten die ersten drei manuellen Wechsel 250 M, 500 M und 750 M. Der Zähler gilt gemeinsam für Landesweit und International, bleibt im Spielstand erhalten und hat kein Limit. Eine manuelle Aktualisierung verschiebt den automatischen Timer nicht.

Mit freigeschaltetem und ausgebautem Vertrieb lassen sich **1 bis 3 verfügbare Aufträge gleichzeitig anheften**, über ihre Auftragsarten zusammen. Angeheftete Angebote belegen weiterhin einen Platz in ihrer Auftragsliste. Die Anheftung kann jederzeit gelöst werden. Bei Zuweisung an einen LKW endet sie automatisch; der freie Angebotsplatz wird wie üblich aufgefüllt.

## 5. Fahrtzeit, Münzen und XP

- Leer-Tempo: **1 km pro Sekunde** bei Common 0. Der Fahrzeugrang erhöht es gemäß der Formel oben. Beladen sinkt dieses Tempo je tatsächlich geladener Tonne um 1 %, auch bei der Grundkapazität. Tempo kann nicht manuell ausgebaut werden; Kapazität nur über Module in der Garage.
- Dauer einer Stadttour: `Strecke / Tempo beladen`. Single Way: `Strecke / Tempo beladen + Strecke / Tempo leer`. Dual Way: `2 × Strecke / Tempo beladen`. Die Zahlung und der Auftragsfortschritt werden bei den beiden Fernverkehrsarten erst nach der Rückfahrt gebucht; auch nach der letzten Lieferung fährt der LKW zurück.
- Fahrzeugkosten: `gefahrene Kilometer × (Fahrzeugpreis je km − 0,001 × Werkstattstufe)`. Stadtverkehr bezahlt eine Strecke, Single Way und Dual Way bezahlen **Hin- und Rückfahrt**. Die Basispreise je Fahrzeug stehen in der Tabelle oben.
- Lastkosten: `beladene Tonnenkilometer × 0,10 M`. Tatsächlich geladene Tonnen zählen; eine teilweise gefüllte letzte Fahrt kostet entsprechend weniger.
- Frachtvergütung: `beladene Tonnenkilometer × 1,00 M`. Die Fähigkeit **Vergütung** erhöht nur diesen Frachtanteil für Aufträge des jeweiligen Kunden um **0,1 % je Punkt**. Fahrzeugkilometer und Lastkosten bleiben unverändert. Stadtverkehr und Single Way vergüten nur die Hinfracht, Dual Way vergütet Hin- und Rückfracht. Entsprechend zählt die Rückfracht bei Dual Way auch für Tonnen, Tonnenkilometer und Spieler-XP.
- Spieler-XP je abgeschlossener Tour: `3 + beladene Tonnen`, bei Dual Way also `3 + 2 × Frachtmenge`.
- Transportgewinn: Summe der Vergütungen minus Summe der Betriebskosten. LKW-Käufe mindern das Guthaben zusätzlich.

**Beispiel ohne Werkstattausbau:** Ein Single-Way-Auftrag über **100 t und 46 km** mit einem **4-t-Allrounder** benötigt 25 Hin- und Rückfahrten. Die Frachtvergütung beträgt **4.600 M**, die Fahrzeugkosten **1.495 M** (25 × 92 km × 0,65 M) und die Lastkosten **460 M**. Das ergibt **2.645 M Transportgewinn**. Die erst nach Auftragsabschluss abholbare Prämie beträgt zusätzlich **10 M**; zusammen sind es **2.655 M**. Münzen werden pro Tour auf zwei Nachkommastellen gerundet. Die Tourbuchung verteilt die Rundungsreste so, dass der Frachtumsatz unabhängig vom gewählten LKW gleich bleibt.

Bereits gebuchte Touren in vorhandenen Spielständen behalten ihre historischen Münzen und Statistikwerte. Für alle künftig abgeschlossenen Touren gilt das neue Modell, auch wenn ihr Auftrag schon läuft. Eine Gewinnvorschau verwendet die aktuelle Werkstattstufe; spätere Änderungen daran ändern noch nicht gebuchte Touren.

Bereits laufende landesweite Aufträge eines Stadtlasters aus älteren Spielständen dürfen zu Ende gefahren werden. Neue landesweite Aufträge können ihm nicht mehr zugewiesen werden.

Nach der letzten Tour eines Auftrags entsteht genau **eine Auftragsprämie**. Der Auftrag erscheint im Dashboard unter „Auftragsprämien“. Ein Klick holt die einzelne Prämie ab; danach verschwindet der Auftrag aus dieser Liste. Mit „Alles sammeln“ erscheint eine Übersicht der Münzen und Zahnräder aller derzeit offenen Prämien. Erst „Bestätigen“ schreibt sie gesammelt gut und entfernt die Aufträge aus der Liste. Abbrechen lässt sie offen. Pro insgesamt transportierter Tonne gibt es **0,1 M** zusätzlich (100 t ergeben 10 M; bei Dual Way zählen die gleich großen Hin- und Rückfrachten, also 20 M). Diese Münzen werden beim Abholen gutgeschrieben und in der Statistik getrennt vom Tourenertrag erfasst. Jede Prämie kann nur einmal abgeholt werden; ihr Inhalt wird beim Abschluss festgelegt und gespeichert.

Zahnräder werden **einmal je vollständig abgeschlossenem Auftrag** festgelegt und erst beim Abholen der Prämie gutgeschrieben. Einzelne Touren geben keine Zahnräder. Jede Seltenheit wird unabhängig gewürfelt; deshalb können mehrere Sorten gemeinsam erscheinen. Die tatsächlichen Mengen stehen in der Prämienansicht. Die Werte außer **90–110 Common** bei normalen Aufträgen und der Rang-Kostenstaffel sind vorläufig und stehen zentral in `GEAR_LOOT` in `app.js`.

| Quelle | Common garantiert | Uncommon | Rare | Epic | Legendär |
| --- | ---: | ---: | ---: | ---: | ---: |
| Normaler Stadtauftrag | 90–110 | – | – | – | – |
| Normaler Landes-/Auslandsauftrag | 90–110 | 2 %: 100–150 | – | – | – |
| Stammkundenauftrag | 110–130 | 5 %: 100–150 | 10 %: 25–40 | – | – |
| Sonderfahrt | 130–150 | 8 %: 100–150 | 15 %: 25–40 | 20 %: 5–10 | – |
| Empfehlungsfahrt | 150–170 | 10 %: 100–150 | 20 %: 25–40 | 25 %: 5–10 | 1 garantiert, 25 % auf ein zweites |

Bei **internationalen** Aufträgen wird die ausgewürfelte Common-Menge mit 1,2 multipliziert und auf ganze Zahnräder gerundet. Alle anderen Quoten bleiben gleich. Zehn normale Aufträge liefern meist ungefähr 900–1.100 Common; Common-Stufe 1 kostet 1.000. Normale Stammkundenaufträge erhalten kein Kapazitätsmodul. Alte bereits festgelegte Zahnradfunde bleiben bei der Migration erhalten. Die Vorräte zeigen alle fünf Seltenheiten.

## 6. Kunden und Vertrauen

Alle fünf Kunden stehen von Anfang an in den Stammdaten. Spielerlevel sperrt weder Kunden noch Kundenskills. Neue normale Kundenangebote erscheinen ausschließlich landesweit und international; Nordbau kann nun landesweit erscheinen.

| Kunde | Auftragsart | Typische Fracht |
| --- | --- | --- |
| Nordbau GmbH | Landesweit | Baustoffe |
| Frischgut AG | Landesweit | Lebensmittel |
| Stahlwerk West | Landesweit | Stahlträger |
| Alpenhandel KG | Landesweit | Werkzeuge |
| EuroLog SE | International | Maschinenteile |

Bei jedem neu erzeugten landesweiten oder internationalen Angebot besteht eine unabhängige **10-%-Chance** auf einen Kunden der gewählten Auftragsart. Es gibt keinen garantierten Kundenauftrag pro Liste. Bestehende Altangebote bleiben im Spielstand erhalten.

Jeder Kunde beginnt bei **Vertrauenslevel 0**, ohne freie Fähigkeitspunkte. Erst der vollständige Abschluss eines Auftrags dieses Kunden gibt Vertrauen: **+10** für einen normalen Stammkundenauftrag, **+25** für eine Sonderfahrt und **+100** für eine Empfehlungsfahrt. Freie Frachtbörsenaufträge geben keines. Eine Tour allein und das Abholen der Prämie geben kein Vertrauen. Jeder Auftrag wird genau einmal gewertet, auch nach einem Reload.

Für den Aufstieg von Vertrauenslevel `L` auf `L + 1` sind `110 + 10 × L` Vertrauen nötig. Überschuss zählt zur nächsten Stufe. Der erste Aufstieg kostet 110, der zweite 120, der letzte von 149 auf 150 kostet 1.600. **Level 150** ist das Maximum und erfordert insgesamt **128.250 Vertrauen**. Jeder Aufstieg gibt genau **einen Fähigkeitspunkt für diesen Kunden**; danach gibt es keine weiteren Punkte. Bereits gesammelte Kunden-XP aus älteren Spielständen werden als Vertrauen übernommen und nach dieser Kurve neu bewertet. Alte Skillverteilungen werden ohne Doppelzählung als freie, vom neuen Level gedeckte Punkte erstattet; vorhandene Kunden und Aufträge bleiben erhalten.

| Fähigkeit | Wirkung je Punkt | Maximum |
| --- | --- | --- |
| Vergütung | +0,1 % auf den Frachtanteil pro Tonnenkilometer bei normalen, Sonder- und Empfehlungsaufträgen dieses Kunden | 100 Punkte / +10 % |
| Sonderfahrtchance | +0,1 Prozentpunkte auf die Chance nach einem normalen Auftrag dieses Kunden | 25 Punkte / +2,5 Prozentpunkte |
| Empfehlungschance | +0,1 Prozentpunkte auf die Chance nach einer Sonderfahrt dieses Kunden | 25 Punkte / +2,5 Prozentpunkte |

Die Grundchance auf eine Sonderfahrt beträgt landesweit 20 % und international 40 %, mit maximaler Fähigkeit also 22,5 % und 42,5 %. Die Grundchance auf eine Empfehlungsfahrt beträgt landesweit 4 % und international 6 %, maximal 6,5 % und 8,5 %. Diese Boni addieren sich in **Prozentpunkten**. Nur die Fähigkeiten des betreffenden Kunden wirken. Punkte können weder über das freie Budget noch über das jeweilige Maximum hinaus vergeben werden. Es gibt keine Kundenfähigkeit für Spieler-XP, Frachtmenge, Zahnräder oder Kapazitätsmodule.

## 7. Statistik und CO₂

Die Statistik zählt LKW in allen Garagen, abgeschlossene und aktive Aufträge, beendete Touren, gelieferte Tonnen, **alle Fahrkilometer einschließlich Rückfahrten**, Tonnenkilometer beladener Strecken, alle Spieler-XP, Transportertrag, abgeholte Auftragsprämien, Betriebskosten, Transportgewinn, LKW-Käufe, historische Mitarbeitereinstellungen, Abteilungsfreischaltungen, Auftragslisten-, Werkstatt- und Vertriebsausbau, manuelle Angebotswechsel und aktuelles Guthaben. Einmalige Erstattungen für frühere Fahrzeugausbauten, Niederlassungen und Mitarbeitereinstellungen bleiben in der Münzenbilanz sichtbar.

Die CO₂-Anzeige ist eine **grobe Spielschätzung**, keine Messung eines konkreten Fahrzeugs: `beladene Tonnenkilometer × 0,05275 kg CO₂/tkm`. Der Faktor entspricht 52,75 g CO₂/tkm als [EEA-Referenzwert für neue schwere Fahrzeuge](https://climate-energy.eea.europa.eu/topics/transport/emissions-from-heavy-duty-vehicles/intro). Die Rückfracht bei Dual Way zählt mit. Fahrzeugtyp, Fahrweise und leere Rückfahrten werden dafür nicht gesondert berechnet.

## 8. Firma und Abteilungen

Die Firmenansicht zeigt die Abteilungen des Hauptsitzes in kompakten Karten. Über **Ausbauen** öffnet sich ein Fenster, in dem die jeweilige Abteilung freigeschaltet oder ausgebaut wird. Der gewählte Startort bleibt der **Hauptsitz** für die derzeitige Auftragsbörse und Garage. Weitere Niederlassungen können nicht mehr gekauft werden. Ältere Spielstände behalten ihre LKW und laufenden Aufträge. Freigeschaltete Abteilungen werden zusammengeführt; bei Ausbaustufen gilt jeweils der höchste erreichte Wert. Die erfassten Kaufkosten zusätzlicher Niederlassungen werden einmalig erstattet. Verfügbare Angebote früherer Standorte entfallen und die Angebotsliste am Hauptsitz wird aufgefüllt.

### Stadthub und Privatabholungen

Es gibt **einen Stadthub** am Hauptsitz. Seine Eröffnung kostet **0 M**. Kleintransporter und Stadtlaster werden getrennt von regulären LKW gezählt. Neu gekaufte Stadttransporter werden direkt im Hub eingesetzt. Stadtfahrzeuge aus alten Spielständen bleiben erhalten und können im Hub eingesetzt werden, sobald ihre alten Aufträge abgeschlossen sind. Ein Hub-Fahrzeug kann nicht gleichzeitig einen Einzelauftrag übernehmen.

Ein Einkaufszyklus dauert **eine Stunde**: 45 Minuten Verteilung, 15 Minuten Pause. Die mögliche Stundenmenge ist die Summe der vollen Touren jedes eingesetzten Fahrzeugs in 45 Minuten. Eine Tour fährt 12 km beladen und 12 km leer; Kapazität, Ladungsabschlag und Fahrzeugrang bestimmen die Fahrzeit. Der Vertrieb kauft auf Stufe 0 **75 %** dieser möglichen Menge ein. Jede seiner **25 Stufen** erhöht die Menge um einen Prozentpunkt bis auf **100 %**. Es wird keine Ware über die abtransportierbare Menge hinaus eingekauft.

Vorläufig gelten **10 M Verkaufserlös** und **3 M Einkaufspreis** je verteilter Tonne. Der stündliche Hub-Ertrag ist damit `verteilte Tonnen × 7 M`. Der Hub erzeugt **keine XP und keine Zahnräder**. Nach jedem aktiven Stundenzyklus landen **8–12 Abholhinweise** im Kassenbestand. Der Kassenbestand fasst derzeit **12 Stundenzyklen** und muss dann abgeholt werden, bevor er weiter wachsen kann. Abgeholte Münzen fließen in das Guthaben, abgeholte Hinweise in die Vorräte. Hub-Tonnen und abgeholter Hub-Ertrag erscheinen getrennt in den Statistiken.

In den Vorräten lassen sich **100 Abholhinweise zu einer Privatabholung** kombinieren. Diese bleibt dort gespeichert und wird einem freien regulären LKW zugewiesen. Beim Abschluss erhält sie keine Zahnräder und kein Kapazitätsmodul, aber garantiert **1 Lieferantenkontakt** und mit vorläufig **20 % Chance** einen zweiten. Die Kontakte werden zusammen mit der Auftragsprämie abgeholt. Unverbrauchte Kontakte bleiben erhalten; weitere Verwendungen können später ergänzt werden.

Ein Vertriebsausbau kostet vorläufig `5 × Zielstufe` **Lieferantenkontakte**, keine Münzen. Die erste Stufe dauert **12 Stunden**, jede folgende Stufe weitere **12 Stunden** länger: Stufe 2 dauert 24 Stunden, Stufe 25 dauert 300 Stunden. Während des Baus läuft der Hub normal weiter. Der höhere Einkaufswert gilt erst nach Abschluss und ab dem nächsten Einkaufszyklus. Ein zweites Ausbaumaterial wird später festgelegt.

| Abteilung | Geplante Aufgabe | Aktueller Status |
| --- | --- | --- |
| Buchhaltung | Finanzen und Abrechnungen | Gesperrt |
| Personalabteilung | Spätere Neugestaltung | Vorläufig keine Freischaltung oder Einstellung; bestehende Freischaltungen bleiben gespeichert |
| Disposition | Mehr verfügbare Aufträge je Auftragsart | Für 5.000 M freischaltbar |
| Werkstatt | Betriebskosten der LKW senken | Für 5.000 M freischaltbar |
| Fuhrpark | Spätere Verwaltung und Entwicklung des Fuhrparks | Gesperrt; Funktion und Freischaltung folgen |
| Lager | Spätere Verwaltung von Materialien und Gegenständen | Gesperrt; Funktion und Freischaltung folgen |
| Vertrieb & Kundenbetreuung | Verfügbare Aufträge anheften; später ggf. kürzerer Angebots-Timer und geringere manuelle Kosten | Für 5.000 M freischaltbar |

**Disposition, Werkstatt und Vertrieb kosten jeweils einmalig 5.000 M.** Buchhaltung, Fuhrpark und Lager bleiben bis zur Festlegung ihrer Funktionen gesperrt.

Die **Personalabteilung** ist bis zu ihrer Neugestaltung pausiert. Neue Einstellungen und Freischaltungen sind gesperrt. Vorhandene bezahlte Einstellungen werden beim Laden eines alten Spielstands einmalig erstattet; die Erstattung erscheint in der Münzenbilanz. Frühere Mitarbeitende geben weder LKW-Plätze noch einen Aufschlag auf Kilometerkosten. Bereits freigeschaltete Personalabteilungen bleiben als Fortschritt gespeichert. Das neue Navigationsmodul **Personal** ist unabhängig davon: Es zeigt eine Kartensammlung mit drei ausdrücklich als Beispiele markierten Figuren und genau fünf vorbereiteten Plätzen im Führungsteam. Erwerb, Aktivierung, Duplikat-Level und Bonuswirkungen sind noch nicht eingebaut.

Der **Vertrieb** startet nach der Freischaltung auf Stufe 0. Seine drei Ausbaustufen erhöhen die Zahl gleichzeitig anheftbarer Aufträge auf **1, 2 oder 3**. Die Stufen kosten vorläufig **500 M**, **1.000 M** und **1.500 M**. Das Limit gilt über Landesweit und International zusammen. Angeheftete Angebote bleiben bei automatischen und manuellen Angebotswechseln erhalten. Wird ein solches Angebot zugewiesen, wird der Pin frei.

Nach der Freischaltung der Disposition können Landesweit und International getrennt von **Stufe 0 bis Stufe 5** ausgebaut werden. Jede Stufe fügt dieser Liste **einen dauerhaft verfügbaren Auftrag** hinzu. Die Anzahl lautet `5 + Ausbaustufe`, also höchstens **10 Angebote** je Auftragsart. Beim Kauf einer Stufe werden die zusätzlichen Angebote sofort aufgefüllt.

| Nächste Stufe | Kosten je Auftragsart | Angebote danach |
| ---: | ---: | ---: |
| 1 | 500 M | 6 |
| 2 | 1.000 M | 7 |
| 3 | 1.500 M | 8 |
| 4 | 2.000 M | 9 |
| 5 | 2.500 M | 10 |

Die **Werkstatt** hat **50 Ausbaustufen**. Jede Stufe senkt den Fahrzeugpreis aller LKW um **0,001 M/km**. Der Satz lautet `Fahrzeuggrundpreis − 0,001 × Werkstattstufe M/km`. Auf Stufe 50 spart jeder LKW **0,05 M je gefahrenem Kilometer**; die Lastkosten und Frachtvergütung bleiben gleich. Der jeweils aktuelle Satz gilt beim Abschluss einer Tour; die Gewinnvorschau im Zuweisungsfenster sowie die Garagentabelle und Fahrzeugdetails zeigen diesen Satz. Bereits gebuchte Touren werden nicht rückwirkend geändert.

Die Werkstatt schaltet keine Tempo- oder Kapazitätsausbauten frei; Kapazität wird ausschließlich mit Modulen im Fahrzeugdetail erhöht. Bei älteren Spielständen entfallen gespeicherte manuelle Fahrzeugausbauten und ihre Werkstattfreigaben. Die dafür erfassten Münzausgaben werden einmalig erstattet. Fahrzeugkapazitäten entsprechen danach wieder der jeweiligen Grundklasse; neue Modulausbauten werden getrennt gespeichert. Vorhandene Fahrzeugränge und laufende Aufträge bleiben erhalten; laufende Aufträge verwenden das aktuelle Tempo und die Grundkapazität.

Die Kosten steigen in Fünfergruppen. Damit kosten fünf neue Stufen zusammen so viel wie eine Stufe im bisherigen 10-Stufen-System. Für die nächste Stufe `n` gilt: `100 × aufrunden(n / 5) M`.

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

Ein abgeschlossener normaler Stammkundenauftrag vergibt mit **20 % landesweit** oder **40 % international**, zuzüglich der kundenbezogenen Fähigkeit, eine sammelbare Sonderfahrt für genau diesen Kunden. Normale Kundenaufträge geben keine Kapazitätsmodule. Route, Frachtmenge, Fahrart, Kunde und Segment werden beim Erhalt der Sonderfahrt fest ausgewürfelt und gespeichert. Sonderfahrten laufen nicht ab. Sie starten erst nach bewusster Auswahl eines geeigneten freien LKW im Navigationsmodul **Sonderfahrten**. In dessen Hauptliste steht **Empfehlungsaufträge** mit der Zahl aller offenen Empfehlungsfahrten zuerst; danach folgen die Stammkunden mit ihren offenen Sonderfahrten. Die jeweilige Unterseite zeigt offene, laufende und abgeschlossene Fahrten sowie ihren Fortschritt und ihre Prämie. Für Transport, Hin- und Rückfahrt, Kosten, Vergütung und Freigabe des LKW gelten die normalen Regeln.

Beim Abschluss einer Sonderfahrt werden zwei unabhängige Chancen einmalig ausgewürfelt: **8 % Kapazitätsmodul** und **4 % Empfehlungsfahrt** landesweit, **12 % Kapazitätsmodul** und **6 % Empfehlungsfahrt** international. Die kundenbezogene Fähigkeit erhöht nur die Empfehlungschance. Empfehlungsfahrten werden für denselben Kunden und dasselbe Segment mit festen Auftragsdaten gespeichert und später bewusst gestartet. Sie erzeugen keine weiteren Empfehlungsfahrten. Ihre vorläufige Modulchance beträgt **20 % landesweit** und **30 % international**. Die Grundwerte stehen zentral in `SPECIAL_CHANCES` in `app.js`. Modulbeute und die bestehende Auftragsprämie werden beim Abschluss festgelegt, nach dem Abholen gutgeschrieben und können auch nach Reload nur einmal abgeholt werden.

Die **Vorräte** zeigen Kapazitätsmodule. Im Garagen-Fahrzeugdetail kosten die beiden möglichen Kapazitätsstufen **1** und **3 Module** und geben je **+1 t**. Bestand, Kosten und Höchststufe werden angezeigt. Alte Spielstände behalten LKW, laufende Aufträge und bisherige Spielwerte; neue Modulstände beginnen bei null.
