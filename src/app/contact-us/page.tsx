import styles from "../page.module.css";

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>

        {/* LEFT SIDE — CONTACT TEXT */}
        <section className={styles.left}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.lead}>For inquiries, please contact us.</p>
          <p className={styles.lead}>
            <strong>29 Fausta Rd, Malolos, Bulacan</strong>
          </p>
          <p className={styles.lead}>
            <strong>facebook.com/PLEngineers</strong>
          </p>
          <p className={styles.lead}>
            <strong>perezloreno.engineering@gmail.com</strong>
          </p>
          <p className={styles.lead}>
            <strong>0916-859-7565 | 0939-710-0255</strong>
          </p>
          <p className={styles.lead}>
            <strong>(044) 617-3794</strong>
          </p>
        </section>

        {/* RIGHT SIDE — IMAGE */}
        <aside className={styles.right}>
          <div className={styles.contactImgWrap}>
            <img
              src="/contact.png"
              alt="ContactImage"
            />
          </div>
        </aside>

      </main>

      <div className={styles["footer-accent"]} />
    </div>
  );
}
