// /src/pages/Landing.tsx
"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
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
  Phone,
} from "lucide-react";
import Lottie from "lottie-react";
import wavingHand from "@/assets/hand_wave.json";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Lenis from "lenis";
import BackgroundCanvas from "@/components/effects/BackgroundCanvas";
import useMousePosition from "@/hooks/use-mouse-position";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Cursor from "@/components/effects/Cursor";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="min-h-screen relative flex items-center justify-center text-center overflow-hidden"
    >
      {/* Foreground: content (ensure it's above the giant background word) */}
      <div className="relative z-10 px-6">
        {/* Name with RGB animation */}
        <motion.h1
          className="text-5xl sm:text-5xl md:text-7xl font-bold mb-4 rgb-wave"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Kaustubh Pawar
        </motion.h1>

        {/* Headline with glow on Business Insights */}
        <motion.p
          className="text-lg md:text-xl text-foreground/70 mb-2 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Data-Driven{" "}
          <span className="business-glow font-semibold">Business Insights</span>
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="text-md md:text-lg text-foreground/60 mb-8 max-w-3xl mx-auto"
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
            asChild
            size="lg"
            className="button-glass hover:scale-105 transition-transform"
          >
            <a href="#projects">
              View My Work <Briefcase className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="glass-card hover:scale-105 transition-transform"
          >
            <a href="/assets/resume.pdf" download>
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
            glass-card bg-white/30 dark:bg-gray-900/40
            text-primary font-semibold text-base select-none shadow-md"
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
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-card max-w-4xl mx-auto p-8 sm:p-8"
        >
          <h2 className="text-4xl font-bold mb-6">About Kaustubh</h2>
          <p className="text-lg text-foreground/70 mb-6 leading-relaxed">
            A Computer Science graduate with a strong foundation in analytics,
            passionate about bridging the gap between data and business
            strategy. Currently preparing to join Warwick Business School for an
            MSc in Business Analytics. Skilled in data storytelling, dashboard
            development, and uncovering insights that influence real-world
            outcomes.
          </p>
          <p className="text-lg text-foreground/70 mb-6 leading-relaxed">
            I have a curious mind with a love for translating data into
            narratives that inspire action. My professional values are rooted in
            insight-driven decision-making, clear communication, and continuous
            learning.
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
        <h2 className="text-4xl font-bold text-center mb-12">Skills</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col items-center mb-4">
              <Code className="w-8 h-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-center">Technical</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill) => (
                <Badge key={skill} variant="secondary" className="glass">
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col items-center mb-4">
              <BarChart2 className="w-8 h-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-center">Business</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.business.map((skill) => (
                <Badge key={skill} variant="secondary" className="glass">
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex flex-col items-center mb-4">
              <BrainCircuit className="w-8 h-8 mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-center">Soft</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill) => (
                <Badge key={skill} variant="secondary" className="glass">
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
    title: "Stack Overflow Trend Analysis",
    description:
      "Analysed Stack Overflow data to identify trends in technology adoption. Identified top technologies, co-occurrence patterns, and predicted future trends.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    tags: ["Python", "Pandas", "Tableau", "Stack Exchange API"],
    link: "https://github.com/kaustubh-pawar",
  },
  {
    title: "Zomato Campus Pass Case Study",
    description:
      "A business case study involving market sizing, designing a pricing strategy, and modeling CAC vs LTV for a new student-focused product.",
    image:
      "https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&h=400&fit=crop",
    tags: [
      "Market Sizing",
      "Pricing Strategy",
      "CAC/LTV Analysis",
      "Business Modelling",
    ],
    link: "#",
  },
  {
    title: "Vax-Tracker (Android App)",
    description:
      "Developed an Android app to track vaccination schedules and provide reminders, integrating Firebase for real-time data storage and management.",
    image:
      "https://images.unsplash.com/photo-1609942593439-53948af4375c?w=600&h=400&fit=crop",
    tags: ["Android", "Firebase", "Java"],
    link: "https://github.com/kaustubh-pawar",
  },
  {
    title: "Secure Chat (Mobile App)",
    description:
      "Built a secure messaging app using React Native and AWS, implementing encryption for data security. Gained experience in data handling and system integration.",
    image:
      "https://images.unsplash.com/photo-1591696331111-8957a7414fed?w=600&h=400&fit=crop",
    tags: ["React Native", "AWS", "Encryption", "Security"],
    link: "https://github.com/kaustubh-pawar",
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const ProjectCard = ({ project }: { project: (typeof projects)[0] }) => (
    <div className="glass-card grid md:grid-cols-2 gap-8 items-center p-8 rounded-2xl overflow-hidden">
      <motion.div
        className="h-full w-full"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={project.image}
          alt={project.title}
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

  return (
    <section id="projects" className="py-24 px-6">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
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
          {projects.map((project, i) => {
            const scale = useTransform(
              scrollYProgress,
              [i / projects.length, (i + 0.8) / projects.length],
              [1, 0.9]
            );

            return (
              <motion.div
                key={project.title}
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
          })}
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
    role: "MSc Business Analytics",
    company: "Warwick Business School",
    period: "Offer Accepted, Starts Sep 2025",
    description:
      "Accepted an offer to pursue an MSc in Business Analytics at Warwick Business School. Eager to deepen my expertise in data analytics, machine learning, and their application to strategic business challenges.",
  },
];

/* ---------- helpers ---------- */
function extractYear(period: string) {
  const m = period.match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : 9999;
}

/* ---------- motion variants ---------- */
const leftVariant: Variants = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0 },
};
const rightVariant: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0 },
};
const upVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
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

  return (
    <section id="experience" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl relative">
        <h2 className="text-4xl font-bold text-center mb-14">
          Experience & Education
        </h2>

        {/* vertical line (desktop) */}
        <div className="hidden md:block absolute left-1/2 top-[5.5rem] -translate-x-1/2 w-[2px] h-[calc(100%-5.5rem)] bg-foreground/10 pointer-events-none" />

        <div className="flex flex-col gap-20">
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
                <div className="grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] items-center">
                  {/* LEFT */}
                  <div className="flex justify-end md:pr-8">
                    {isLeft && (
                      <motion.div
                        variants={variant}
                        initial="hidden"
                        animate={animateState}
                        transition={{ duration: 0.55, delay: idx * 0.06 }}
                        onClick={() => handleTap(globalIndex)}
                        className={`glass-card max-w-[360px] w-full p-6 md:p-8 rounded-2xl text-right cursor-pointer z-10 ${
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

                  {/* CENTER */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="hidden md:flex items-center justify-center w-full">
                      <div
                        className={`w-6 h-[2px] bg-foreground/10 ${
                          isLeft ? "mr-1" : "opacity-0"
                        }`}
                      />
                      <div className="w-10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary z-10 shadow" />
                      </div>
                      <div
                        className={`w-6 h-[2px] bg-foreground/10 ${
                          !isLeft ? "ml-1" : "opacity-0"
                        }`}
                      />
                    </div>
                    <div className="md:hidden w-full flex justify-center">
                      <div className="h-1 w-12 bg-foreground/10 rounded-full" />
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex justify-start md:pl-8">
                    {!isLeft && (
                      <motion.div
                        variants={variant}
                        initial="hidden"
                        animate={animateState}
                        transition={{ duration: 0.55, delay: idx * 0.06 }}
                        onClick={() => handleTap(globalIndex)}
                        className={`glass-card max-w-[360px] w-full p-6 md:p-8 rounded-2xl text-left cursor-pointer z-10 ${
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
              <div className="grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] items-center">
                <div className="hidden md:block" />

                <div className="flex items-center justify-center py-2">
                  <div className="w-10 flex items-center justify-center">
                    <div className="relative w-4 h-4">
                      <div className="absolute w-4 h-4 rounded-full bg-primary" />
                      <motion.div
                        className="absolute w-4 h-4 rounded-full border-2 border-primary"
                        animate={{ scale: [1, 4.5], opacity: [0, 0.7, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <motion.div
                        className="absolute w-4 h-4 rounded-full border-2 border-primary"
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
                </div>

                <div className="hidden md:block" />
              </div>

              <div className="w-full flex justify-center mt-10 md:mt-8">
                <motion.div
                  variants={upVariant}
                  initial="hidden"
                  animate={visibleIndex >= lastIndex ? "visible" : "hidden"}
                  transition={{ duration: 0.55, delay: lastIndex * 0.06 }}
                  onClick={() => handleTap(lastIndex)}
                  className={`glass-card max-w-[360px] w-full p-6 md:p-8 rounded-2xl text-center relative z-10 cursor-pointer ${
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
  return (
    <section id="contact" className="py-24 px-6">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
        <p className="text-foreground/70 mb-8">
          I'm currently open to new opportunities and collaborations. If you
          have a project in mind or just want to connect, feel free to reach
          out.
        </p>

        <motion.div
          className="glass-card p-12 space-y-8 rounded-3xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                placeholder="Your Name"
                className="glass border-foreground/20 focus:border-primary py-8 px-6 text-xl rounded-3xl w-full shadow-inner hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300 min-h-[64px]"
              />
              <Input
                type="email"
                placeholder="Your Email"
                className="glass border-foreground/20 focus:border-primary py-8 px-6 text-xl rounded-3xl w-full shadow-inner hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300 min-h-[64px]"
              />
            </div>
            <Textarea
              placeholder="Your Message"
              rows={6}
              className="glass border-foreground/20 focus:border-primary resize-none py-8 px-6 text-xl rounded-3xl w-full shadow-inner hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300 min-h-[128px]"
            />
            <Button
              size="lg"
              className="w-full button-glass hover:scale-105 transition-transform"
            >
              Send Message
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
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
          title="Click to copy email"
        >
          <Clipboard className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          <span className="underline group-hover:text-primary">{email}</span>

          {/* Toast */}
          {copied && (
            <span className="absolute left-full ml-2 top-0 text-primary text-xs animate-pulse whitespace-nowrap">
              Copied!
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
          href="https://www.linkedin.com/in/kaustubh-pawar-344a31277/"
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
  const [bottomOffset, setBottomOffset] = useState(32); // px from bottom

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);

      // Check for footer intersection
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const overlap = Math.max(0, window.innerHeight - footerRect.top + 16);
        setBottomOffset(overlap ? overlap : 32);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const smoothScrollToTop = (duration = 600) => {
    const start = window.scrollY;
    const startTime = performance.now();
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, Math.round(start * (1 - eased)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const handleClick = () => {
    const lenis = (window as any).lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(0);
    } else {
      smoothScrollToTop(700);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          aria-label="Scroll to top"
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed right-6 z-50 p-3 rounded-full glass shadow-lg focus:outline-none ring-0"
          style={{
            bottom: bottomOffset,
            cursor: hovered ? "pointer" : "default",
          }}
        >
          <motion.div
            animate={hovered ? { y: [0, -6, 0] } : { y: 0 }}
            transition={
              hovered
                ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
            className="flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5 text-foreground" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function Landing() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [themeValue, setThemeValue] = useState(0);

  // Client-side only theme initialization
  useEffect(() => {
    const isDark =
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setThemeValue(isDark ? 1 : 0);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Cursor, ScrollProgressBar, ThemeToggleButton, BackgroundCanvas */}
      <Cursor />
      <ScrollProgressBar />
      <ThemeToggleButton />
      {/* <BackgroundCanvas /> */}

      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
