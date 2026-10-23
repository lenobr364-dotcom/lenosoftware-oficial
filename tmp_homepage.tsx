"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  Globe2,
  Layers3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from "lucide-react";
import { FormEvent, useState } from "react";

const metrics = [
  { value: "98.7%", label: "On-time delivery" },
  { value: "24/7", label: "Operational oversight" },
  { value: "120+", label: "Projects delivered" },
  { value: "87%", label: "Client retention" },
];

const partners = [
  "Apex Bio",
  "Luma Systems",
  "NovaChem",
  "Atlas Labs",
  "BluePeak",
  "NorthGrid",
];

const services = [
  {
    icon: Workflow,
    title: "Global licensing architecture",
    text: "Scalable systems designed to support international formula licensing with governance, traceability, and control.",
  },
  {
    icon: Bot,
    title: "Automation & intelligent workflows",
    text: "AI-enabled processes that reduce friction, improve accuracy, and accelerate strategic execution.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & risk governance",
    text: "Regulatory alignment, audit readiness, and security frameworks built into the operating model.",
  },
];

const technologyPillars = [
  {
    icon: Layers3,
    title: "Executive-grade user experience",
    text: "Elegant, high-performance interfaces engineered for trust, clarity, and confident decision-making.",
  },
  {
    icon: BarChart3,
    title: "Performance intelligence",
    text: "Real-time analytics, portfolio visibility, and operational insight that support growth at scale.",
  },
  {
    icon: Globe2,
    title: "International scalability",
    text: "Infrastructure built for cross-border operations, compliance complexity, and multi-market expansion.",
  },
];

const workflow = [
  "Strategic discovery and market alignment",
  "Experience design and validation",
  "Implementation with governance and quality controls",
  "Continuous optimization and enterprise support",
];

const testimonials = [
  {
    quote:
      "ChemVault Global helped us redesign our licensing model with exceptional precision, strategic clarity, and long-term scalability.",
    author: "Marcos Ribeiro",
    role: "CEO, NovaPulse",
  },
  {
    quote:
      "The execution was outstanding. The platform delivered the performance, trust, and operational visibility we needed to expand confidently.",
    author: "Helena Santos",
    role: "COO, BlueNorth",
  },
  {
    quote:
      "What stood out most was the combination of engineering excellence and board-level thinking. It was a true strategic partnership.",
    author: "Daniel Torres",
    role: "VP of Technology, Atlas Ventures",
  },
];

const pricing = [
  {
    name: "Foundation",
    price: "$ 7.5k",
    description: "Ideal for early-stage validation, MVP setup, and strategic market launch planning.",
    features: [
      "Premium landing experience",
      "Operational dashboard",
      "Core integrations",
      "Priority support",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: "$ 18k",
    description: "Designed for organizations scaling high-value portfolios with operational precision.",
    features: [
      "Scalable architecture",
      "Workflow automation",
      "Advanced reporting",
      "Full implementation support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for multinational operations, regulatory complexity, and long-term strategy.",
    features: [
      "Dedicated infrastructure",
      "Advanced compliance controls",
      "24/7 support",
      "Strategic roadmap advisory",
    ],
    featured: false,
  },
];

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    project: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_16%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_18%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:46px_46px] opacity-10" />
      <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-300/8 blur-3xl" />
      <div className="absolute right-0 top-32 h-[260px] w-[260px] rounded-full bg-white/5 blur-3xl" />

      <header className="relative z-20 mx-auto max-w-7xl px-6 pt-6 lg:px-10">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10">
              <Sparkles className="h-5 w-5 text-amber-100" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-100/90">
              ChemVault Global
            </span>
          </div>

          <div className="hidden items-center gap-6 text-sm text-white/65 md:flex">
            <a href="#services" className="transition hover:text-white">Services</a>
            <a href="#technology" className="transition hover:text-white">Technology</a>
            <a href="#clients" className="transition hover:text-white">Clients</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-gradient-to-r from-amber-300/90 to-yellow-500/80 px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            Contact us
            <ArrowRight className="h-4 w-4" />
          </a>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-14 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-amber-100/80">
              <Building2 className="h-3.5 w-3.5" />
              Global Formula Licensing & Innovation
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-none tracking-tight text-white md:text-7xl">
              Strategic infrastructure for high-value formula ecosystems.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              ChemVault Global delivers enterprise-grade platforms for licensing, compliance, visibility, and global expansion of premium chemical and formulation assets.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/15 transition hover:brightness-110"
              >
                Request a consultation
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#technology"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/8"
              >
                Explore capabilities
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/60">
              {[
                "Global licensing",
                "Governance",
                "Automation",
                "Portfolio intelligence",
              ].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-amber-300/10 via-transparent to-white/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Executive dashboard</p>
                  <h2 className="mt-2 text-2xl font-semibold">Operational intelligence</h2>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                  Live
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/50">Global performance</p>
                    <p className="mt-1 text-4xl font-semibold">91.4%</p>
                  </div>
                  <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                    +16.8%
                  </span>
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/5">
                  <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-amber-300 to-yellow-500" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {metrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-300/15 bg-gradient-to-r from-amber-300/10 to-transparent p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/50">Next milestone</p>
                    <p className="mt-1 text-sm font-semibold text-white">Global licensing expansion</p>
                  </div>
                  <button className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
                    Review
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 text-center text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <span>TRUSTED BY GLOBAL OPERATORS, STRATEGIC PARTNERS, AND ENTERPRISE TEAMS</span>
            <div className="flex items-center justify-center gap-6">
              <span>Fintech</span>
              <span>HealthTech</span>
              <span>Logistics</span>
              <span>Enterprise</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
            >
              <p className="text-4xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-white/50">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="clients" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-3 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Clients & partners</p>
            <h2 className="text-3xl font-semibold text-white">Trusted by organizations shaping the future</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((partner, index) => (
              <div
                key={partner}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-center text-sm text-white/65 backdrop-blur-xl"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/10 text-amber-100">
                  {index + 1}
                </span>
                <p className="mt-3 font-medium">{partner}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="services" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Services</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">Enterprise solutions for complex global operations</h2>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {services.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-300/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="technology" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Technology</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Modern infrastructure for high-impact products</h2>
              <p className="mt-4 text-sm leading-6 text-white/65">
                We combine software engineering, automation, and operational insight to deliver reliable, secure, and high-performance platforms.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Secure cloud-native architecture",
                  "Observability and CI/CD excellence",
                  "Seamless integrations with critical systems",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/75">
                    <CheckCircle2 className="h-4 w-4 text-amber-200" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Frontend", value: "React / Next.js" },
                { label: "Backend", value: "Robust APIs" },
                { label: "Data", value: "Analytics & insight" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-5 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{item.label}</p>
                  <p className="mt-3 text-base font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {technologyPillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="process" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Process</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">From strategy to execution with precision</h2>
            </div>

            <div className="space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/10 text-sm font-semibold text-amber-100">
                    0{index + 1}
                  </span>
                  <span className="text-sm text-white/75">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Testimonials</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">What our partners say</h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex gap-1 text-amber-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75">“{item.quote}”</p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-semibold text-white">{item.author}</p>
                <p className="text-sm text-white/50">{item.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Pricing</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">Choose the right level for your strategy</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricing.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`rounded-3xl border p-6 backdrop-blur-xl ${
                plan.featured
                  ? "border-amber-300/25 bg-gradient-to-b from-amber-300/10 to-white/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">{plan.name}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-semibold text-white">{plan.price}</span>
                <span className="pb-1 text-sm text-white/45">/ project</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/75">
                    <CheckCircle2 className="h-4 w-4 text-amber-200" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-black"
                    : "border border-white/10 bg-black/25 text-white hover:bg-white/5"
                }`}
              >
                Request proposal
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Contact</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Build the next stage of your platform</h2>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Share your priorities and our team will map the best strategy for your global operation.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/75">
                <Mail className="h-4 w-4 text-amber-200" />
                <span>contact@chemvaultglobal.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/75">
                <Phone className="h-4 w-4 text-amber-200" />
                <span>+55 (11) 99999-0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/75">
                <MapPin className="h-4 w-4 text-amber-200" />
                <span>São Paulo · New York · Frankfurt</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[32px] border border-amber-300/15 bg-gradient-to-br from-amber-300/10 via-white/5 to-transparent p-8 backdrop-blur-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-white/65">Name</span>
                  <input
                    value={formData.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/30"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-white/65">Business email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/30"
                    placeholder="name@company.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-white/65">Company</span>
                  <input
                    value={formData.company}
                    onChange={(event) => handleChange("company", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/30"
                    placeholder="Company name"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-white/65">Project type</span>
                  <input
                    value={formData.project}
                    onChange={(event) => handleChange("project", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/30"
                    placeholder="Licensing, platform, automation..."
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-white/65">Tell us about your challenge</span>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/30"
                  placeholder="Share your goals, timeline, and technical requirements."
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 px-6 py-3.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Send inquiry
                <ArrowRight className="h-4 w-4" />
              </button>

              {submitted && (
                <p className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
                  Thank you — your message has been received and our team will be in touch shortly.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
