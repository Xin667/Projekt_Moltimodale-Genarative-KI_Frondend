function inputPage() {
  return (
        <section className="panel visible" id="p1">
      <div className="eyebrow">Schritt 1 · Input-Kontext</div>
      <h2>Womit fangen wir an?</h2>
      <p className="lead">Lade eine Storyboard-Skizze hoch und ergänze Notizen aus dem Brainstorming. Alles ist optional kombinierbar — Widersprüche zwischen Skizze und Notizen werden später als offene Fragen aufgeführt.</p>
      <div className="card">
        <h3>Text-Notizen</h3>
        <textarea id="notes" placeholder="Ungefilterte Brainstorming-Notizen …">Pflanze soll Besucher anjammern wenn durstig. Nicht nervig, eher niedlich. Vielleicht alle 30 Sekunden? Beim Gießen Belohnung.</textarea>
      </div>

      <div className="card">
        <h3>Audionotiz</h3>
        <button className="btn btn-ghost" id="audioBtn">● Aufnahme starten</button>
        <span id="audioState"></span>
      </div>

      <div className="agent-status" id="status1"><div className="pulse"></div><span id="statusText1"></span></div>
      <div className="btn-row">
        <button className="btn btn-primary" id="analyzeBtn">Konzept analysieren →</button>
        <span>POST /api/analyze-concept</span>
      </div>
    </section>
  )
    }

export default inputPage; 