const areas = [
  {
    title: "Kindbereich",
    text: "Ein geschützter Raum für spätere Übungen, Entdeckungen und Erfolgserlebnisse.",
  },
  {
    title: "Elternbereich",
    text: "Ein ruhiger Platz für Begleitung, Einblicke und zukünftige Einstellungen.",
  },
  {
    title: "Aufgabe vorführen",
    text: "Eine konkrete Aufgabe wird Schritt für Schritt vorgerechnet, bevor das Kind selbst übernimmt.",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Web-App-Grundgerüst</p>
        <h1 id="home-title">Werkelwelt</h1>
        <p className="subtitle">Eine Werkstatt für sichere Rechenwege</p>
      </section>

      <section className="area-grid" aria-label="Platzhalterbereiche">
        {areas.map((area) => (
          <article className="area-card" key={area.title}>
            <h2>{area.title}</h2>
            <p>{area.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
