const areas = [
  {
    title: "Kindbereich",
    text: "Starte die Plus-Werkstatt für schriftliche Addition mit Übertrag.",
    href: "/login",
  },
  {
    title: "Elternbereich",
    text: "Sieh die letzten Lernereignisse und sanfte Zusammenfassungen.",
    href: "/parent",
  },
  {
    title: "Aufgabe vorführen",
    text: "Zeig es mir ist eine konkrete vorgerechnete Aufgabe, kein Produkt-Gastmodus.",
    href: "/kind/addition",
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
          <a className="area-card" key={area.title} href={area.href}>
            <h2>{area.title}</h2>
            <p>{area.text}</p>
          </a>
        ))}
      </section>
    </main>
  );
}
