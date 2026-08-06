# Prompt AI Studio
# Database Schema Design


## 1. Database Overview

Database:
PostgreSQL

Purpose:

Store users, workspaces, brands, brand intelligence data, prompts and templates.


---

# 2. Main Tables


# users

Stores platform users.


Fields:

id
UUID Primary Key

name
User full name

email
Unique email

password_hash
Encrypted password

role
User role

created_at
Account creation date

updated_at
Last update date



---

# workspaces

Stores user working environments.


Fields:

id
UUID Primary Key

name
Workspace name

owner_id
Reference to users

plan
Subscription plan

created_at

updated_at



---

# workspace_members

Connects users and workspaces.


Fields:

id

workspace_id

user_id

permission

created_at



---

# brands

Stores brand profiles.


Fields:

id

workspace_id

brand_name

industry

description

website

target_audience

brand_goals

created_at

updated_at



---

# brand_identity

Stores brand DNA.


Fields:

id

brand_id

mission

vision

values

personality

tone_of_voice

communication_style



---

# brand_visuals

Stores visual rules.


Fields:

id

brand_id

primary_colors

secondary_colors

fonts

visual_style

image_style

design_rules



---

# brand_rules

Stores content restrictions.


Fields:

id

brand_id

rules

forbidden_words

preferred_words

content_guidelines



---

# prompt_templates

Reusable prompt structures.


Fields:

id

name

category

description

template_content

variables

created_at



---

# prompts

Generated user prompts.


Fields:

id

brand_id

template_id

title

content

category

language

created_by

created_at



---

# content_categories

Content types.


Examples:

- Instagram
- Video
- Image
- SEO
- Advertisement
- Website


Fields:

id

name

description



---

# saved_outputs

Stores user results.


Fields:

id

user_id

prompt_id

content

type

created_at



---

# subscriptions

Future payment system.


Fields:

id

workspace_id

plan

status

start_date

end_date



---

# 3. Relationships


User

1 ---- N

Workspace


Workspace

1 ---- N

Brand


Brand

1 ---- 1

Brand Identity


Brand

1 ---- N

Prompts


Template

1 ---- N

Prompts



---

# 4. MVP Tables

First version requires:


users

workspaces

brands

brand_identity

prompt_templates

prompts


Other tables can be added later.



---

# 5. Database Principles


- Use UUID identifiers
- Keep data modular
- Prepare for AI expansion
- Support multi-brand accounts
- Support team collaboration
- Maintain user ownership

