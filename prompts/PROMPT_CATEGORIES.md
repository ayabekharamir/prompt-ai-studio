# Prompt Categories

Baseline category taxonomy for organizing prompt templates and prompts.
Used as the `category` value on `prompt_templates` and, by extension,
on prompts built from them. This list is intentionally a starting
foundation — product owners can extend it without schema changes,
since `category` is a plain string field.

## Core Categories (Phase 1 Foundation)

| Category key         | Description                                             |
|------------------------|------------------------------------------------------------|
| `social-media`          | Posts, captions, and copy for social platforms             |
| `advertising`           | Ad copy, headlines, and campaign messaging                 |
| `email-marketing`       | Newsletters, sequences, and transactional email copy       |
| `product-description`   | E-commerce and catalog product descriptions                |
| `blog-content`          | Long-form articles and blog outlines                       |
| `brand-messaging`       | Taglines, mission statements, positioning statements       |
| `customer-support`      | Support replies, FAQ answers, help-center content           |
| `internal-communication`| Internal memos, announcements, team updates                 |

## Notes
- Categories are stored as plain strings, not a fixed enum, so new
  categories can be introduced without a database migration.
- Each category is expected to have at least one **system template**
  (see `templates/TEMPLATE_STRUCTURE.md`) to guide users out of the box.
