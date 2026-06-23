import styles from "./_index/styles.module.css";

const formatPHP = (price: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);

const cartItems = [
  {
    name: "NexusLab Performance PC Bundle",
    configuration: "64GB DDR5 / RTX 4080 Super / 4TB NVMe / 32-inch 4K monitor",
    includes: "Tower, monitor, keyboard, mouse, cable management, burn-in test",
    price: 231000,
  },
  {
    name: "Hybrid Laptop Desk Bundle",
    configuration: "14-inch laptop / 32GB memory / 1TB SSD / USB-C dock",
    includes: "Laptop, docking station, 27-inch monitor, compact keyboard",
    price: 124900,
  },
];

const total = cartItems.reduce((sum, item) => sum + item.price, 0);

export default function Cart() {
  return (
    <main className={styles.index}>
      <StoreNav />
      <section className={styles.pageHero}>
        <p className={styles.eyebrow}>Computer Bundle Cart</p>
        <h1>Your PC build list.</h1>
        <p>
          Review selected computer bundles, included peripherals, and setup
          services before final consultation and checkout.
        </p>
      </section>

      <section className={styles.cartShell}>
        <div className={styles.cartItems}>
          {cartItems.map((item) => (
            <article className={styles.cartItem} key={item.name}>
              <div>
                <h2>{item.name}</h2>
                <p>{item.configuration}</p>
                <ul className={styles.cartIncludes}>
                  <li>{item.includes}</li>
                </ul>
              </div>
              <strong>{formatPHP(item.price)}</strong>
            </article>
          ))}
        </div>
        <aside className={styles.cartSummary}>
          <span>Estimated total</span>
          <strong>{formatPHP(total)}</strong>
          <p>
            Includes build consultation, compatibility check, OS-ready setup,
            assembly, and performance tuning.
          </p>
          <div className={styles.checkoutChecklist}>
            <span>Before checkout</span>
            <p>
              Confirm workload, monitor size, desk space, and delivery date.
            </p>
          </div>
          <a className={styles.primaryButton} href="/product">
            Finalize PC Bundle
          </a>
        </aside>
      </section>
    </main>
  );
}

function StoreNav() {
  return (
    <header className={styles.storeHeader}>
      <nav className={styles.navLinks} aria-label="Store navigation">
        <a href="/">Home</a>
        <a href="/collection">Collection</a>
        <a href="/product">Product</a>
        <a href="/cart">Cart</a>
      </nav>
      <a className={styles.brand} href="/">
        NexusLab
      </a>
      <div className={styles.navActions}>
        <span className={styles.currencyPill}>PHP</span>
        <a className={styles.utilityLink} href="/collection">
          Search
        </a>
        <a className={styles.utilityLink} href="/auth/login">
          Account
        </a>
        <a className={styles.utilityLink} href="/cart">
          Cart
        </a>
      </div>
    </header>
  );
}
