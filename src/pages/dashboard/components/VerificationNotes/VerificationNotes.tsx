import { dashboardNotes } from "@/common/data";
import "./VerificationNotes.css";

export function VerificationNotes() {
  return (
    <section className="verification-audit">
      <h3>Verification status</h3>
      <p>{dashboardNotes.verificationIntro}</p>
      <ul>
        {dashboardNotes.verificationItems.map((item) => (
          <li key={item.label}>
            <strong>{item.label}</strong> {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
