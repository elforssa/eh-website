import assert from "node:assert/strict";
import { crmFormKey, dispatchAcquisition, submissionRoute } from "../src/lib/acquisition/workflow.ts";
import { prepareHiringSubmission } from "../src/lib/recruitment/prepared.ts";
import { deliverKeyedRecruitmentRow } from "../src/lib/recruitment/sheet-row.ts";

const summer = { destination: "crm", formSchema: "campaign_parent_lead_v1", programInterest: "Camp d'été" };
const annual = { destination: "crm", formSchema: "campaign_parent_lead_v1", programInterest: "Anglais annuel" };
const teacher = { destination: "recruitment", workflow: "temporary_hiring_lead", role: "Professeur d'anglais" };
const receptionist = { destination: "recruitment", workflow: "receptionist_application" };
assert.equal(crmFormKey(summer), crmFormKey(annual));
assert.equal(submissionRoute(summer), "/api/crm-inquiry");
assert.equal(submissionRoute(teacher), "/api/recruitment-leads");
assert.equal(submissionRoute(receptionist), "/api/job-applications");
let crmCalls = 0;
let sheetsCalls = 0;
const handlers = {
  crm: async () => { crmCalls++; return "crm"; },
  recruitment: async (config) => { if (config.workflow === "temporary_hiring_lead") sheetsCalls++; return "recruitment"; },
};
assert.equal(await dispatchAcquisition(summer, handlers), "crm");
assert.equal(crmCalls, 1);
assert.equal(sheetsCalls, 0);
assert.equal(await dispatchAcquisition(teacher, handlers), "recruitment");
assert.equal(crmCalls, 1);
assert.equal(sheetsCalls, 1);
assert.equal(await dispatchAcquisition(receptionist, handlers), "recruitment");
assert.equal(crmCalls, 1);
assert.equal(sheetsCalls, 1);
const hiringDraft = { name: "Test Applicant", phone: "+212600000000", email: "", answers: { subject: "English" }, consent: true };
let uuids = 0;
const nextUuid = () => `test-${++uuids}`;
const prepared = prepareHiringSubmission(null, teacher.role, hiringDraft, nextUuid);
assert.equal(prepareHiringSubmission(prepared, teacher.role, hiringDraft, nextUuid), prepared);
assert.equal(prepared.payload.request_key, "test-1");
assert.equal(prepareHiringSubmission(prepared, teacher.role, { ...hiringDraft, answers: { subject: "French" } }, nextUuid).payload.request_key, "test-2");
const rows = [];
const readKeys = async () => rows.map((row) => row[0]);
const appendRow = async (row) => { rows.push(row); };
const teacherLead = { request_key: "test-1", role: teacher.role, ...hiringDraft };
assert.equal(await deliverKeyedRecruitmentRow(teacherLead, readKeys, appendRow, () => "2026-01-01T00:00:00.000Z"), true);
assert.equal(rows.length, 1);
assert.equal(rows[0][2], teacher.role);
assert.equal(await deliverKeyedRecruitmentRow(teacherLead, readKeys, appendRow), false);
assert.equal(rows.length, 1);
console.log("Acquisition destinations: passed");
