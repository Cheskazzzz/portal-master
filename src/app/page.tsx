import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <section className={styles.left}>
          <div className={styles.numbers}>
            <div className={styles.top}>PL</div>
            <div className={styles.vertical}></div>
            <div className={styles.bottom}>ENG</div>
          </div>

          <h1 className={styles.title}>
            We Build
            <br />
            The Future
          </h1>

          <p className={styles.lead}>
            Perez-Loreño Engineering is a construction company committed to
            contribute towards the attainment of superior quality service through
            the delivery of highly competent manpower, reliable maintenance, and
            construction services. We are inclined to go above and beyond on every
            project and deliver on our promises with integrity.
          </p>

          <div className={styles.cta}>
            <a href="/gallery" className={styles.ctaButton}>View Our Projects</a>
            <a href="/contact-us" className={styles.ctaLink}>Contact Us</a>
          </div>
        </section>

        <aside className={styles.right}>
          <div className={styles.imgWrap}>
            <div
              className={styles.skew1}
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600')",
              }}
            />

            <div
              className={styles.skew2}
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1590845947670-c009801ffa74?w=600')",
              }}
            />
          </div>
        </aside>
      </main>

      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <div className={styles.missionItem}>
            <h2>Mission</h2>
            <p>To be a respectable contractor always delivering beyond expectation.</p>
          </div>
          <div className={styles.missionItem}>
            <h2>Vision</h2>
            <p>To be an innovator in the field of construction utilizing modern technology to deliver the best possible outcomes to our projects.</p>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className={styles.sectionHeader}>
          <h2>Our Services</h2>
          <p>We provide comprehensive construction and engineering solutions</p>
        </div>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceItem}>
            <h3>Architectural Plans</h3>
            <p>Structural, electrical, plumbing, electronics, mechanical, and fire detection plans</p>
          </div>
          <div className={styles.serviceItem}>
            <h3>Building Construction</h3>
            <p>Residential, commercial, institutional buildings, apartments, and mass housing</p>
          </div>
          <div className={styles.serviceItem}>
            <h3>Project Permit Services</h3>
            <p>Building permits, occupancy permits, fire department permits, and fire safety clearance</p>
          </div>
          <div className={styles.serviceItem}>
            <h3>Installation Services</h3>
            <p>CCTV, FDAS (Fire Detection and Alarm System), and fire extinguishers</p>
          </div>
          <div className={styles.serviceItem}>
            <h3>Consultancy Services</h3>
            <p>Expert construction consultancy and structural analysis</p>
          </div>
          <div className={styles.serviceItem}>
            <h3>Renovation</h3>
            <p>Complete renovation services for existing structures</p>
          </div>
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.sectionHeader}>
          <h2>Our Team</h2>
          <p>Meet our leadership team and architects driving excellence</p>
        </div>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <h3>Cheska Santiago</h3>
            <p>Team Member</p>
          </div>
          <div className={styles.teamMember}>
            <h3>Andre James Francisco</h3>
            <p>Team Member</p>
          </div>
          <div className={styles.teamMember}>
            <h3>Josh Kevin Holgado</h3>
            <p>Team Member</p>
          </div>
          <div className={styles.teamMember}>
            <h3>Marco Manaig</h3>
            <p>Team Member</p>
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <div className={styles.contactContent}>
          <h2>Let's Connect With Us!</h2>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <strong>Email:</strong> perezloreno.engineering@gmail.com
            </div>
            <div className={styles.contactItem}>
              <strong>Facebook:</strong> facebook.com/PLEngineers
            </div>
            <div className={styles.contactItem}>
              <strong>Phone:</strong> (044) 617 3794
            </div>
          </div>
        </div>
      </section>

      <div className={styles['footer-accent']} />
    </div>
  );
}
