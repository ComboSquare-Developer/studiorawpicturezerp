/**
 * Shared service and event type configuration for Studio Raw ERP.
 * Authoritative single source of truth for Booking and Enquiry modules.
 */

export const SERVICES = [
  "Wedding Photography",
  "Wedding Videography",
  "Functions We Arrange",
  "Event Management",
  "Customer Gifts",
  "Others",
];

export const SERVICE_EVENT_TYPES = {
  "Wedding Photography": [
    "Traditional Photography",
    "Candid Photography",
    "Helicam Photography",
    "Pre-Wedding Photography",
    "Post-Wedding Photography",
    "Other",
  ],
  "Wedding Videography": [
    "Traditional Wedding Videography",
    "Cinematic Wedding Videography",
    "Traditional + Candid Video",
    "Pre-Wedding Video",
    "Post-Wedding Video",
    "Drone / Helicam Video",
    "Other",
  ],
  "Functions We Arrange": [
    "Engagement",
    "Reception",
    "Wedding",
    "Birthday Function",
    "Baby Shower",
    "Naming Ceremony",
    "Corporate Function",
    "Other Function",
  ],
  "Event Management": [
    "Wedding Event Management",
    "Engagement Event Management",
    "Birthday Event Management",
    "Corporate Event Management",
    "Stage & Decoration",
    "Other Event",
  ],
  "Customer Gifts": [
    "Customized Photo Frame",
    "Album",
    "Mug Printing",
    "Customized Gifts",
    "Return Gifts",
    "Other Gift",
  ],
  "Others": [],
};

export function isOtherEventType(service, eventType) {
  if (!eventType) return false;
  if (service === "Wedding Photography" && eventType === "Other") return true;
  if (service === "Wedding Videography" && eventType === "Other") return true;
  if (service === "Functions We Arrange" && eventType === "Other Function") return true;
  if (service === "Event Management" && eventType === "Other Event") return true;
  if (service === "Customer Gifts" && eventType === "Other Gift") return true;
  return false;
}

export function getOtherOptionForService(service) {
  switch (service) {
    case "Wedding Photography":
    case "Wedding Videography":
      return "Other";
    case "Functions We Arrange":
      return "Other Function";
    case "Event Management":
      return "Other Event";
    case "Customer Gifts":
      return "Other Gift";
    default:
      return "Other";
  }
}

export function getCustomEventLabel(service) {
  switch (service) {
    case "Wedding Photography":
      return "Enter Photography Type";
    case "Wedding Videography":
      return "Enter Videography Type";
    case "Functions We Arrange":
      return "Enter Function Type";
    case "Event Management":
      return "Enter Event Management Type";
    case "Customer Gifts":
      return "Enter Gift Type";
    default:
      return "Enter Custom Event Type";
  }
}

export function getCustomEventPlaceholder(service) {
  switch (service) {
    case "Wedding Photography":
      return "Enter photography type";
    case "Wedding Videography":
      return "Enter videography type";
    case "Functions We Arrange":
      return "Enter function type";
    case "Event Management":
      return "Enter event management type";
    case "Customer Gifts":
      return "Enter gift type";
    default:
      return "Enter custom event type";
  }
}

export function getCustomEventValidationError(service) {
  switch (service) {
    case "Wedding Photography":
      return "Enter photography type.";
    case "Wedding Videography":
      return "Enter videography type.";
    case "Functions We Arrange":
      return "Enter function type.";
    case "Event Management":
      return "Enter event management type.";
    case "Customer Gifts":
      return "Enter gift type.";
    default:
      return "Enter custom event type.";
  }
}

export function getCustomServiceLabel() {
  return "Enter Service";
}

export function getCustomServicePlaceholder() {
  return "Enter your service name";
}

export function getCustomServiceValidationError() {
  return "Enter your service name.";
}

/**
 * Formats enquiry service & event for display in Directory, cards and modals.
 */
export function formatServiceDisplay(service, event, customService, customEvent) {
  const s = String(service || "").trim();
  const e = String(event || "").trim();
  const cs = String(customService || "").trim();
  const ce = String(customEvent || "").trim();

  if (s === "Others" || s.toLowerCase() === "others") {
    return cs || "Others";
  }

  const effectiveEvent = isOtherEventType(s, e) && ce ? ce : (ce || e);

  if (s && effectiveEvent) {
    return `${s} – ${effectiveEvent}`;
  }
  return s || effectiveEvent || "—";
}

export default {
  SERVICES,
  SERVICE_EVENT_TYPES,
  isOtherEventType,
  getOtherOptionForService,
  getCustomEventLabel,
  getCustomEventPlaceholder,
  getCustomEventValidationError,
  getCustomServiceLabel,
  getCustomServicePlaceholder,
  getCustomServiceValidationError,
  formatServiceDisplay,
};
