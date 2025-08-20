"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";

// Zod validation schema (no subject field needed)
const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;
type FormErrors = Partial<Record<keyof ContactForm, string>>;

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form using Zod v4 (uses error.issues instead of error.errors)
  const validateForm = (): boolean => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      console.log("Validation error:", error); // Debug log

      if (error instanceof z.ZodError) {
        const formErrors: FormErrors = {};

        // Zod v4 uses 'issues' instead of 'errors'
        if (error.issues && Array.isArray(error.issues)) {
          error.issues.forEach((issue) => {
            if (issue.path && issue.path.length > 0) {
              const fieldName = issue.path[0] as keyof ContactForm;
              formErrors[fieldName] = issue.message;
            }
          });
        }
        setErrors(formErrors);
      } else {
        console.error("Non-Zod validation error:", error);
        setErrors({ name: "Validation failed. Please check your input." });
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form data before validation:", formData); // Debug log

    if (!validateForm()) {
      console.log("Validation failed, errors:", errors); // Debug log
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Add hardcoded subject for portfolio website emails
      const submissionData = {
        ...formData,
        subject: "Important: Website connection notification", // Hardcoded subject
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      console.log("API response:", result); // Debug log

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  return (
    <section id="contact" className="py-24 px-6">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="frosted-text text-4xl font-bold mb-4">Get In Touch</h2>
        <p className="frosted-text text-foreground/70 mb-8">
          I&apos;m currently open to new opportunities and collaborations. If
          you have a project in mind or just want to connect, feel free to reach
          out.
        </p>

        <motion.div
          className="glass-card p-12 space-y-8 rounded-3xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  disabled={isSubmitting}
                  className={`glass border-foreground/20 focus:border-primary py-8 px-6 text-xl rounded-3xl w-full shadow-inner hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300 min-h-[64px] ${
                    errors.name ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-sm text-red-500 text-left"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Field */}
              <div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  disabled={isSubmitting}
                  className={`glass border-foreground/20 focus:border-primary py-8 px-6 text-xl rounded-3xl w-full shadow-inner hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300 min-h-[64px] ${
                    errors.email ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-sm text-red-500 text-left"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Message Field */}
            <div>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows={6}
                disabled={isSubmitting}
                className={`glass border-foreground/20 focus:border-primary resize-none py-8 px-6 text-xl rounded-3xl w-full shadow-inner hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300 min-h-[128px] ${
                  errors.message ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              <AnimatePresence>
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-sm text-red-500 text-left"
                  >
                    {errors.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full button-glass hover:scale-105 transition-transform"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </div>
              )}
            </Button>

            {/* Status Messages */}
            <AnimatePresence>
              {submitStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-4 p-4 rounded-lg glass ${
                    submitStatus === "success"
                      ? "text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {submitStatus === "success" ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    {submitStatus === "success"
                      ? "Message sent successfully! Thank you, I'll get back to you soon."
                      : "Failed to send message. Please try again or email me directly."}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
