"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ArrowUpRight,
  Download,
  Briefcase,
  ArrowUp,
  BarChart2,
  BrainCircuit,
  Code,
  Clipboard,
} from "lucide-react";
import Lottie from "lottie-react";
import wavingHand from "@/assets/hand_wave.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Cursor from "@/components/effects/Cursor";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import Image from "next/image";
import { destroyLenis, initLenis } from "@/lib/lenis";
import ContactForm from "@/components/ContactForm";

const HeroSection = () => {
  const { scrollTo } = useLenisScroll();

  return (
    <section
      id="home"
      className="min-h-screen relative flex items-center justify-center text-center overflow-hidden"
    >
      {/* Foreground: content (ensure it's above the giant background word) */}
      <div className="relative z-10 px-6">
        {/* Name with RGB animation */}
        <motion.h1
          className="business-glow text-5xl sm:text-5xl md:text-7xl font-bold mb-4 text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Kaustubh Pawar
        </motion.h1>

        {/* Headline with glow on Business Insights */}
        <motion.p
          className="text-lg md:text-xl text-foreground mb-2 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Data-Driven <span className="rgb-wave">Business Insights</span>
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="text-md md:text-lg text-foreground mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          I translate complex data into compelling narratives that drive
          strategic growth and create business value.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="button-glass hover:scale-105 transition-transform"
            onClick={() =>
              scrollTo("#projects", {
                offset: -80,
                duration: 1.2,
                easing: (t: number) =>
                  Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              })
            }
          >
            View My Work <Briefcase className="w-4 h-4 ml-2" />
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="glass-card hover:scale-105 transition-transform"
          >
            <a href="/resume.pdf" download>
              Resume <Download className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>

      {/* Giant faint background name anchored to the hero bottom (behind foreground) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden z-0">
        <div
          className="hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[10rem] leading-none font-black text-transparent select-none sm:block lg:text-[16rem]"
          style={{ marginBottom: "-2.5rem" }}
          aria-hidden="true"
        >
          Kaustubh
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobileActive, setIsMobileActive] = useState(false);

  // Check if current screen is mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) videoRef.current.play();
  };
  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Mobile tap handler
  const handleMobileTap = () => {
    if (isMobile) {
      setIsMobileActive((prev) => !prev);
      if (videoRef.current) {
        if (!isMobileActive) videoRef.current.play();
        else {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }
  };

  // Hi Flip Badge
  const HiFlipBadge = () => {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => setFlipped((prev) => !prev), 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="absolute bottom-6 left-8 w-12 h-12 perspective">
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front side */}
          <div
            className="absolute w-full h-full rounded-full flex items-center justify-center
            glass-card 
            text-primary font-semibold select-none shadow-md"
            style={{ backfaceVisibility: "hidden" }}
          >
            Hi
          </div>

          {/* Back side */}
          <div
            className="absolute w-full h-full rounded-full flex items-center justify-center
            glass-card bg-white/20 dark:bg-gray-800/30 shadow-md"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Lottie
              animationData={wavingHand}
              loop
              autoplay
              style={{ width: "70%", height: "70%" }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="about" className="py-24 px-6">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE - ABOUT TEXT */}
        <motion.div
          initial="hidden"
          whileInView={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.001 }} /* snappy like buttons/focus chips */
          viewport={{ once: true }}
          className="glass-card max-w-4xl mx-auto p-8 sm:p-8"
        >
          <h2 className="text-4xl font-bold mb-6">About Kaustubh</h2>
            <p className="text-lg text-foreground/70 mb-6 leading-relaxed">
  A Computer Science graduate with a strong foundation in analytics, I’m currently pursuing my MSc in Business Analytics at <strong>Warwick Business School</strong>. My passion lies in bridging the gap between data and business strategy — transforming complex datasets into insights that drive informed, impactful decisions.
</p>

<p className="text-lg text-foreground/70 mb-6 leading-relaxed">
  Skilled in <strong>data storytelling</strong>, <strong>dashboard design</strong>, and <strong>analytical problem-solving</strong>, I enjoy uncovering patterns that reveal opportunities and influence strategic outcomes. I believe great analytics isn’t just about numbers — it’s about <strong>clarity, context, and communication</strong>.
</p>

<p className="text-lg text-foreground/70 mb-6 leading-relaxed">
  With a curious mind and a commitment to continuous learning, I aim to combine technical expertise with business acumen to help organisations make smarter, insight-driven decisions.
</p>
          
        </motion.div>

        {/* RIGHT SIDE - MEMOJI + FOCUS AREAS */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative flex flex-col items-center">
            {/* Hover hint only for desktop */}
            {!isMobile && (
              <span className="mb-2 text-xs text-foreground/70">
                Hover for a smile
              </span>
            )}

            {/* Memoji Container */}
            <div
              className={`relative rounded-full w-64 h-64 overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-500
                ${
                  isMobile
                    ? isMobileActive
                      ? "glass-card"
                      : "bg-white animate-pulse" // Pulse animation for tappable hint
                    : "glass-card"
                }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMobileTap}
            >
              <video
                ref={videoRef}
                src="/memoji-wave.webm"
                muted
                playsInline
                className="w-full h-full object-cover"
                preload="metadata"
                autoPlay={false}
                loop
              />
              <div className="z-20">
                <HiFlipBadge />
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="glass-card p-6 rounded-2xl w-full">
            <h3 className="text-2xl font-bold mb-4 gradient-text text-center">
              Focus Areas
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Data Analysis",
                "Business Strategy",
                "Dashboard Development",
                "Data Storytelling",
              ].map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="glass text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const SkillsSection = () => {
  const skills = {
    technical: [
      "Tableau",
      "Power BI",
      "Python",
      "SQL",
      "Excel",
      "Google Sheets",
      "Google Analytics",
      "R",
      "Java",
      "HTML/CSS/JS",
      "AWS",
      "Android Studio",
    ],
    business: [
      "Market Analysis",
      "Business Modelling",
      "Data Storytelling",
      "Pricing Strategy",
      "Trend Analysis",
      "Data Reporting",
    ],
    soft: [
      "Communication",
      "Critical Thinking",
      "Problem-Solving",
      "Analytical Reasoning",
      "Stakeholder Management",
      "Root Cause Analysis",
    ],
  };

  return (
    <section id="skills" className="py-24 px-6">
      <div className="container mx-auto">
        <h2 className="frosted-text text-4xl font-bold text-center mb-12">
          Skills
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Technical */}
          <motion.div
            initial="hidden"
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.01 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col items-center mb-4">
              <Code className="w-8 h-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-center">Technical</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill, i) => (
                <Badge
                  key={`${skill}-${i}`}
                  variant="secondary"
                  className="glass"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Business */}
          <motion.div
            initial="hidden"
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.01 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col items-center mb-4">
              <BarChart2 className="w-8 h-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-center">Business</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.business.map((skill, i) => (
                <Badge
                  key={`${skill}-${i}`}
                  variant="secondary"
                  className="glass"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Soft */}
          <motion.div
            initial="hidden"
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.01 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col items-center mb-4">
              <BrainCircuit className="w-8 h-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-center">Soft</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill, i) => (
                <Badge
                  key={`${skill}-${i}`}
                  variant="secondary"
                  className="glass"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const projects = [
  {
    title: "Project Alpha",
    description:
      "A cutting-edge project exploring new technologies and innovative solutions in a simulated environment.",
    image:
      "https://images.unsplash.com/photo-1581091012184-7b4f9f9c9b6c?w=600&h=400&fit=crop",
    tags: ["Technology", "Innovation", "Simulation"],
    link: "#",
  },
  {
    title: "Project Beta",
    description:
      "A business analysis project that focuses on market trends, user behavior, and strategic decision-making.",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop",
    tags: ["Business", "Analytics", "Market Research"],
    link: "#",
  },
  {
    title: "Project Gamma",
    description:
      "A mobile app prototype designed to improve user experience and provide real-time notifications.",
    image:
      "https://images.unsplash.com/photo-1581093448793-6b44d7d676b2?w=600&h=400&fit=crop",
    tags: ["Mobile App", "UI/UX", "Notifications"],
    link: "#",
  },
  {
    title: "Project Delta",
    description:
      "A secure messaging application that demonstrates encryption and cloud integration for safe communication.",
    image:
      "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=600&h=400&fit=crop",
    tags: ["Security", "Cloud", "Encryption"],
    link: "#",
  },
];

const ProjectCard = ({ project }: { project: (typeof projects)[0] }) => (
  <div className="glass-card grid md:grid-cols-2 gap-8 items-center p-8 rounded-2xl overflow-hidden">
    <motion.div
      className="h-full w-full"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src={project.image}
        alt={project.title}
        width={600}
        height={400}
        className="rounded-lg object-cover w-full h-[300px] md:h-[400px]"
      />
    </motion.div>
    <div>
      <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
      <p className="text-foreground/70 mb-6">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="glass">
            {tag}
          </Badge>
        ))}
      </div>
      <Button asChild variant="outline" className="glass-card">
        <a href={project.link} target="_blank" rel="noopener noreferrer">
          View Project <ArrowUpRight className="w-4 h-4 ml-2" />
        </a>
      </Button>
    </div>
  </div>
);

const StickyProjectCard = ({
  project,
  index,
  scrollYProgress,
  total,
}: {
  project: (typeof projects)[0];
  index: number;
  scrollYProgress: import("framer-motion").MotionValue<number>; // Fixed the any type
  total: number;
}) => {
  const scale = useTransform(
    scrollYProgress,
    [index / total, (index + 0.8) / total],
    [1, 0.9]
  );

  return (
    <motion.div
      style={{
        position: "sticky",
        top: "6rem",
        scale,
      }}
      className="pt-4"
    >
      <ProjectCard project={project} />
    </motion.div>
  );
};

const ProjectsSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="projects" className="py-24 px-6">
      <div className="container mx-auto">
        <h2 className="frosted-text text-4xl font-bold text-center mb-12">
          Featured Projects
        </h2>

        {/* Mobile Layout: Simple List */}
        <div className="grid md:hidden gap-12">
          {projects.map((project) => (
            <ProjectCard project={project} key={project.title} />
          ))}
        </div>

        {/* Desktop Layout: Sticky Scroll */}
        <div ref={ref} className="hidden md:block relative h-[300vh]">
          {projects.map((project, i) => (
            <StickyProjectCard
              key={project.title}
              project={project}
              index={i}
              scrollYProgress={scrollYProgress}
              total={projects.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
};

const EXPERIENCES: Experience[] = [
  {
    role: "B.Sc. Computer Science",
    company: "D.G. Ruparel College",
    period: "Graduated May 2023",
    description:
      "Graduated with a B.Sc. in Computer Science, achieving an 8.75/10.0 GPA. Developed a strong foundation in programming, data structures, and algorithms through rigorous coursework and practical projects.",
  },
  {
    role: "Product Support Associate",
    company: "Newfold Digital",
    period: "May 2023 - June 2024",
    description:
      "Resolved complex technical issues for customers across a wide range of products, including domains, DNS, and web hosting. Collaborated with engineering and product teams to identify and address root causes of customer problems. Recognized for outstanding performance with MVP and Manager's awards.",
  },
  {
    role: "M.Sc. Business Analytics",
    company: "Warwick Business School",
    period: "September 2025 – Present",
    description:
      "Currently pursuing a Master’s in Business Analytics, focusing on data-driven decision-making, predictive analytics, and strategic problem-solving.",
  },
];

/* ---------- helpers ---------- */
function extractYear(period: string) {
  const m = period.match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : 9999;
}

/* ---------- motion variants (no opacity in hidden/visible) ---------- */
const leftVariant: Variants = {
  hidden: { x: -36 },
  visible: { x: 0 },
};
const rightVariant: Variants = {
  hidden: { x: 36 },
  visible: { x: 0 },
};
const upVariant: Variants = {
  hidden: { y: 28 },
  visible: { y: 0 },
};

function ExperienceSection() {
  // sort ascending by year (earliest at top)
  const experiences = [...EXPERIENCES].sort(
    (a, b) => extractYear(a.period) - extractYear(b.period)
  );
  const lastIndex = experiences.length - 1;

  // split items (non-last) and last
  const items = experiences.slice(0, lastIndex);
  const last = experiences[lastIndex];

  const [visibleIndex, setVisibleIndex] = useState(-1);
  const observerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTap, setActiveTap] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idxAttr = entry.target.getAttribute("data-index");
          if (!idxAttr) return;
          const idx = Number(idxAttr);
          if (entry.isIntersecting && idx === visibleIndex + 1) {
            setTimeout(() => setVisibleIndex(idx), 220);
          }
        });
      },
      { threshold: 0.55 }
    );

    observerRefs.current.forEach((el) => {
      if (el) obs.observe(el as Element);
    });

    return () => obs.disconnect();
  }, [visibleIndex]);

  const handleTap = (idx: number) => {
    setActiveTap(idx);
    setTimeout(() => setActiveTap(null), 450);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // Adjust this subtraction if you change top offset of the line
      const height = containerRef.current.offsetHeight - 390; // 5.5rem = 88px
      setLineHeight(height > 0 ? height : 0);
    }
  }, [items.length]);

  return (
    <section id="experience" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl relative">
        <h2 className="frosted-text text-4xl font-bold text-center mb-14">
          Experience & Education
        </h2>

        {/* Vertical line with dynamic height */}
        <div
          className="hidden md:block absolute left-1/2 top-[12.5rem] -translate-x-1/2 w-[2px] bg-foreground/10 pointer-events-none"
          style={{ height: lineHeight }}
        />

        {/* Timeline container with ref */}
        <div className="flex flex-col gap-20" ref={containerRef}>
          {items.map((exp, idx) => {
            const globalIndex = idx;
            const isLeft = idx % 2 === 0;
            const variant = isLeft ? leftVariant : rightVariant;
            const animateState =
              visibleIndex >= globalIndex ? "visible" : "hidden";

            return (
              <div
                key={globalIndex}
                ref={(el) => {
                  if (el) observerRefs.current[globalIndex] = el;
                }}
                data-index={globalIndex}
                className="relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] items-center">
                  {/* LEFT */}
                  <div className="flex justify-end md:pr-8">
                    {isLeft && (
                      <motion.div
                        initial={false} // avoid initial hidden frame
                        variants={variant}
                        animate={animateState}
                        transition={{ duration: 0.55, delay: idx * 0.06 }}
                        onClick={() => handleTap(globalIndex)}
                        className={`glass-card will-change-transform will-change-filter [backface-visibility:hidden] [transform:translateZ(0)]
                          max-w-[360px] w-full p-6 md:p-8 rounded-2xl text-right cursor-pointer z-10 ${
                            activeTap === globalIndex
                              ? "scale-105 shadow-2xl"
                              : "hover:scale-[1.03] hover:shadow-xl transition-transform duration-300"
                          }`}
                      >
                        <p className="text-sm text-foreground/60 mb-1">
                          {exp.period}
                        </p>
                        <h3 className="text-xl font-bold">{exp.role}</h3>
                        <p className="text-primary font-semibold">
                          {exp.company}
                        </p>
                        <p className="text-foreground/70 mt-2">
                          {exp.description}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* CENTER (line + dot) */}
                  <div className="flex flex-col items-center justify-center relative py-2">
                    <div className="w-4 h-4 rounded-full bg-primary z-10 shadow" />
                  </div>

                  {/* RIGHT */}
                  <div className="flex justify-start md:pl-8">
                    {!isLeft && (
                      <motion.div
                        initial={false} // avoid initial hidden frame
                        variants={variant}
                        animate={animateState}
                        transition={{ duration: 0.55, delay: idx * 0.06 }}
                        onClick={() => handleTap(globalIndex)}
                        className={`glass-card will-change-transform will-change-filter [backface-visibility:hidden] [transform:translateZ(0)]
                          max-w-[360px] w-full p-6 md:p-8 rounded-2xl text-left cursor-pointer z-10 ${
                            activeTap === globalIndex
                              ? "scale-105 shadow-2xl"
                              : "hover:scale-[1.03] hover:shadow-xl transition-transform duration-300"
                          }`}
                      >
                        <p className="text-sm text-foreground/60 mb-1">
                          {exp.period}
                        </p>
                        <h3 className="text-xl font-bold">{exp.role}</h3>
                        <p className="text-primary font-semibold">
                          {exp.company}
                        </p>
                        <p className="text-foreground/70 mt-2">
                          {exp.description}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* LAST ITEM */}
          {last && (
            <div
              data-index={lastIndex}
              ref={(el) => {
                if (el) observerRefs.current[lastIndex] = el;
              }}
              className="relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] items-center">
                <div className="hidden md:block" />

                <div className="flex items-center justify-center py-2">
                  {/* Proper centering with flex container */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary z-20 shadow" />

                    {/* Ripple animations - positioned to center on the dot */}
                    <motion.div
                      className="absolute w-4 h-4 rounded-full border-2 border-primary z-10"
                      style={{
                        top: "0%",
                        left: "0%",
                        transformOrigin: "center",
                        transform: "translate(-50%, -50%)",
                      }}
                      animate={{ scale: [1, 4.5], opacity: [0, 0.7, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.div
                      className="absolute w-4 h-4 rounded-full border-2 border-primary z-10"
                      style={{
                        top: "0%",
                        left: "0%",
                        transformOrigin: "center",
                        transform: "translate(-50%, -50%)",
                      }}
                      animate={{ scale: [1, 4.5], opacity: [0, 0.7, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 1.5,
                      }}
                    />
                  </div>
                </div>

                <div className="hidden md:block" />
              </div>

              <div className="w-full flex justify-center mt-10 md:mt-8">
                <motion.div
                  initial={false} // avoid initial hidden frame
                  variants={upVariant}
                  animate={visibleIndex >= lastIndex ? "visible" : undefined}
                  transition={{ duration: 0.55, delay: lastIndex * 0.06 }}
                  onClick={() => handleTap(lastIndex)}
                  className={`glass-card will-change-transform will-change-filter [backface-visibility:hidden] [transform:translateZ(0)]
                    max-w-[360px] w-full p-6 md:p-8 rounded-2xl text-center relative z-10 cursor-pointer ${
                      activeTap === lastIndex
                        ? "scale-105 shadow-2xl"
                        : "hover:scale-[1.03] hover:shadow-xl transition-transform duration-300"
                    }`}
                >
                  <p className="text-sm text-foreground/60 mb-1">
                    {last.period}
                  </p>
                  <h3 className="text-xl font-bold">{last.role}</h3>
                  <p className="text-primary font-semibold">{last.company}</p>
                  <p className="text-foreground/70 mt-2">{last.description}</p>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const ContactSection = () => {
  return <ContactForm />;
};

const Footer = () => {
  const email = "kaustubhpawar500@gmail.com";
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Toast disappears after 1.5s
  };

  return (
    <footer className=" mx-6 mb-6 p-3 rounded-2xl flex items-center justify-between text-sm border-[1px] border-white/10 backdrop-blur-lg">
      {/* Left: Email & Phone */}
      <div className="flex flex-col gap-2 relative">
        <div
          className="flex items-center gap-2 cursor-pointer group relative"
          onClick={copyEmail}
          title="Click to copy email to clipboard"
        >
          <Clipboard className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          {/* Toast */}
          {copied && (
            <span className="absolute left-full ml-1 top-0 text-primary animate-pulse whitespace-nowrap">
              Email Copied!
            </span>
          )}
        </div>

        {/* Phone
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => (window.location.href = "tel:+91XXXXXXXXXX")}
          title="Call me"
        >
          <Phone className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          <span className="underline group-hover:text-primary">
            +91 XXXXX XXXXX
          </span>
        </div> */}
      </div>

      {/* Center: Copyright */}
      <div className="text-center text-foreground/60 text-xs ">
        &copy; {new Date().getFullYear()} Kaustubh Pawar. Crafted with passion.
      </div>

      {/* Right: Social Links */}
      <div className="flex gap-8 text-lg">
        <a
          href={`mailto:${email}`}
          className="hover:text-primary transition-colors"
          title="Email"
        >
          <Mail />
        </a>
        <a
          href="https://www.linkedin.com/in/kaustubh-pawar22/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          title="LinkedIn"
        >
          <Linkedin />
        </a>
        <a
          href="https://github.com/KaustubhPawar22"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          title="Github"
        >
          <Github />
        </a>
        <a
          href="https://public.tableau.com/app/profile/kaustubh.pawar22"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          title="Tableau"
        >
          <BarChart2 />
        </a>
      </div>
    </footer>
  );
};

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(32);
  const { scrollToTop } = useLenisScroll();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);

      // Improved footer intersection logic
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const buttonHeight = 56; // Approximate button height with padding
        const buffer = 24;

        if (footerRect.top <= viewportHeight) {
          // Calculate how much the button should move up
          const footerVisible = viewportHeight - footerRect.top;
          const newOffset = Math.max(32, footerVisible + buffer);
          setBottomOffset(newOffset);
        } else {
          setBottomOffset(32);
        }
      }
    };

    // Use throttled scroll for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onScroll, 16); // ~60fps
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    onScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleClick = () => {
    if (scrollToTop) {
      scrollToTop({
        duration: 0.5, // Slightly longer for ultra-smooth feel
        easing: (t: number) => {
          // Very smooth ease-out
          return 1 - Math.pow(1 - t, 3);
        },
      });
    } else {
      // Enhanced fallback with even smoother animation
      const start = window.scrollY;
      const startTime = performance.now();
      const duration = 1800;

      const smoothEase = (t: number) => {
        // Sine ease-out for very natural feeling
        return Math.sin((t * Math.PI) / 2);
      };

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = smoothEase(progress);

        window.scrollTo(0, Math.round(start * (1 - eased)));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed right-6 z-50"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            bottom: bottomOffset,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.2, ease: "easeInOut" },
            bottom: {
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            },
          }}
        >
          {/* Rest of your button JSX remains the same */}
          <motion.button
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ y: 40, scale: 0.5, rotate: -45 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: 40, scale: 0.5, rotate: 45 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            whileHover={{
              scale: 1.1,
              y: -3,
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
              transition: { type: "spring", stiffness: 500, damping: 20 },
            }}
            whileTap={{
              scale: 0.9,
              transition: { type: "spring", stiffness: 700, damping: 30 },
            }}
            className="p-4 rounded-full glass shadow-lg focus:outline-none ring-0 group backdrop-blur-md border border-white/10"
          >
            <motion.div
              animate={{
                rotate: hovered ? 360 : 0,
                y: hovered ? -1 : 0,
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
            >
              <ArrowUp className="h-5 w-5 text-foreground group-hover:text-primary transition-colors duration-200" />
            </motion.div>

            {hovered && (
              <motion.div
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-primary/40"
              />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Landing() {
  useEffect(() => {
    // Remove this line if not using it:
    // const lenisInstance = initLenis();

    // Or use it properly:
    initLenis();

    return () => {
      destroyLenis();
    };
  }, []);
  return (
    <main className="relative">
      <Cursor />
      <ScrollProgressBar />
      <ThemeToggleButton />
      {/* <BackgroundCanvas /> */}

      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
      <Footer />

      <ScrollToTopButton />
    </main>
  );
}
