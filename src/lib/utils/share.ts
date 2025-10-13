import type { PodFields } from "../pdf/createPodPdf";

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  preferred_contact?: "email" | "whatsapp" | null;
}

interface ShareContext {
  container: PodFields & { container_number?: string; driver_name?: string };
  customer?: CustomerInfo;
  link: string;
}

export function sharePodLink({ container, customer, link }: ShareContext) {
  const customerName = customer?.name ?? "Customer";
  const driverName = container.driver_name ?? "Driver";
  const containerNumber = container.container_number ?? "Shipment";
  const message = `Proof of Delivery for ${containerNumber}:\n${link}`;

  if (customer?.preferred_contact === "email" && customer.email) {
    const subject = `Proof of Delivery – ${containerNumber}`;
    const body = encodeURIComponent(
      `Hello ${customerName},\n\nPlease find the proof of delivery at the link below:\n${link}\n\nThank you,\n${driverName}`,
    );

    window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    return;
  }

  if (customer?.phone) {
    const phone = customer.phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    return;
  }

  alert("No contact information available for this customer. The link has been copied to your clipboard.");
  navigator.clipboard.writeText(link).catch(() => {
    console.warn("Unable to copy POD link to clipboard.");
  });
}
