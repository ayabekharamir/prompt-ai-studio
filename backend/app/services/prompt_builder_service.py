"""
Prompt Builder Service.

Builds a final, deterministic prompt from existing project data.

This service does NOT call any AI provider.

Flow:

Brand
    +
Brand Brain
    +
Brand Rules
    +
Product Template + Product
    +
Persona Template + Persona
    +
Prompt Template
    +
Optional variables
    =
Final Prompt text
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.models.brand_brain import BrandBrainIdentity, BrandBrainRule
from app.models.product import Product
from app.models.product_template import ProductTemplate
from app.models.persona import Persona
from app.models.persona_template import PersonaTemplate
from app.models.prompt_template import PromptTemplate


class PromptBuilderNotFoundError(Exception):
    """Raised when a requested builder resource does not exist."""


class PromptBuilderValidationError(Exception):
    """Raised when builder input is invalid."""


def _safe_value(value: Any) -> str:
    """
    Convert a value to a clean string suitable for prompt generation.
    """
    if value is None:
        return ""

    if isinstance(value, bool):
        return "بله" if value else "خیر"

    if isinstance(value, (list, tuple)):
        return ", ".join(_safe_value(item) for item in value if item is not None)

    if isinstance(value, dict):
        parts: list[str] = []

        for key, item in value.items():
            item_text = _safe_value(item)

            if item_text:
                parts.append(f"{key}: {item_text}")

        return "\n".join(parts)

    return str(value).strip()


def _format_field_value(
    field_definition: Any,
    field_values: dict[str, Any],
) -> tuple[str, str]:
    """
    Convert one template field + its value into:

        (human-readable label, value)

    Template field definitions are expected to contain:
        key
        label
        type
        required
    """
    key = getattr(field_definition, "key", None)
    label = getattr(field_definition, "label", None)

    if not key:
        return "", ""

    value = field_values.get(key)

    value_text = _safe_value(value)

    if not value_text:
        return "", ""

    return (
        _safe_value(label) or key,
        value_text,
    )


def _format_dynamic_fields(
    fields: Any,
    field_values: Any,
) -> list[str]:
    """
    Render template-defined fields into readable prompt lines.

    Example:

        fields:
            [
                {"key": "duration", "label": "مدت"},
                {"key": "destination", "label": "مقصد"}
            ]

        field_values:
            {
                "duration": "۳ روز",
                "destination": "گیلان"
            }

    Result:

        [
            "مدت: ۳ روز",
            "مقصد: گیلان"
        ]
    """
    if not fields:
        return []

    if not isinstance(field_values, dict):
        field_values = {}

    result: list[str] = []

    for field in fields:
        label, value = _format_field_value(
            field_definition=field,
            field_values=field_values,
        )

        if label and value:
            result.append(f"{label}: {value}")

    return result


def _format_brand(
    brand: Brand,
) -> list[str]:
    """
    Format basic Brand information.
    """
    lines: list[str] = []

    if getattr(brand, "name", None):
        lines.append(f"نام برند: {_safe_value(brand.name)}")

    if getattr(brand, "industry", None):
        lines.append(f"حوزه فعالیت: {_safe_value(brand.industry)}")

    if getattr(brand, "website", None):
        lines.append(f"وب‌سایت: {_safe_value(brand.website)}")

    if getattr(brand, "description", None):
        lines.append(f"توضیحات برند: {_safe_value(brand.description)}")

    return lines


def _format_brand_identity(
    identity: BrandBrainIdentity | None,
) -> list[str]:
    """
    Format Brand Brain identity fields.
    """
    if identity is None:
        return []

    field_map = [
        ("mission", "ماموریت"),
        ("vision", "چشم‌انداز"),
        ("target_audience", "مخاطب هدف"),
        ("tone_of_voice", "لحن برند"),
        ("core_values", "ارزش‌های اصلی"),
        ("unique_selling_point", "مزیت رقابتی"),
        ("brand_personality", "شخصیت برند"),
    ]

    lines: list[str] = []

    for attribute, label in field_map:
        value = getattr(identity, attribute, None)

        value_text = _safe_value(value)

        if value_text:
            lines.append(f"{label}: {value_text}")

    return lines


def _format_brand_rules(
    rules: list[BrandBrainRule] | None,
) -> list[str]:
    """
    Format Brand Brain content rules.
    """
    if not rules:
        return []

    lines: list[str] = []

    for rule in rules:
        title = _safe_value(getattr(rule, "title", None))
        description = _safe_value(getattr(rule, "description", None))
        rule_type = _safe_value(getattr(rule, "rule_type", None))

        if title and description:
            if rule_type:
                lines.append(
                    f"- {title} ({rule_type}): {description}"
                )
            else:
                lines.append(
                    f"- {title}: {description}"
                )

        elif title:
            if rule_type:
                lines.append(
                    f"- {title} ({rule_type})"
                )
            else:
                lines.append(
                    f"- {title}"
                )

        elif description:
            lines.append(f"- {description}")

    return lines


def _format_product(
    product: Product,
    template: ProductTemplate | None,
) -> list[str]:
    """
    Format a Product using its ProductTemplate field definitions.
    """
    lines: list[str] = []

    if getattr(product, "name", None):
        lines.append(f"نام محصول: {_safe_value(product.name)}")

    field_values = getattr(product, "field_values", None) or {}

    if template is not None:
        dynamic_fields = _format_dynamic_fields(
            fields=getattr(template, "fields", None),
            field_values=field_values,
        )

        lines.extend(dynamic_fields)

    elif field_values:
        # Safe fallback if the template cannot be loaded.
        for key, value in field_values.items():
            value_text = _safe_value(value)

            if value_text:
                lines.append(f"{key}: {value_text}")

    return lines


def _format_persona(
    persona: Persona,
    template: PersonaTemplate | None,
) -> list[str]:
    """
    Format a Persona using its PersonaTemplate field definitions.
    """
    lines: list[str] = []

    if getattr(persona, "name", None):
        lines.append(f"نام شخصیت: {_safe_value(persona.name)}")

    field_values = getattr(persona, "field_values", None) or {}

    if template is not None:
        dynamic_fields = _format_dynamic_fields(
            fields=getattr(template, "fields", None),
            field_values=field_values,
        )

        lines.extend(dynamic_fields)

    elif field_values:
        # Safe fallback if the template cannot be loaded.
        for key, value in field_values.items():
            value_text = _safe_value(value)

            if value_text:
                lines.append(f"{key}: {value_text}")

    return lines


def _replace_variables(
    text: str,
    variables: dict[str, Any] | None,
) -> str:
    """
    Replace optional user-defined variables.

    Supported syntax:

        {variable}

    Example:

        {content_type}

    becomes:

        کپشن اینستاگرام
    """
    if not variables:
        return text

    result = text

    for key, value in variables.items():
        placeholder = "{" + str(key) + "}"
        result = result.replace(
            placeholder,
            _safe_value(value),
        )

    return result


def _replace_standard_placeholders(
    text: str,
    context: dict[str, str],
) -> str:
    """
    Replace standard builder placeholders.

    Supported placeholders:

        {brand}
        {brand_name}
        {brand_identity}
        {brand_rules}
        {product}
        {product_name}
        {persona}
        {persona_name}
    """
    replacements = {
        "{brand}": context.get("brand", ""),
        "{brand_name}": context.get("brand_name", ""),
        "{brand_identity}": context.get("brand_identity", ""),
        "{brand_rules}": context.get("brand_rules", ""),
        "{product}": context.get("product", ""),
        "{product_name}": context.get("product_name", ""),
        "{persona}": context.get("persona", ""),
        "{persona_name}": context.get("persona_name", ""),
    }

    result = text

    for placeholder, value in replacements.items():
        result = result.replace(
            placeholder,
            value,
        )

    return result


def _cleanup_prompt(text: str) -> str:
    """
    Clean the generated prompt without changing its meaning.
    """
    lines = [line.rstrip() for line in text.splitlines()]

    cleaned: list[str] = []
    previous_blank = False

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if not previous_blank:
                cleaned.append("")
            previous_blank = True
            continue

        cleaned.append(line)
        previous_blank = False

    return "\n".join(cleaned).strip()


def build_prompt(
    db: Session,
    brand_id: str,
    prompt_template_id: str,
    product_id: str | None = None,
    persona_id: str | None = None,
    variables: dict[str, Any] | None = None,
) -> str:
    """
    Build the final prompt deterministically from database data.

    This function performs NO AI execution.

    Required:
        brand_id
        prompt_template_id

    Optional:
        product_id
        persona_id
        variables

    Returns:
        Final prompt string.
    """

    # ------------------------------------------------------------------
    # Prompt Template
    # ------------------------------------------------------------------

    prompt_template = (
        db.query(PromptTemplate)
        .filter(PromptTemplate.id == prompt_template_id)
        .first()
    )

    if prompt_template is None:
        raise PromptBuilderNotFoundError(
            "Prompt template not found"
        )

    template_body = _safe_value(
        getattr(prompt_template, "template_body", None)
    )

    if not template_body:
        raise PromptBuilderValidationError(
            "Prompt template body is empty"
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
        db.query(BrandBrainIdentity)
        .filter(BrandBrainIdentity.brand_id == brand_id)
        .first()
    )

    rules = (
        db.query(BrandBrainRule)
        .filter(BrandBrainRule.brand_id == brand_id)
        .order_by(BrandBrainRule.created_at.asc())
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

    identity_lines = _format_brand_identity(identity)

    rule_lines = _format_brand_rules(rules)

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

    brand_text = "\n".join(brand_lines)
    identity_text = "\n".join(identity_lines)
    rules_text = "\n".join(rule_lines)
    product_text = "\n".join(product_lines)
    persona_text = "\n".join(persona_lines)

    # ------------------------------------------------------------------
    # Standard placeholder context
    # ------------------------------------------------------------------

    context = {
        "brand": brand_text,
        "brand_name": _safe_value(getattr(brand, "name", None)),
        "brand_identity": identity_text,
        "brand_rules": rules_text,
        "product": product_text,
        "product_name": (
            _safe_value(getattr(product, "name", None))
            if product is not None
            else ""
        ),
        "persona": persona_text,
        "persona_name": (
            _safe_value(getattr(persona, "name", None))
            if persona is not None
            else ""
        ),
    }

    # ------------------------------------------------------------------
    # Build final prompt
    # ------------------------------------------------------------------

    final_prompt = _replace_standard_placeholders(
        text=template_body,
        context=context,
    )

    final_prompt = _replace_variables(
        text=final_prompt,
        variables=variables,
    )

    return _cleanup_prompt(final_prompt)
