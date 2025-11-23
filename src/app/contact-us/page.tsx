import styles from "../page.module.css";

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <section className={styles.left}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.lead}>
            For inquiries, please email us at <strong>perezloreno.engineering@gmail.com</strong>
            or call <strong>(044) 617-3794</strong>.
          </p>
        </section>
      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}
