import type { Metadata } from "next";
import PrivacyPolicyClient from "./privacy-policy-client";
import policyData from "../../public/privacy-policy-data.json";

export const metadata: Metadata = {
  title: "SimulaFly Mobile App Privacy Policy | Simula Technologies LLP",
  description: "Read the official SimulaFly Mobile Application Privacy Policy (iOS and Android). Learn how Simula Technologies LLP collects, processes, and protects your personal data, AI usage, and your legal rights under Indian law.",
  keywords: "SimulaFly, Privacy Policy, Mobile Application, Data Protection, DPDPA 2023, Simula Technologies, Grievance Officer, Data Fiduciary, India",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient policyData={policyData} />;
}
