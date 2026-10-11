# Frachtwerk

Ein lokales Transportspiel im Browser. Du kaufst LKW, weist Aufträge zu und baust deine Spedition aus. Der Spielstand wird ausschließlich im Browser per `localStorage` gespeichert; Konten und ein Server sind noch nicht eingerichtet.

## Lokal starten

Im Projektordner einen statischen Server starten:

```powershell
py -m http.server 8000
```

Danach [http://localhost:8000](http://localhost:8000) öffnen. Es sind keine Pakete und kein Build-Schritt nötig.

## Tests

Mit installiertem Node.js alle Tests ausführen:

```powershell
Get-ChildItem tests -Filter *.test.cjs | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

## Projektdateien

- `index.html`, `styles.css`, `app.js`: Oberfläche und Spiellogik
- `SPIELREGELN.md`: aktuelle Regeln und feste Spielwerte
- `tests/`: Tests für Spielstand, Wirtschaft und Aufträge

Frühere Tabellen und Vorschauen unter `outputs/` bleiben lokal und sind nicht Teil des Spielcodes.
