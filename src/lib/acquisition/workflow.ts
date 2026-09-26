// A landing page must declare its destination. Slugs and UTMs never select a workflow.
export type CrmSchema = "general_contact_v1" | "campaign_parent_lead_v1" | "campaign_adult_lead_v1";
export type CrmWorkflow = {
  destination: "crm";
  formSchema: CrmSchema;
  programInterest?: string;
  visibleQuestions?: readonly string[];
  extraQuestions?: readonly { key: string; label: string; inputType?: "text" | "number" | "checkbox"; required?: boolean }[];
};
export type RecruitmentWorkflow = {
  destination: "recruitment";
  workflow: "receptionist_application";
} | {
  destination: "recruitment";
  workflow: "temporary_hiring_lead";
  role: string;
  questions?: readonly { key: string; label: string; required?: boolean }[];
};
export type AcquisitionWorkflow = CrmWorkflow | RecruitmentWorkflow;

export function submissionRoute(config: AcquisitionWorkflow) {
  if (config.destination === "crm") return "/api/crm-inquiry";
  return config.workflow === "receptionist_application"
    ? "/api/job-applications" : "/api/recruitment-leads";
}

export function crmFormKey(config: CrmWorkflow): CrmSchema {
  return config.formSchema;
}

export async function dispatchAcquisition<T>(
  config: AcquisitionWorkflow,
  handlers: { crm: (config: CrmWorkflow) => Promise<T>; recruitment: (config: RecruitmentWorkflow) => Promise<T> },
): Promise<T> {
  return config.destination === "crm" ? handlers.crm(config) : handlers.recruitment(config);
}
