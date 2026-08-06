-- =========================================================
-- Prompt AI Studio (PAS) - Database Schema
-- Phase 1 - Development Foundation
-- PostgreSQL | UUID primary keys
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------
-- users
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(255) UNIQUE,
    phone_number        VARCHAR(20) UNIQUE,
    hashed_password     VARCHAR(255),
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    oauth_provider      VARCHAR(50),
    oauth_provider_id   VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_identifier CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- ---------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(150) NOT NULL UNIQUE,
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);

-- ---------------------------------------------------------
-- workspace_members
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role          VARCHAR(30) NOT NULL DEFAULT 'editor', -- owner | admin | editor | viewer
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

-- ---------------------------------------------------------
-- brands
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name          VARCHAR(150) NOT NULL,
    industry      VARCHAR(150),
    website       VARCHAR(255),
    description   TEXT,
    logo_url      VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_workspace_id ON brands(workspace_id);

-- ---------------------------------------------------------
-- brand_identity  (Brand Brain - descriptive data)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_identity (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id                UUID NOT NULL UNIQUE REFERENCES brands(id) ON DELETE CASCADE,
    mission                 TEXT,
    vision                  TEXT,
    target_audience         TEXT,
    tone_of_voice           TEXT,
    core_values             TEXT,
    unique_selling_point    TEXT,
    brand_personality       TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- brand_rules  (Brand Brain - guardrails / constraints)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_rules (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id      UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    rule_type     VARCHAR(50) NOT NULL DEFAULT 'other', -- tone | wording | compliance | visual | other
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_rules_brand_id ON brand_rules(brand_id);

-- ---------------------------------------------------------
-- prompt_templates
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompt_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- NULL = system/global template
    title               VARCHAR(200) NOT NULL,
    category            VARCHAR(100) NOT NULL,
    description         TEXT,
    template_body       TEXT NOT NULL, -- contains {{placeholder}} tokens
    is_system_template  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_workspace_id ON prompt_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);

-- ---------------------------------------------------------
-- prompts
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
    template_id   UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
    created_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,
    content       TEXT NOT NULL,
    status        VARCHAR(30) NOT NULL DEFAULT 'draft', -- draft | saved | archived
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompts_workspace_id ON prompts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_prompts_brand_id ON prompts(brand_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);

-- ---------------------------------------------------------
-- subscriptions  (reserved for future billing/SaaS plan logic)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id      UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    plan              VARCHAR(50) NOT NULL DEFAULT 'free', -- free | pro | enterprise
    status            VARCHAR(30) NOT NULL DEFAULT 'active', -- active | past_due | canceled
    current_period_end TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
