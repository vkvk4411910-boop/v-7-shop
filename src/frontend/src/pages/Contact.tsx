import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContactForm } from "@/hooks/useBackend";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

const INFO_CARDS = [
  {
    icon: MapPin,
    title: "Our Location",
    value: "123 V-7 Shop Lane, Mumbai, India 400001",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Mail,
    title: "Email Us",
    value: "support@v7shop.com",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 98765 43210",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon–Sat: 9AM – 6PM IST",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", subject: "", message: "" };

export function ContactPage() {
  const {
    mutate: submit,
    isPending,
    isSuccess,
    reset,
  } = useSubmitContactForm();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    submit({ name: form.name, email: form.email, message: form.message });
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-14 sm:py-20 px-4 text-center">
        {/* decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-primary-foreground/5 blur-3xl"
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-foreground/15 mb-4 sm:mb-5 shadow-lg">
            <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-primary-foreground mb-3 tracking-tight">
            Contact Us
          </h1>
          <p className="text-primary-foreground/75 text-sm sm:text-base md:text-lg">
            Have questions? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-5xl">
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Left — Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl card-elevated p-5 sm:p-7">
              {isSuccess ? (
                <SuccessState onReset={handleReset} />
              ) : (
                <>
                  <div className="mb-5 sm:mb-6">
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                      Get in Touch
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      We&apos;d love to hear from you. Send us a message!
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                    noValidate
                  >
                    {/* Name + Email: stack on mobile, side-by-side on sm+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        id="contact-name"
                        label="Full Name"
                        required
                        error={errors.name}
                      >
                        <Input
                          id="contact-name"
                          value={form.name}
                          onChange={set("name")}
                          placeholder="Vishal Kumar"
                          data-ocid="contact-name-input"
                          autoComplete="name"
                          className="h-11 text-base sm:text-sm"
                        />
                      </Field>

                      <Field
                        id="contact-email"
                        label="Email Address"
                        required
                        error={errors.email}
                      >
                        <Input
                          id="contact-email"
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          placeholder="you@example.com"
                          data-ocid="contact-email-input"
                          autoComplete="email"
                          className="h-11 text-base sm:text-sm"
                        />
                      </Field>
                    </div>

                    <Field id="contact-subject" label="Subject">
                      <Input
                        id="contact-subject"
                        value={form.subject}
                        onChange={set("subject")}
                        placeholder="Order issue, product query…"
                        data-ocid="contact-subject-input"
                        className="h-11 text-base sm:text-sm"
                      />
                    </Field>

                    <Field
                      id="contact-message"
                      label="Message"
                      required
                      error={errors.message}
                    >
                      <Textarea
                        id="contact-message"
                        rows={5}
                        value={form.message}
                        onChange={set("message")}
                        placeholder="Tell us how we can help you…"
                        data-ocid="contact-message-input"
                        className="resize-none min-h-[120px] text-base sm:text-sm"
                      />
                    </Field>

                    <Button
                      type="submit"
                      className="w-full gap-2 transition-smooth h-11 text-sm font-semibold"
                      disabled={isPending}
                      data-ocid="contact-submit-btn"
                    >
                      <Send className="h-4 w-4" />
                      {isPending ? "Sending…" : "Send Message"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right — Info Cards */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
            <div className="mb-1">
              <h2 className="font-display font-bold text-xl text-foreground">
                Reach Us Directly
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Multiple ways to get in touch with our team.
              </p>
            </div>

            {/* 2-col grid on mobile/tablet, single col on lg */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3">
              {INFO_CARDS.map(({ icon: Icon, title, value, color, bg }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border card-elevated hover:card-elevated-hover transition-smooth"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      {title}
                    </p>
                    <p className="text-sm font-medium text-foreground break-words">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Response time badge */}
            <div className="mt-1 sm:mt-2 p-3 sm:p-4 rounded-xl bg-accent/8 border border-accent/20">
              <p className="text-sm text-foreground font-medium mb-0.5">
                ⚡ Fast Response
              </p>
              <p className="text-xs text-muted-foreground">
                Our support team typically replies within 24 hours on business
                days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Field wrapper ─────────────────────────────────────────────── */
function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" data-ocid={`${id}.field_error`}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Success state ─────────────────────────────────────────────── */
function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 sm:py-14 text-center gap-4 sm:gap-5"
      data-ocid="contact.success_state"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent/15 flex items-center justify-center">
        <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
      </div>
      <div>
        <h3 className="font-display font-bold text-xl text-foreground mb-1">
          Message Sent!
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          We&apos;ll get back to you soon. Our team typically responds within 24
          hours.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onReset}
        className="gap-2 transition-smooth w-full sm:w-auto"
        data-ocid="contact-send-another-btn"
      >
        <Send className="h-4 w-4" />
        Send Another Message
      </Button>
    </div>
  );
}
