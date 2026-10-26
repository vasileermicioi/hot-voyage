/** Shared inquiry validation (web endpoint + future admin). Dependency-free. */

export interface InquiryInput {
  tourId: string;
  name: string;
  contact: string;
  partySize: number;
  message?: string;
  honeypot?: string;
}

export type InquiryFields = Partial<Record<keyof InquiryInput, string>>;

export interface InquiryCheck {
  ok: boolean;
  fields: InquiryFields;
}

const MAX_MESSAGE = 2000;

export function validateInquiry(input: Partial<InquiryInput>): InquiryCheck {
  const fields: InquiryFields = {};

  if (
    !input.tourId ||
    typeof input.tourId !== "string" ||
    input.tourId.trim() === ""
  ) {
    fields.tourId = "Choose a tour.";
  }
  if (!input.name || input.name.trim().length < 2) {
    fields.name = "Enter your name (2+ characters).";
  }
  if (
    !input.contact ||
    input.contact.trim().length < 3 ||
    (!input.contact.includes("@") && !input.contact.match(/[+\d][\d\s-]{5,}/))
  ) {
    fields.contact = "Enter a valid email or phone.";
  }
  const party = Number(input.partySize);
  if (!Number.isInteger(party) || party < 1 || party > 20) {
    fields.partySize = "Party size must be 1–20.";
  }
  if (input.message != null && input.message.length > MAX_MESSAGE) {
    fields.message = `Message must be under ${MAX_MESSAGE} characters.`;
  }
  // Honeypot must stay empty — bots fill it, humans never see it.
  if (input.honeypot != null && input.honeypot !== "") {
    fields.honeypot = "Spam detected.";
  }

  return { ok: Object.keys(fields).length === 0, fields };
}
