import type { MetadataRoute } from "next";

const BASE_URL = "https://www.english-hills.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/programs/kids`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs/general-english`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs/business-english`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs/exam-prep`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/programs/short-courses`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
