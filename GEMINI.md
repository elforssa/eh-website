# English Hills Language Center - Website Build Instructions

## Project Overview

Build a modern, professional website for **English Hills Language Center**, a premium language education center in Bouskoura, Casablanca, Morocco. The center targets young learners (6-17), adult professionals, and corporate clients near the Sidi Maarouf business corridor.

**Critical Requirement**: This website must look professionally designed, not AI-generated. Avoid generic templates, stock layouts, and predictable AI patterns.

---

## Brand Identity

### Core Positioning
- **Name**: English Hills Language Center
- **Domain**: english-hills.com
- **Tagline**: "Learn Today, Lead Tomorrow"
- **Hero Message**: "Where cutting-edge technology meets project-based learning — making English engaging, effective, and genuinely fun for all ages."

### Brand Colors
```css
--navy-primary: #1E4D8B;
--navy-deep: #0D2B5E;
--red-accent: #B91C2E;
--white: #FFFFFF;
--light-gray: #F5F5F7;
--dark-text: #1D1D1F;
```

### Brand Voice
- Professional but approachable
- Innovative and tech-forward
- Outcome-focused ("real, usable English")
- Confident without being pretentious
- Clear, direct communication

### Key Differentiators
1. **Technology Integration**: Interactive smart screens + National Geographic content
2. **Project-Based Learning**: No traditional exams — students present real projects
3. **B2B Corporate Training**: Strategic positioning for Sidi Maarouf multinationals
4. **Flexible Scheduling**: 7 days/week, morning to evening
5. **Guaranteed Production**: Every student genuinely *uses* English, not just memorizes

---

## Technical Stack

### Required Technologies
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (NO component libraries like shadcn/ui)
- **Database**: Supabase (for future CRM/placement test booking)
- **Deployment**: Vercel
- **Forms**: Next.js Server Actions or API routes
- **Fonts**: System fonts or Google Fonts (Inter, Plus Jakarta Sans, or similar modern sans-serif)

### Performance Requirements
- Lighthouse score: 90+ across all metrics
- Mobile-first responsive design
- Fast page loads (<2s)
- Optimized images (Next.js Image component)

---

## Site Structure & Pages

### 1. Homepage (`/`)
**Purpose**: Strong first impression, clear value proposition, drive enrollments

**Sections**:
1. **Hero Section**
   - Headline: "Welcome to English Hills"
   - Subheading: "Where cutting-edge technology meets project-based learning — making English engaging, effective, and genuinely fun for all ages."
   - Two CTAs: "Enroll Now" (primary) + "Explore Programs" (secondary)
   - Background: High-quality image of modern classroom or engaged students (NOT stock photos with fake smiles)

2. **Learning Reimagined** (3-column feature grid)
   - 🌍 National Geographic Content: "Rich, real-world media that sparks curiosity and vocabulary growth."
   - 🖥️ Interactive Tech: "Smart screens and digital platforms built for hands-on engagement."
   - 🤝 Inclusive Programs: "Designed for diverse learners — every student belongs here."

3. **Our Approach: Learn by Doing** (visual flow diagram)
   - Show the 3-step cycle: Discover → Do → Communicate
   - Brief description of project-based methodology
   - Tagline: "This approach guarantees that every learner walks away with real, usable English skills — not just test scores."

4. **Programs Overview** (2-column split: Kids | Adults)
   - Quick summary cards with pricing
   - "View All Programs" CTA

5. **Assessment That Actually Proves Learning**
   - Explain project-based validation (no paper tests)
   - 3-step visual: Complete Module → Prepare Project → Present & Validate
   - Highlight: "Production is guaranteed"

6. **Social Proof** (when available)
   - Student testimonials
   - Corporate client logos
   - Success stories

7. **CTA Footer Section**
   - "Your Journey Starts at English Hills"
   - Final pitch + dual CTAs (Enroll Today | Contact Us)

### 2. General English (`/programs/general-english`)
**Content**:
- Target audience: All levels welcome
- 3 hours/week (split or joined sessions)
- Pricing: 1,800 DH course fee + 300 DH books + 150 DH registration
- Flexible scheduling
- Project-based learning approach
- Enrollment CTA

### 3. Business English (`/programs/business-english`)
**Content**:
- Target audience: Working professionals
- Professional communication focus: meetings, reports, presentations, emails, negotiations
- Emphasize B2B corporate training opportunity
- Custom programs for companies
- Placement test requirement
- Contact form for corporate inquiries

### 4. Exam Preparation (`/programs/exam-prep`)
**Content**:
- IELTS, TOEFL, Cambridge certifications
- Targeted practice
- Flexible scheduling
- Pricing and duration options

### 5. Short Courses (`/programs/short-courses`)
**Content**:
- ESP (English for Specific Purposes)
- Themed communication classes
- Customized programs
- Corporate training options
- Contact-first approach for customization

### 6. About Us (`/about`)
**Content**:
- Mission: Making English engaging, effective, and genuinely fun
- National Geographic partnership
- Technology integration (smart screens, digital platforms)
- Project-based methodology
- Teaching team (when available)
- Location: Bouskoura, Casablanca (near Sidi Maarouf business corridor)

### 7. Contact (`/contact`)
**Elements**:
- Contact form (Name, Email, Phone, Message, Program Interest)
- Email: contact@english-hills.com
- Phone: [TBD - leave placeholder]
- Address: Bouskoura, Casablanca
- Google Maps embed (placeholder)
- Office hours
- Social media links (placeholder)

### 8. Placement Test Booking (`/placement-test`)
**Purpose**: Streamline enrollment process

**Form Fields**:
- Full Name
- Email
- Phone
- Preferred Date/Time (date picker)
- Age Group (Kids 6-17 | Adults)
- Program Interest (dropdown)
- Current English Level (self-assessment)
- Submit → Confirmation message

### 9. FAQ (`/faq`)
**Common Questions**:
- What is project-based learning?
- Do you offer traditional exams?
- What are your class sizes?
- Can I change my schedule?
- Do you offer corporate training?
- What levels do you teach?
- What are your payment options?
- Can I get a refund?

---

## Design Guidelines

### DO:
✅ **Use white space generously** — avoid cramped layouts
✅ **Strong typography hierarchy** — clear h1, h2, h3 distinctions
✅ **Custom illustrations or real photography** — avoid obvious stock images
✅ **Subtle animations** — smooth scroll effects, fade-ins on viewport entry
✅ **Consistent spacing system** — 8px/16px/24px/32px/48px/64px grid
✅ **Mobile-first approach** — design for mobile, scale up
✅ **Accessibility** — ARIA labels, keyboard navigation, color contrast
✅ **Real content** — use actual text from the PDF, not Lorem Ipsum
✅ **Strategic color usage** — navy as primary, red as accent (sparingly)
✅ **Modern CSS** — flexbox, grid, CSS variables
✅ **Micro-interactions** — hover states, button feedback, form validation

### DON'T:
❌ **Generic hero sections** with centered text + gradient overlays
❌ **Overuse of cards** with rounded corners everywhere
❌ **Predictable three-column layouts** repeated throughout
❌ **Stock photos** of people pointing at computers with fake smiles
❌ **Carousels/sliders** on mobile (they perform poorly)
❌ **Auto-playing videos** without user control
❌ **Excessive animations** that slow down the experience
❌ **Generic "Contact Us" forms** without context
❌ **Footer overload** with every possible link
❌ **Inconsistent spacing** between sections

### Inspiration Reference
Study **https://www.britishworkshop.ma/** for:
- Professional education site aesthetics
- Program presentation structure
- Moroccan market context
- BUT: Create a distinct design that reflects English Hills' modern, tech-forward positioning

---

## Content Strategy

### Copywriting Principles
1. **Lead with outcomes**, not features
   - ✅ "Walk away with real, usable English"
   - ❌ "We offer 200 hours of instruction"

2. **Be specific about the B2B opportunity**
   - Mention Sidi Maarouf corridor explicitly
   - Position corporate training prominently

3. **Emphasize the assessment difference**
   - "No stressful paper tests"
   - "Validate through real project presentations"

4. **Use active, confident language**
   - "You will speak confidently" (not "You may improve")

5. **Avoid educational clichés**
   - Skip: "excellence," "world-class," "cutting-edge" (unless genuinely true)
   - Use: "effective," "practical," "proven"

---

## Pricing & Programs (Detailed)

### Kids Programs (Ages 6-17)
**Standard Program**
- 2 hours/week
- 5,000 DH/year (all-inclusive)
- "Perfect for steady, consistent English growth alongside school"

**Intensive Program**
- 3 hours/week
- 6,500 DH/year (all-inclusive)
- "Accelerated learning for motivated young learners ready to go further, faster"

### Adult Programs
**General English**
- 3 hours/week (split or joined sessions)
- Course fee: 1,800 DH
- Books (as needed): 300 DH
- One-time registration: 150 DH

**Business English**
- Professional communication for meetings, reports, presentations, emails, negotiations
- Custom pricing for corporate clients
- Contact for details

**ESP & Specialized Courses**
- English for Specific Purposes
- Exam preparation (IELTS, TOEFL, Cambridge)
- Themed communication classes
- Fully customized programs
- Contact for details

---

## Component Specifications

### Navigation
```
Logo (left) | Programs (dropdown) | About | Contact | Placement Test (CTA button, red accent)
```
- Sticky on scroll (with subtle shadow)
- Mobile: Hamburger menu (smooth slide-in)
- Dropdown on hover (desktop) or click (mobile)

### Footer
```
[Logo + Tagline]

Programs          Quick Links       Contact
- General         - About           Email: contact@english-hills.com
- Business        - FAQ             Phone: [TBD]
- Exam Prep       - Placement Test  Location: Bouskoura, Casablanca
- Short Courses   
                  
© 2026 English Hills Language Center | Privacy Policy | Terms of Service
```

### Call-to-Action Buttons
**Primary** (Red #B91C2E):
- "Enroll Now"
- "Book Placement Test"
- "Get Started"

**Secondary** (Navy outline):
- "Explore Programs"
- "Contact Us"
- "Learn More"

### Form Styling
- Clean, minimal design
- Label above field
- Subtle border (focus state: navy blue)
- Inline validation messages
- Loading state on submit
- Success/error toast notifications

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Next.js 14 project setup
- [ ] Tailwind CSS configuration with custom colors
- [ ] Font integration (Google Fonts or system fonts)
- [ ] Basic page routing structure
- [ ] Reusable layout component (header, footer)

### Phase 2: Homepage
- [ ] Hero section with CTAs
- [ ] "Learning Reimagined" feature grid
- [ ] "Learn by Doing" visual flow
- [ ] Programs overview section
- [ ] Assessment explanation section
- [ ] Final CTA section

### Phase 3: Program Pages
- [ ] General English page
- [ ] Business English page
- [ ] Exam Prep page
- [ ] Short Courses page
- [ ] Consistent layout template

### Phase 4: Supporting Pages
- [ ] About Us page
- [ ] Contact page with functional form
- [ ] Placement Test booking page with form
- [ ] FAQ page (accordion UI)

### Phase 5: Polish
- [ ] Mobile responsiveness audit
- [ ] Animation implementation (scroll reveals, hover effects)
- [ ] Image optimization
- [ ] SEO metadata (titles, descriptions)
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Cross-browser testing

---

## SEO Requirements

### Meta Information
**Homepage**:
```html
<title>English Hills Language Center | Bouskoura, Casablanca</title>
<meta name="description" content="Modern English language center in Bouskoura using project-based learning and National Geographic content. Programs for kids, adults, and corporate clients near Sidi Maarouf." />
```

**Program Pages**:
- Unique titles and descriptions
- Structured data (Organization, LocalBusiness, Course)

### Keywords to Target
- English language center Casablanca
- English courses Bouskoura
- Business English Morocco
- Corporate English training Casablanca
- IELTS preparation Casablanca
- English for kids Morocco

---

## Future Enhancements (Not in Initial Build)

- Student portal login
- Online placement test
- Payment gateway integration
- CRM integration (Supabase backend)
- Blog for content marketing
- Video testimonials
- Virtual tour of facilities
- Online booking system with calendar

---

## Quality Assurance

Before considering this website complete, verify:

1. **Design Quality**
   - Does this look like a professionally designed site?
   - Would someone guess this was AI-generated?
   - Is there a consistent visual language throughout?

2. **Content Accuracy**
   - All pricing matches the PDF
   - All program details are accurate
   - Contact information is correct (or placeholder)

3. **User Experience**
   - Can a parent find kids programs in <3 clicks?
   - Can a professional find Business English easily?
   - Is the enrollment path clear?
   - Does the site work perfectly on mobile?

4. **Technical Performance**
   - <2s page load on 4G connection
   - No layout shift on load
   - Images properly optimized
   - Forms submit successfully

5. **Brand Consistency**
   - Colors match brand guidelines
   - Tone matches brand voice
   - Messaging emphasizes key differentiators

---

## Final Notes

**This is not a template website.** English Hills has clear differentiators (project-based learning, National Geographic partnership, B2B positioning, no traditional exams). The design must reflect these unique qualities, not generic "language school" patterns.

**The target audience is sophisticated.** Parents researching quality education and professionals seeking career advancement. The design must inspire confidence and communicate professionalism.

**The market context matters.** This is Casablanca's business corridor — the site should feel premium but not pretentious, international but locally relevant.

Build something you'd be proud to show in your portfolio.

---

**Build the website. Make it exceptional.**
