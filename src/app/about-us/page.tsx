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
            {/* Single full rectangle image (uploaded file path) */}
            <div className={styles.fullImage}>
              <img
                src="team.png"
                alt="About Us"
              />
            </div>
          </div>
        </aside>
      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}
