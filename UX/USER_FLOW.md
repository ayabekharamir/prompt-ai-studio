# User Flow — Prompt AI Studio (Phase 1)

## 1. Purpose

This document describes the core user journeys for Phase 1: onboarding, Brand Brain creation, and prompt generation. It is intended to guide UX and future engineering work, not to prescribe final UI design.

## 2. Primary User Journey: First-Time Setup

```
1. Sign Up / Log In
        │
        ▼
2. Create Workspace (represents one brand or client)
        │
        ▼
3. Create Brand Brain
   - Enter brand identity (name, industry, audience)
   - Define tone of voice
   - Add content rules (do's and don'ts)
        │
        ▼
4. Land on Dashboard
   - Overview of Brand Brain completeness
   - Prompt Library (empty state with guidance)
        │
        ▼
5. Create First Prompt (via Prompt Generator)
   - Select content type/category
   - Answer guided questions (goal, format, audience)
   - System auto-fills relevant Brand Brain data
        │
        ▼
6. Review & Save Prompt
   - Edit generated prompt text if needed
   - Save to Prompt Library with tags/category
        │
        ▼
7. Copy / Export Prompt
   - Copy to clipboard for use in external AI tools
```

## 3. Secondary User Journey: Reusing the Prompt Library

```
1. Log In → Dashboard
        │
        ▼
2. Navigate to Prompt Library
        │
        ▼
3. Search / Filter Prompts (by category, tag, keyword)
        │
        ▼
4. Select Existing Prompt
   - View prompt details and version history
        │
        ▼
5. Duplicate or Edit Prompt
        │
        ▼
6. Save New Version / Copy to Clipboard
```

## 4. Secondary User Journey: Managing Multiple Brands (Agency Use Case)

```
1. Log In → Dashboard
        │
        ▼
2. Switch Workspace (select client/brand)
        │
        ▼
3. View Brand-Specific Brand Brain + Prompt Library
        │
        ▼
4. Repeat core flows independently per brand
```

## 5. Key UX Principles

- Brand Brain creation should feel like a guided questionnaire, not a blank form.
- Prompt Generator should always show which Brand Brain fields are being used.
- Empty states (no prompts yet, no Brand Brain yet) must guide the user to the next action.
- All flows must be designed to support both English (LTR) and Persian (RTL) layouts.

## 6. Persian Summary | خلاصه فارسی

مسیر اصلی کاربر در فاز اول شامل این مراحل است: ثبت‌نام، ایجاد ورک‌اسپیس، تکمیل «مغز برند» (هویت، لحن، قوانین محتوایی)، ورود به داشبورد، ساخت اولین پرامپت از طریق تولیدکننده هدایت‌شده، ذخیره و در نهایت کپی/خروجی گرفتن از پرامپت برای استفاده در ابزارهای خارجی هوش مصنوعی. مسیرهای فرعی شامل جست‌وجو و استفاده مجدد از کتابخانه پرامپت، و همچنین مدیریت چند برند به‌طور هم‌زمان (برای آژانس‌ها) است. تمام مسیرها باید از ابتدا برای پشتیبانی هم‌زمان از رابط کاربری فارسی (راست‌به‌چپ) و انگلیسی (چپ‌به‌راست) طراحی شوند.
