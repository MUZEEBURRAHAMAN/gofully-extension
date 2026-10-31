"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "rahamanmuzeeb1108@gmail.com";

/** The site has no backend, so the form drafts an email in the visitor's mail app. */
export function SupportForm() {
  const [opened, setOpened] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const topic = String(data.get("topic") || "General question");
    const body = `${data.get("message") || ""}\n\n— ${data.get("name") || ""} (${data.get("email") || ""})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[GoFully] ${topic}`)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <div className="gf-form-card">
      {opened ? (
        <div className="gf-form-done" role="status">
          <span className="gf-form-done-ico" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          </span>
          <h3>Your email app should be open</h3>
          <p className="gf-small">
            Press Send there to reach us. Nothing opened? Write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
          <button type="button" className="gf-btn-s" onClick={() => setOpened(false)}>Edit the message</button>
        </div>
      ) : (
        <form className="gf-form" onSubmit={handleSubmit}>
          <div className="gf-form-row">
            <label className="gf-field">
              <span>Name</span>
              <input name="name" type="text" required autoComplete="name" placeholder="Your name" />
            </label>
            <label className="gf-field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </label>
          </div>
          <label className="gf-field">
            <span>Topic</span>
            <select name="topic" defaultValue="General question">
              <option>General question</option>
              <option>Bug report</option>
              <option>Feature request</option>
              <option>Security issue</option>
            </select>
          </label>
          <label className="gf-field">
            <span>Message</span>
            <textarea name="message" required rows={6} placeholder="What happened, and on which page?" />
          </label>
          <div className="gf-form-foot">
            <button type="submit" className="gf-btn-p">
              Write the email <span className="gf-arrow" aria-hidden="true">→</span>
            </button>
            <span className="gf-small">Opens your email app with this message filled in.</span>
          </div>
        </form>
      )}
    </div>
  );
}
