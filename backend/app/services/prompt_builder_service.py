"""Deterministic Prompt Builder Service (NO AI)."""

from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.brand_identity import BrandIdentity
from app.models.brand_rules import BrandRule
from app.models.product import Product
from app.models.product_template import ProductTemplate
from app.models.persona import Persona
from app.models.persona_template import PersonaTemplate
from app.models.prompt_template import PromptTemplate

class PromptBuilderNotFoundError(Exception):
    pass

class PromptBuilderValidationError(Exception):
    pass

def _safe_value(value: Any) -> str:
    if value is None: return ""
    if isinstance(value, dict): return "\n".join(f"{k}: {v}" for k,v in value.items() if v not in (None,""))
    if isinstance(value, (list,tuple)): return "\n".join(str(x) for x in value if x not in (None,""))
    return str(value).strip()

def _cleanup_prompt(text: str) -> str:
    return "\n".join(x.rstrip() for x in text.splitlines()).strip()

def _format_brand(obj):
    return [f"نام برند: {obj.name}"] if getattr(obj,"name",None) else []

def _format_brand_identity(obj):
    if not obj: return []
    return [f"{k}: {getattr(obj,k)}" for k in ["mission","vision","tone_of_voice","target_audience"] if getattr(obj,k,None)]

def _format_brand_rules(rules):
    return [f"{getattr(r,'title','')}: {getattr(r,'description','')}" for r in rules if getattr(r,'title',None) or getattr(r,'description',None)]

def _field_key_label(field: Any) -> tuple[str | None, str | None]:
    """Read (key, label) from a field definition, whether it's a dict
    (as stored in JSONType columns) or an object with attributes."""
    if isinstance(field, dict):
        return field.get("key"), field.get("label")
    return getattr(field, "key", None), getattr(field, "label", None)


def _format_field_details(field_values: dict | None, fields: list | None) -> list[str]:
    """Build one line per template field: 'برچسب نمایشی: متن برچسب' when a
    value is stored, or just 'برچسب نمایشی' when no value was stored for it."""
    if not fields:
        return []

    field_values = field_values or {}
    lines: list[str] = []

    for field in fields:
        key, label = _field_key_label(field)

        if not label:
            continue

        raw_value = field_values.get(key) if key else None
        value_text = _safe_value(raw_value)

        if value_text:
            lines.append(f"{label}: {value_text}")
        else:
            lines.append(label)

    return lines


def _format_product(product, template=None):
    if not product:
        return []

    lines = [f"نام محصول: {product.name}"]
    lines.extend(
        _format_field_details(
            field_values=getattr(product, "field_values", None),
            fields=getattr(template, "fields", None),
        )
    )
    return lines

def _format_persona(persona, template=None):
    if not persona:
        return []

    lines = [f"نام پرسونا: {persona.name}"]
    lines.extend(
        _format_field_details(
            field_values=getattr(persona, "field_values", None),
            fields=getattr(template, "fields", None),
        )
    )
    return lines

def _replace_standard_placeholders(text, context):
    for k,v in context.items():
        text=text.replace("{{"+k+"}}", v or "")
        text=text.replace("{{ "+k+" }}", v or "")
    return text

def _replace_variables(text, variables):
    if not variables: return text
    return _replace_standard_placeholders(text,{k:_safe_value(v) for k,v in variables.items()})

def build_prompt(
    db: Session,
    brand_id: str,
    task: str,
    prompt_template_id: str | None = None,
    product_id: str | None = None,
    persona_id: str | None = None,
    extra_context: dict[str, Any] | None = None,
) -> str:
    """
    Build the final prompt deterministically from database data.

    This function NEVER calls an AI provider.

    Required:
        brand_id
        task

    Optional:
        prompt_template_id
        product_id
        persona_id
        extra_context

    Flow:

        Brand
        + Brand Brain
        + Brand Rules
        + Product Template + Product
        + Persona Template + Persona
        + Prompt Template
        + Task
        + Extra Context
        =
        Final Prompt
    """

    task_text = _safe_value(task)

    if not task_text:
        raise PromptBuilderValidationError(
            "Task cannot be empty"
        )

    # ------------------------------------------------------------------
    # Prompt Template
    # ------------------------------------------------------------------

    prompt_template: PromptTemplate | None = None

    if prompt_template_id:
        prompt_template = (
            db.query(PromptTemplate)
            .filter(PromptTemplate.id == prompt_template_id)
            .first()
        )

        if prompt_template is None:
            raise PromptBuilderNotFoundError(
                "Prompt template not found"
            )

    # ------------------------------------------------------------------
    # Brand
    # ------------------------------------------------------------------

    brand = (
        db.query(Brand)
        .filter(Brand.id == brand_id)
        .first()
    )

    if brand is None:
        raise PromptBuilderNotFoundError(
            "Brand not found"
        )

    # ------------------------------------------------------------------
    # Brand Brain
    # ------------------------------------------------------------------

    identity = (
        db.query(BrandIdentity)
        .filter(
            BrandIdentity.brand_id == brand_id
        )
        .first()
    )

    rules = (
        db.query(BrandRule)
        .filter(
            BrandRule.brand_id == brand_id
        )
        .order_by(
            BrandRule.created_at.asc()
        )
        .all()
    )

    # ------------------------------------------------------------------
    # Product
    # ------------------------------------------------------------------

    product: Product | None = None
    product_template: ProductTemplate | None = None

    if product_id:
        product = (
            db.query(Product)
            .filter(
                Product.id == product_id,
                Product.brand_id == brand_id,
            )
            .first()
        )

        if product is None:
            raise PromptBuilderNotFoundError(
                "Product not found"
            )

        product_template_id = getattr(
            product,
            "template_id",
            None,
        )

        if product_template_id:
            product_template = (
                db.query(ProductTemplate)
                .filter(
                    ProductTemplate.id == product_template_id,
                    ProductTemplate.brand_id == brand_id,
                )
                .first()
            )

    # ------------------------------------------------------------------
    # Persona
    # ------------------------------------------------------------------

    persona: Persona | None = None
    persona_template: PersonaTemplate | None = None

    if persona_id:
        persona = (
            db.query(Persona)
            .filter(
                Persona.id == persona_id,
                Persona.brand_id == brand_id,
            )
            .first()
        )

        if persona is None:
            raise PromptBuilderNotFoundError(
                "Persona not found"
            )

        persona_template_id = getattr(
            persona,
            "template_id",
            None,
        )

        if persona_template_id:
            persona_template = (
                db.query(PersonaTemplate)
                .filter(
                    PersonaTemplate.id == persona_template_id,
                    PersonaTemplate.brand_id == brand_id,
                )
                .first()
            )

    # ------------------------------------------------------------------
    # Format context
    # ------------------------------------------------------------------

    brand_lines = _format_brand(brand)

    identity_lines = _format_brand_identity(
        identity
    )

    rule_lines = _format_brand_rules(
        rules
    )

    product_lines: list[str] = []

    if product is not None:
        product_lines = _format_product(
            product=product,
            template=product_template,
        )

    persona_lines: list[str] = []

    if persona is not None:
        persona_lines = _format_persona(
            persona=persona,
            template=persona_template,
        )

    brand_text = "\n".join(
        brand_lines
    )

    identity_text = "\n".join(
        identity_lines
    )

    rules_text = "\n".join(
        rule_lines
    )

    product_text = "\n".join(
        product_lines
    )

    persona_text = "\n".join(
        persona_lines
    )

    # ------------------------------------------------------------------
    # Standard placeholder context
    # ------------------------------------------------------------------

    context = {
        "brand": brand_text,
        "brand_name": _safe_value(
            getattr(brand, "name", None)
        ),
        "brand_identity": identity_text,
        "brand_rules": rules_text,
        "product": product_text,
        "product_name": (
            _safe_value(
                getattr(product, "name", None)
            )
            if product is not None
            else ""
        ),
        "persona": persona_text,
        "persona_name": (
            _safe_value(
                getattr(persona, "name", None)
            )
            if persona is not None
            else ""
        ),
        "task": task_text,
        "extra_context": _safe_value(
            extra_context
        ),
    }

    # ------------------------------------------------------------------
    # Build from Prompt Template when available
    # ------------------------------------------------------------------

    if prompt_template is not None:

        template_body = _safe_value(
            getattr(
                prompt_template,
                "template_body",
                None,
            )
        )

        if not template_body:
            raise PromptBuilderValidationError(
                "Prompt template body is empty"
            )

        final_prompt = _replace_standard_placeholders(
            text=template_body,
            context=context,
        )

        final_prompt = _replace_variables(
            text=final_prompt,
            variables=extra_context,
        )

        return _cleanup_prompt(
            final_prompt
        )

    # ------------------------------------------------------------------
    # Default deterministic prompt
    # ------------------------------------------------------------------

    sections: list[str] = []

    if brand_text:
        sections.append(
            "هویت برند:\n"
            + brand_text
        )

    if identity_text:
        sections.append(
            "اطلاعات هویتی برند:\n"
            + identity_text
        )

    if rules_text:
        sections.append(
            "قوانین برند:\n"
            + rules_text
        )

    if product_text:
        sections.append(
            "محصول:\n"
            + product_text
        )

    if persona_text:
        sections.append(
            "شخصیت برند:\n"
            + persona_text
        )

    sections.append(
        "وظیفه:\n"
        + task_text
    )

    extra_context_text = _safe_value(
        extra_context
    )

    if extra_context_text:
        sections.append(
            "اطلاعات تکمیلی:\n"
            + extra_context_text
        )

    return _cleanup_prompt(
        "\n\n".join(sections)
    )
