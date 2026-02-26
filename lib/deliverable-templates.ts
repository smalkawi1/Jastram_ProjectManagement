import { DeliverableType } from "@/app/generated/prisma";

export interface DeliverableTemplate {
  type: DeliverableType;
  label: string;
  shortLabel: string;
  description: string;
  notes?: string;
}

export const DELIVERABLE_TEMPLATES: Record<DeliverableType, DeliverableTemplate> = {
  LONG_LEAD: {
    type: "LONG_LEAD",
    label: "Long Lead Information",
    shortLabel: "Long Lead",
    description:
      "Long lead component information must be released to purchasing by the committed date agreed during the Engineering Kick-Off Meeting.",
    notes:
      "Release date committed during Kick-Off. Delays here directly impact production schedule.",
  },

  PICKLIST: {
    type: "PICKLIST",
    label: "Picklist (Scope of Supply)",
    shortLabel: "Picklist",
    description:
      "Scope of supply part numbers released to production. Includes a mix of off-the-shelf items and custom-designed parts. Custom parts may require additional engineering work before they can be picked and shipped.",
    notes:
      "Off-the-shelf parts can be released early. Custom parts remain pending until engineering is complete.",
  },

  PROD_RELEASE: {
    type: "PROD_RELEASE",
    label: "Production Information Release",
    shortLabel: "Prod. Release",
    description:
      "Custom-designed parts of the system are formally released to production. Includes all drawings, BOMs, and any other information necessary to procure materials and manufacture the parts.",
    notes:
      "Distinct from system design drawings sent to the customer. Covers only what production needs to build.",
  },

  SYS_DESIGN_CUSTOMER: {
    type: "SYS_DESIGN_CUSTOMER",
    label: "System Design Drawing to Customer",
    shortLabel: "Customer Drawings",
    description:
      "System design drawings released to the customer. These are distinct from the production drawings released internally; they represent the overall system layout and interface information for the customer's use.",
  },

  CLASS_SUBMIT: {
    type: "CLASS_SUBMIT",
    label: "Submit to Class Society",
    shortLabel: "Class Submit",
    description:
      "All required drawings and calculations submitted to the relevant classification society for approval.",
    notes:
      "Must be complete and signed off before submission. Coordinate with FDR milestone.",
  },

  FAT: {
    type: "FAT",
    label: "Class Society Inspection / FAT",
    shortLabel: "FAT",
    description:
      "Factory Acceptance Test (FAT): equipment inspection or functional testing witnessed by the class society surveyor.",
  },

  MANUAL: {
    type: "MANUAL",
    label: "System Manual Completion",
    shortLabel: "Manual",
    description:
      "System operation and maintenance manual completed, reviewed, and ready for delivery with the equipment.",
  },

  SHIPPING: {
    type: "SHIPPING",
    label: "Shipping Date",
    shortLabel: "Shipping",
    description:
      "Committed date for shipping the equipment to the customer. All production, inspection, and documentation must be complete before this date.",
  },
};

export const DELIVERABLE_ORDER: DeliverableType[] = [
  "LONG_LEAD",
  "PICKLIST",
  "PROD_RELEASE",
  "SYS_DESIGN_CUSTOMER",
  "CLASS_SUBMIT",
  "FAT",
  "MANUAL",
  "SHIPPING",
];

export function getDeliverableTemplate(type: DeliverableType): DeliverableTemplate {
  return DELIVERABLE_TEMPLATES[type];
}
