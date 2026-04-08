const mapService = require("../disasterService/mapService");

const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  const raw = phone.toString().trim();
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return null;

  // Sri Lankan mobile formats
  if (/^07\d{8}$/.test(digitsOnly)) {
    return `+94${digitsOnly.slice(1)}`;
  }

  if (/^7\d{8}$/.test(digitsOnly)) {
    return `+94${digitsOnly}`;
  }

  if (/^94\d{9}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  // Generic fallback
  if (raw.startsWith("+")) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
};

const toWhatsAppAddress = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return null;
  return `whatsapp:${normalized}`;
};

const buildMessageBody = (disaster) => {
  const coordinateMapUrl = mapService.generateGoogleMapLink(
    disaster?.location?.latitude,
    disaster?.location?.longitude,
  );
  const locationName = disaster?.location?.name || disaster?.location?.address || "";
  const fallbackMapUrl = locationName
    ? `https://www.google.com/maps?q=${encodeURIComponent(locationName)}`
    : null;
  const mapUrl = coordinateMapUrl || fallbackMapUrl;

  const lines = [
    "RebuildHub Alert: You were assigned to a disaster response.",
    `Title: ${disaster?.title || "N/A"}`,
    `Type: ${disaster?.type || "N/A"}`,
    `Severity: ${disaster?.severityLevel || "N/A"}`,
    `Status: ${disaster?.status || "N/A"}`,
    `Location: ${disaster?.location?.name || "N/A"}`,
  ];

  if (disaster?.description) {
    lines.push(`Details: ${disaster.description.slice(0, 250)}`);
  }

  if (mapUrl) {
    lines.push(`Google Maps: ${mapUrl}`);
  }

  lines.push("Please open RebuildHub for full task details.");

  return lines.join("\n");
};

const sendAssignmentWhatsApp = async ({ volunteerPhone, disaster }) => {
  const enabled = process.env.TWILIO_ENABLED === "true";
  if (!enabled) {
    return { skipped: true, reason: "TWILIO_ENABLED is not true" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const to = toWhatsAppAddress(volunteerPhone);

  if (!accountSid || !authToken || !to) {
    return {
      skipped: true,
      reason: "Missing Twilio credentials or volunteer phone number",
    };
  }

  const client = require("twilio")(accountSid, authToken);
  const body = buildMessageBody(disaster);
  const contentSid = process.env.TWILIO_ASSIGNMENT_CONTENT_SID;

  const messagePayload = {
    from,
    to,
  };

  if (contentSid) {
    const templateMapUrl = mapService.generateGoogleMapLink(
      disaster?.location?.latitude,
      disaster?.location?.longitude,
    )
      || (disaster?.location?.name || disaster?.location?.address
        ? `https://www.google.com/maps?q=${encodeURIComponent(disaster?.location?.name || disaster?.location?.address)}`
        : "N/A");

    messagePayload.contentSid = contentSid;
    messagePayload.contentVariables = JSON.stringify({
      1: disaster?.title || "Disaster Assignment",
      2: disaster?.location?.name || "N/A",
      3: templateMapUrl,
    });
  } else {
    messagePayload.body = body;
  }

  const message = await client.messages.create(messagePayload);

  return { skipped: false, sid: message.sid };
};

module.exports = {
  sendAssignmentWhatsApp,
};
