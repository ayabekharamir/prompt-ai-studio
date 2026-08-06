# Prompt AI Studio
# API Architecture


## 1. Architecture Overview


Frontend:

Next.js + TypeScript


Backend:

FastAPI


Database:

PostgreSQL


Communication:

REST API


Flow:


User

↓

Next.js Frontend

↓

FastAPI Backend

↓

PostgreSQL Database



---

# 2. Authentication API


## Register User


POST

/api/auth/register


Input:


email

password

name



Output:


user_id

token

user_profile



---


## Login User


POST

/api/auth/login


Input:


email

password



Output:


access_token

refresh_token

user_data



---


# 3. Workspace API


## Create Workspace


POST

/api/workspaces


Input:


name



Output:


workspace_id

workspace_data



---


## Get User Workspaces


GET

/api/workspaces



Output:


workspace list



---

# 4. Brand API


## Create Brand


POST

/api/brands


Input:


workspace_id

brand_name

industry

description

audience



Output:


brand profile



---


## Update Brand


PUT

/api/brands/{brand_id}



Update:


identity

voice

visual style

rules



---


## Get Brand


GET

/api/brands/{brand_id}



Output:


complete brand brain



---

# 5. Brand Brain API


## Save Brand Identity


POST

/api/brands/{id}/identity



Stores:


mission

vision

values

tone

personality



---


## Save Brand Rules


POST

/api/brands/{id}/rules



Stores:


communication rules

forbidden rules

content guidelines



---

# 6. Prompt API


## Generate Prompt


POST

/api/prompts/generate



Input:


brand_id

content_type

goal

description



Output:


generated_prompt



---


## Save Prompt


POST

/api/prompts



Input:


prompt_data



Output:


saved_prompt



---


## Get Prompt Library


GET

/api/prompts



Output:


saved prompts list



---

# 7. Template API


## Get Templates


GET

/api/templates



Output:


available templates



---


## Create Template


POST

/api/templates



(Admin only)



---

# 8. Future AI API Layer


Future:


POST

/api/ai/generate



Input:


brand_context

prompt

model



Output:


AI response



Supported models:


OpenAI

Gemini

Claude

Open Source Models



---

# 9. API Security


Rules:


- JWT Authentication
- User permission validation
- Workspace ownership check
- Rate limiting
- Input validation


---

# 10. API Development Principles


- Versioned APIs
- Modular endpoints
- AI provider independence
- Scalable architecture
