import { useState } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, MessageSquare } from "lucide-react";
import { Footer } from "~/components/footer";
import { JsonLd } from "~/components/jsonld";
import { Navigation } from "~/components/navigation";
import { useI18n } from "~/i18n";
import { breadcrumbSchema, buildMeta, webPageSchema } from "~/lib/seo";
import { notifyEnquiryEmail } from "~/utils/enquiry-email";
import { supabase } from "~/utils/supabase";

const pageTitle = "Contact KWStudio | Web Design Studio";
const pageDescription =
  "Contact KWStudio for general questions, support, partnerships or other messages.";

export function meta() {
  return buildMeta({
    title: pageTitle,
    description: pageDescription,
    path: "/contact",
  });
}

export default function ContactPage() {
  const { t, dictionary } = useI18n();
  const contactDetails = dictionary.contact.details as Array<{
    label: string;
    value: string;
    text: string;
  }>;
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(event.currentTarget);
    const enquiry = {
      name: String(formData.get("name") ?? "").trim(),
      company: null,
      email: String(formData.get("email") ?? "").trim(),
      budget: null,
      message: String(formData.get("message") ?? "").trim(),
      recipient: "hello@kwstudio.se",
      subject: "KWStudio Contact Message",
    };

    const { error } = await supabase.from("enquiries").insert(enquiry);

    if (error) {
      console.error("Could not save contact message.", error);
      setSubmitError(t("contact.error"));
      setIsSubmitting(false);
      return;
    }

    void notifyEnquiryEmail({
      name: enquiry.name,
      email: enquiry.email,
      message: enquiry.message,
      source: "contact",
    });

    setSubmitted(true);
    setIsSubmitting(false);
  }

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ path: "/contact", title: pageTitle, description: pageDescription }),
          breadcrumbSchema([
            { name: t("nav.home"), path: "/" },
            { name: t("nav.contact"), path: "/contact" },
          ]),
        ]}
      />
      <Navigation />
      <main className="contact-redesign">
        <section className="contact-desk-hero">
          <div className="container contact-desk-layout">
            <div className="contact-desk-copy">
              <p className="eyebrow">{t("contact.hero.eyebrow")}</p>
              <h1>{t("contact.hero.title")}</h1>
              <p>{t("contact.hero.text")}</p>
              <div className="contact-desk-actions">
                <a href="mailto:hello@kwstudio.se">
                  hello@kwstudio.se <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <span>{t("contact.founder.reply")}</span>
              </div>
            </div>

            <aside className="contact-desk-card" aria-label={t("contact.welcome.eyebrow")}>
              <span>KW</span>
              <h2>{t("contact.welcome.title")}</h2>
              <p>{t("contact.welcome.text")}</p>
            </aside>
          </div>
        </section>

        <section className="contact-board-section">
          <div className="container contact-board">
            <div className="contact-board-panel">
              <p className="eyebrow">{t("contact.welcome.eyebrow")}</p>
              <h2>{t("contact.form.title")}</h2>
              <p>{t("contact.form.text")}</p>

              <div className="contact-channel-list">
                {contactDetails.map((detail, index) => {
                  const Icon = [Mail, Clock, MapPin][index] ?? MessageSquare;

                  return (
                    <article key={detail.label}>
                      <Icon size={20} aria-hidden="true" />
                      <div>
                        <span>{detail.label}</span>
                        <strong>{detail.value}</strong>
                        <p>{detail.text}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <form className="contact-message-form" onSubmit={handleSubmit}>
              {submitted ? (
                <div className="contact-success" role="status" aria-live="polite">
                  <h2>{t("contact.successTitle")}</h2>
                  <p>{t("contact.successText")}</p>
                  <span>{t("contact.successNote")}</span>
                  <div>
                    <a href="/work">{t("common.viewWork")}</a>
                    <a href="/start-a-project">{t("common.startProject")}</a>
                  </div>
                </div>
              ) : (
                <>
                  <span className="contact-form-kicker">{t("contact.form.eyebrow")}</span>

                  <div className="contact-field-row">
                    <label>
                      {t("contact.labels.name")}
                      <input required name="name" autoComplete="name" />
                    </label>
                    <label>
                      {t("contact.labels.email")}
                      <input required type="email" name="email" autoComplete="email" />
                    </label>
                  </div>

                  <label>
                    {t("contact.labels.message")}
                    <textarea required name="message" placeholder={t("contact.placeholder")} />
                  </label>

                  <p className="contact-reassurance">{t("contact.reassurance")}</p>
                  {submitError ? <p className="contact-error" role="alert">{submitError}</p> : null}

                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? t("contact.sending") : t("contact.submit")}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
