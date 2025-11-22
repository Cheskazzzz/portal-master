import styles from "../page.module.css";

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <section className={styles.left}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.lead}>
            For inquiries, please email us at <strong>info@pl-engineering.example</strong>
            or call <strong>+1 (555) 123-4567</strong>.
          </p>
        </section>
      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}
