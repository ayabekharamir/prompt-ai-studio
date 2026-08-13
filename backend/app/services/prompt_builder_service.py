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
        db.query(BrandBrainIdentity)
        .filter(
            BrandBrainIdentity.brand_id == brand_id
        )
        .first()
    )

    rules = (
        db.query(BrandBrainRule)
        .filter(
            BrandBrainRule.brand_id == brand_id
        )
        .order_by(
            BrandBrainRule.created_at.asc()
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
