import { useMemo, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

type Workload = "Gaming" | "Creator" | "Developer" | "Business";
type Budget = "₱75K" | "₱120K" | "₱200K" | "₱300K+";
type PerformanceTarget = "Everyday" | "Pro" | "Ultra" | "Maxed";
type FormFactor = "Custom PC" | "Laptop" | "Small Form" | "Hybrid";

const systems = [
  {
    name: "Nexus Core Custom PC",
    tone: "A balanced custom desktop for gaming, work, streaming, and smooth everyday performance.",
    price: "From ₱82,900",
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Creator Pro Workstation",
    tone: "High-core performance, quiet cooling, and GPU power for editing, rendering, and design.",
    price: "From ₱165,000",
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "AI Developer Tower",
    tone: "Memory-rich builds tuned for code, containers, local AI workflows, and multi-monitor work.",
    price: "From ₱205,000",
    image:
      "https://images.unsplash.com/photo-1555617778-02518510b9fa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "NexusBook Performance Laptop",
    tone: "Portable performance laptops selected for creators, students, founders, and hybrid teams.",
    price: "From ₱71,900",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85",
  },
];

const gallery = [
  {
    label: "Custom Gaming PC",
    image:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Creator Workstation",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Developer Tower",
    image:
      "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    label: "Laptop Collection",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85",
  },
];

const workloads: Workload[] = ["Gaming", "Creator", "Developer", "Business"];
const budgets: Budget[] = ["₱75K", "₱120K", "₱200K", "₱300K+"];
const performanceTargets: PerformanceTarget[] = [
  "Everyday",
  "Pro",
  "Ultra",
  "Maxed",
];
const formFactors: FormFactor[] = [
  "Custom PC",
  "Laptop",
  "Small Form",
  "Hybrid",
];

const whyNexusLab = [
  "Custom Build Planning",
  "Premium Components",
  "Laptop Recommendations",
  "Performance Tuning",
];

const testimonials = [
  {
    quote:
      "NexusLab built a quiet editing workstation that feels premium, fast, and perfectly matched to my workflow.",
    name: "Mara V.",
    role: "Video Producer",
  },
  {
    quote:
      "They translated messy specs into a clean custom PC build with the exact performance I needed.",
    name: "Elliot K.",
    role: "Engineering Lead",
  },
  {
    quote:
      "I needed a reliable laptop for travel and a desktop for home. NexusLab made the pair feel intentional.",
    name: "Nina S.",
    role: "Founder",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const [workload, setWorkload] = useState<Workload>("Developer");
  const [budget, setBudget] = useState<Budget>("₱120K");
  const [performanceTarget, setPerformanceTarget] =
    useState<PerformanceTarget>("Pro");
  const [formFactor, setFormFactor] = useState<FormFactor>("Custom PC");

  const recommendation = useMemo(() => {
    const systemByWorkload: Record<Workload, (typeof systems)[number]> = {
      Gaming: systems[0],
      Creator: systems[1],
      Developer: systems[2],
      Business: systems[3],
    };
    const budgetLift = budgets.indexOf(budget) * 3;
    const performanceLift = performanceTargets.indexOf(performanceTarget) * 3;
    const portabilityLift =
      formFactor === "Laptop" ? 12 : formFactor === "Hybrid" ? 8 : 2;
    const upgradeLift =
      formFactor === "Custom PC" ? 10 : formFactor === "Small Form" ? 6 : 3;

    return {
      system:
        formFactor === "Laptop" || formFactor === "Hybrid"
          ? systems[3]
          : systemByWorkload[workload],
      performance: Math.min(99, 78 + budgetLift + performanceLift),
      portability: Math.min(96, 68 + portabilityLift + budgetLift),
      upgradeability: Math.min(98, 72 + upgradeLift + performanceLift),
    };
  }, [budget, formFactor, performanceTarget, workload]);

  return (
    <main className={styles.index}>
      <section className={styles.hero}>
        <div className={styles.nav}>
          <nav className={styles.navLinks} aria-label="Primary navigation">
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
        </div>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Premium Custom Computer Studio</p>
          <h1>Performance PCs built your way.</h1>
          <p className={styles.heroText}>
            Custom-built PCs, performance workstations, gaming rigs, and
            carefully selected laptops for modern professionals.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#builds">
              Explore Builds
            </a>
            <a className={styles.secondaryButton} href="#builder">
              Configure My Build
            </a>
          </div>
        </div>

        <div className={styles.heroMetrics} aria-label="NexusLab highlights">
          <span>Custom PC builds</span>
          <span>Performance laptops</span>
          <span>1:1 configuration</span>
        </div>
      </section>

      <section className={styles.section} id="builds">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Featured Computer Builds</p>
          <h2>Configured for the way you actually use power.</h2>
        </div>
        <div className={styles.systemGrid}>
          {systems.map((system) => (
            <article className={styles.systemCard} key={system.name}>
              <div
                className={styles.cardImage}
                role="img"
                aria-label={`${system.name} computer`}
                style={{ backgroundImage: `url(${system.image})` }}
              />
              <div className={styles.cardBody}>
                <p>{system.price}</p>
                <h3>{system.name}</h3>
                <span>{system.tone}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.builder}`} id="builder">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Computer Builder Quiz</p>
          <h2>Get matched with a desktop or laptop configuration.</h2>
        </div>

        <div className={styles.builderShell}>
          <div className={styles.quizPanel}>
            <Question
              label="What will you use it for?"
              options={workloads}
              value={workload}
              onChange={setWorkload}
            />
            <Question
              label="What is your budget?"
              options={budgets}
              value={budget}
              onChange={setBudget}
            />
            <Question
              label="How much performance do you need?"
              options={performanceTargets}
              value={performanceTarget}
              onChange={setPerformanceTarget}
            />
            <Question
              label="Which form factor do you prefer?"
              options={formFactors}
              value={formFactor}
              onChange={setFormFactor}
            />
          </div>

          <aside className={styles.resultPanel}>
            <p className={styles.eyebrow}>Recommended System</p>
            <h3>{recommendation.system.name}</h3>
            <p>{recommendation.system.tone}</p>
            <Score
              label="Performance Score"
              value={recommendation.performance}
            />
            <Score
              label="Portability Score"
              value={recommendation.portability}
            />
            <Score
              label="Upgradeability Score"
              value={recommendation.upgradeability}
            />
          </aside>
        </div>
      </section>

      <section className={styles.section} id="gallery">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Build Inspiration Gallery</p>
          <h2>Custom desktops and laptops with clean performance intent.</h2>
        </div>
        <div className={styles.galleryGrid}>
          {gallery.map((item) => (
            <figure className={styles.galleryItem} key={item.label}>
              <img src={item.image} alt={`${item.label} inspiration`} />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.whySection}>
        <div>
          <p className={styles.eyebrow}>Why NexusLab</p>
          <h2>Premium components, clean builds, and practical advice.</h2>
        </div>
        <div className={styles.whyGrid}>
          {whyNexusLab.map((item, index) => (
            <article className={styles.whyItem} key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Build Stories</p>
          <h2>Machines tuned for real work, play, and mobility.</h2>
        </div>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial) => (
            <article className={styles.testimonial} key={testimonial.name}>
              <p>{testimonial.quote}</p>
              <span>
                {testimonial.name} / {testimonial.role}
              </span>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <a className={styles.brand} href="/">
            NexusLab
          </a>
          <p>Custom PCs and curated laptops for modern professionals.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="/">About NexusLab</a>
          <a href="#builds">Builds</a>
          <a href="/">Support</a>
          <a href="mailto:studio@nexuslab.example">Contact</a>
          <a href="/">Instagram</a>
          <a href="/">LinkedIn</a>
        </nav>
        {showForm && (
          <Form className={styles.shopForm} method="post" action="/auth/login">
            <label>
              <span>Shop domain</span>
              <input type="text" name="shop" placeholder="store.myshopify.com" />
            </label>
            <button type="submit">Log in</button>
          </Form>
        )}
      </footer>
    </main>
  );
}

function Question<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
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

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.score}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <meter min="0" max="100" value={value}>
        {value}
      </meter>
    </div>
  );
}
