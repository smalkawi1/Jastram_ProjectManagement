import { MilestoneType } from "@/app/generated/prisma";

export const MILESTONE_ORDER: MilestoneType[] = ["KICK_OFF", "PDR", "FDR"];

export interface MilestoneTemplate {
  type: MilestoneType;
  label: string;
  shortLabel: string;
  purpose: string;
  timing: string;
  participants?: string[];
  agenda?: string[];
  requirements?: string[];
  riskNote?: string;
  outputs: string[];
}

export const MILESTONE_TEMPLATES: Record<MilestoneType, MilestoneTemplate> = {
  KICK_OFF: {
    type: "KICK_OFF",
    label: "Engineering Kick-Off Meeting",
    shortLabel: "Kick-Off",
    purpose:
      "Align the engineering team on the scope of supply, project objectives, and design approach before any technical work begins.",
    timing: "Held after the sales-to-engineering handover meeting.",
    participants: [
      "Engineering Manager",
      "Mechanical Lead",
      "Electrical Lead",
      "Contracts / Sales Representative",
    ],
    agenda: [
      "Review contract scope and deliverables",
      "Clarify technical assumptions and constraints",
      "Identify long lead items",
      "Define document and drawing deliverables",
      "Outline key project milestones",
      "Agree on communication and collaboration plan",
    ],
    outputs: [
      "Scope review and deliverables list confirmed",
      "Key project milestones outlined",
      "Communication and collaboration plan agreed",
      "Long lead items identified and committed release dates set",
    ],
  },

  PDR: {
    type: "PDR",
    label: "Preliminary Design Review",
    shortLabel: "PDR",
    purpose:
      "Ensure alignment between mechanical and electrical systems early in the design process. Identify potential integration or installation issues before committing to production.",
    timing:
      "Once preliminary schematics and layouts are available. Before detailed design is finalized.",
    requirements: [
      "Draft mechanical and electrical schematics ready for review",
      "Interface questions, production bottlenecks, or design constraints identified and raised",
      "Pending decisions or uncertainties highlighted",
    ],
    riskNote:
      "Production documentation (e.g. panel builds or mechanical parts) may be released prior to Final Design Review if timeline pressures exist. This is an accepted risk, provided: risk is conveyed to management and acknowledged; team is aligned on potential impact; items can be revised after approval if necessary and cost of rework is considered.",
    outputs: [
      "Action items with owners and deadlines",
      "Approval or comments on early drawings/schematics",
      "Decisions on what can proceed to production",
    ],
  },

  FDR: {
    type: "FDR",
    label: "Final Design Review",
    shortLabel: "FDR",
    purpose:
      "Finalize and verify all engineering deliverables before class submittal or release to production.",
    timing: "After all design components are complete and integrated.",
    requirements: [
      "All drawings and documents ready for submission to classification societies",
      "All production drawings completed",
      "All review comments from PDR closed",
    ],
    agenda: [
      "Review final schematics, layouts, and calculations",
      "Confirm all interfaces (electrical–mechanical–control) are validated",
      "Validate BOMs and production release packages",
      "Ensure compliance with class rules and Jastram standards",
    ],
    outputs: [
      "Final sign-off for class submission",
      "All engineering releases to production are finalized",
    ],
  },
};

export function getMilestoneTemplate(type: MilestoneType): MilestoneTemplate {
  return MILESTONE_TEMPLATES[type];
}
