import { useMemo, useState } from "react";

import styles from "./_index/styles.module.css";

const memoryOptions = ["32GB DDR5", "64GB DDR5", "128GB DDR5"];
const gpuOptions = ["RTX 4070 Super", "RTX 4080 Super", "RTX 4090"];
const storageOptions = ["2TB NVMe", "4TB NVMe", "8TB NVMe"];
const monitorOptions = ["27-inch 165Hz", "32-inch 4K", "Dual 27-inch 4K"];
const accessoryOptions = [
  "Keyboard + Mouse",
  "Creator Desk Kit",
  "Streaming Kit",
];
const formatPHP = (price: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);
const thumbnails = [
  "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=88",
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=88",
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=88",
];

export default function Product() {
  const [memory, setMemory] = useState(memoryOptions[0]);
  const [gpu, setGpu] = useState(gpuOptions[1]);
  const [storage, setStorage] = useState(storageOptions[0]);
  const [monitor, setMonitor] = useState(monitorOptions[1]);
  const [accessories, setAccessories] = useState(accessoryOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(thumbnails[0]);

  const price = useMemo(() => {
    return (
      149000 +
      memoryOptions.indexOf(memory) * 20000 +
      gpuOptions.indexOf(gpu) * 30000 +
      storageOptions.indexOf(storage) * 16000 +
      monitorOptions.indexOf(monitor) * 18000 +
      accessoryOptions.indexOf(accessories) * 9000
    );
  }, [accessories, gpu, memory, monitor, storage]);

  return (
    <main className={styles.index}>
      <StoreNav />
      <section className={styles.productDetail}>
        <div className={styles.galleryColumn}>
          <div className={styles.productPhoto}>
            <img src={image} alt="NexusLab Performance PC Bundle" />
          </div>
          <div className={styles.thumbnailRow} aria-label="Product images">
            {thumbnails.map((thumbnail) => (
              <button
                className={thumbnail === image ? styles.activeThumbnail : ""}
                key={thumbnail}
                type="button"
                onClick={() => setImage(thumbnail)}
              >
                <img src={thumbnail} alt="Performance PC Bundle thumbnail" />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.breadcrumbs}>
            <a href="/collection">Collection</a>
            <span>/</span>
            <span>Performance PC Bundle</span>
          </div>
          <p className={styles.eyebrow}>Configurable Computer Bundle</p>
          <h1>NexusLab Performance PC Bundle</h1>
          <div className={styles.reviewRow}>
            <span>5.0 build rating</span>
            <span>Built in 7-10 days</span>
            <span>Setup consultation included</span>
          </div>
          <p>
            A complete desktop computer bundle for gaming, editing, streaming,
            software development, and serious daily work. Pick the parts,
            monitor, and desk kit that match your setup.
          </p>

          <Configurator
            label="Memory"
            options={memoryOptions}
            value={memory}
            onChange={setMemory}
          />
          <Configurator
            label="Graphics"
            options={gpuOptions}
            value={gpu}
            onChange={setGpu}
          />
          <Configurator
            label="Storage"
            options={storageOptions}
            value={storage}
            onChange={setStorage}
          />
          <Configurator
            label="Monitor"
            options={monitorOptions}
            value={monitor}
            onChange={setMonitor}
          />
          <Configurator
            label="Desk Accessories"
            options={accessoryOptions}
            value={accessories}
            onChange={setAccessories}
          />

          <div className={styles.quantityRow}>
            <span>Quantity</span>
            <div>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity(quantity + 1)}>
                +
              </button>
            </div>
          </div>

          <div className={styles.productSummary}>
            <span>Estimated total</span>
            <strong>{formatPHP(price * quantity)}</strong>
          </div>

          <div className={styles.purchaseActions}>
            <a className={styles.primaryButton} href="/cart">
              Add Bundle to Cart
            </a>
            <a className={styles.secondaryCommerceButton} href="/collection">
              Compare Bundles
            </a>
          </div>

          <div className={styles.specList}>
            <div>
              <span>Processor</span>
              <strong>Intel Core i9 or AMD Ryzen 9 class</strong>
            </div>
            <div>
              <span>Bundle Includes</span>
              <strong>
                Desktop tower, monitor, keyboard, mouse, and setup
              </strong>
            </div>
            <div>
              <span>Warranty</span>
              <strong>2-year parts and build support</strong>
            </div>
            <div>
              <span>Build Service</span>
              <strong>
                Assembly, cable management, thermal tuning, testing
              </strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Configurator({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className={styles.question}>
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            className={option === value ? styles.activeOption : undefined}
            key={option}
            type="button"
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
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
