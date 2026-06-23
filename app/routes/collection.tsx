import { useMemo, useState } from "react";

import styles from "./_index/styles.module.css";

type Category =
  | "All Bundles"
  | "Gaming Bundles"
  | "Creator Bundles"
  | "Workstation Bundles"
  | "Laptop Bundles";

const formatPHP = (price: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);

const categories: Category[] = [
  "All Bundles",
  "Gaming Bundles",
  "Creator Bundles",
  "Workstation Bundles",
  "Laptop Bundles",
];

const products = [
  {
    name: "Nexus Core Gaming PC Bundle",
    price: 98900,
    compareAt: 118900,
    category: "Gaming Bundles",
    badge: "Best Value",
    rating: "4.9",
    description:
      "A balanced 1440p gaming bundle with tower, monitor, keyboard, mouse, and headset.",
    specs: ["Ryzen 7", "RTX 4070 Super", "32GB RAM", "27-inch 165Hz"],
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Creator Pro Studio PC Bundle",
    price: 185000,
    compareAt: 209000,
    category: "Creator Bundles",
    badge: "Creator Pick",
    rating: "5.0",
    description:
      "A quiet editing and design bundle with color-ready display, fast storage, and studio peripherals.",
    specs: ["Core i9", "RTX 4080 Super", "64GB RAM", "4TB NVMe"],
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "AI Developer Workstation Bundle",
    price: 248000,
    compareAt: 279000,
    category: "Workstation Bundles",
    badge: "AI Ready",
    rating: "4.8",
    description:
      "A memory-rich desktop bundle for code, containers, local AI, and multi-monitor work.",
    specs: ["Ryzen 9", "RTX 4090", "128GB RAM", "Dual 27-inch"],
    image:
      "https://images.unsplash.com/photo-1555617778-02518510b9fa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Hybrid Laptop Desk Bundle",
    price: 124900,
    compareAt: 141900,
    category: "Laptop Bundles",
    badge: "Portable",
    rating: "4.7",
    description:
      "A laptop, docking, monitor, keyboard, and mouse bundle for hybrid teams and students.",
    specs: ["14-inch Laptop", "32GB RAM", "1TB SSD", "USB-C Dock"],
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function Collection() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All Bundles");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All Bundles") {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <main className={styles.index}>
      <StoreNav />
      <section className={styles.collectionHero}>
        <div>
          <p className={styles.eyebrow}>PC Bundle Collection</p>
          <h1>Complete computer bundles, ready to configure.</h1>
          <p>
            Shop gaming rigs, creator PCs, AI workstations, and laptop desk
            bundles with clear specs, premium parts, and setup support from
            NexusLab.
          </p>
        </div>
        <a className={styles.primaryButton} href="/product">
          Configure Bundle
        </a>
      </section>

      <section className={styles.shopShell}>
        <aside className={styles.filterPanel} aria-label="Collection filters">
          <p className={styles.eyebrow}>Filters</p>
          {categories.map((category) => (
            <button
              className={
                category === selectedCategory ? styles.activeFilter : undefined
              }
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </aside>

        <div className={styles.productListing}>
          <div className={styles.collectionToolbar}>
            <span>{filteredProducts.length} computer bundles</span>
            <label>
              Sort
              <select defaultValue="featured" aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="performance">Performance First</option>
              </select>
            </label>
          </div>

          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <article className={styles.productCard} key={product.name}>
                <a className={styles.productMedia} href="/product">
                  <span>{product.badge}</span>
                  <img src={product.image} alt={product.name} />
                </a>
                <div className={styles.productCardBody}>
                  <div className={styles.productMeta}>
                    <span>{product.category}</span>
                    <span>{product.rating} build rating</span>
                  </div>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <ul>
                    {product.specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                  <div className={styles.priceRow}>
                    <strong>{formatPHP(product.price)}</strong>
                    <s>{formatPHP(product.compareAt)}</s>
                  </div>
                  <div className={styles.cardActions}>
                    <a className={styles.primaryButton} href="/product">
                      View Bundle
                    </a>
                    <a className={styles.secondaryCommerceButton} href="/cart">
                      Add Bundle
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
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
