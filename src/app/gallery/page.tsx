import styles from "../page.module.css";

export default function GalleryPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <section className={styles.left}>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.lead}>
            A collection of our completed projects will appear here.
            (Placeholder gallery page.)
          </p>
        </section>
      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}
