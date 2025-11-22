import styles from "../page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <section className={styles.left}>
          <div className={styles.numbers}>
            <div className={styles.top}>02</div>
            <div className={styles.vertical}></div>
            <div className={styles.bottom}>09</div>
          </div>

          <h1 className={styles.title}>About Us</h1>

          <p className={styles.lead}>
            Perez-Loreño Engineering Firm is a multidisciplinary engineering and
            construction company dedicated to delivering modern, sustainable, and
            community-centered building solutions. With years of expertise in
            design, planning, and project execution, we continue to push
            boundaries in the built environment.
          </p>

          <p className={styles.lead}>
            Our team is committed to maintaining excellence, innovation, and
            professionalism in every project we undertake.
          </p>
        </section>

        <aside className={styles.right}>
          <div className={styles.imgWrap}>
            <div
              className={styles.skew1}
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1400&q=80')",
              }}
            />

            <div
              className={styles.skew2}
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1529429617124-0a9a0f7d2b6b?auto=format&fit=crop&w=1400&q=80')",
              }}
            />
          </div>
        </aside>
      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}
