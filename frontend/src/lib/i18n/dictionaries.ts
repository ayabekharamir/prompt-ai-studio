/**
 * Bilingual dictionary for Prompt AI Studio (Persian / English).
 *
 * Keep this file as the single source of truth for user-facing strings.
 * Access strings from components via the `useLanguage()` hook's `t()`
 * function, e.g. `t("auth.login.title")`.
 */

export const dictionaries = {
  fa: {
    common: {
      appName: "استودیو پرامپت هوشمند",
      tagline: "مغز هوشمند ساخت محتوای برندها",
      loading: "در حال بارگذاری...",
      cancel: "لغو",
      save: "ذخیره",
      create: "ایجاد",
      back: "بازگشت",
      optional: "اختیاری",
      comingSoon: "به‌زودی فعال می‌شود",
      or: "یا",
    },

    theme: {
      light: "روشن",
      dark: "تیره",
      toggle: "تغییر حالت روشن/تیره",
    },

    lang: {
      toggle: "تغییر زبان",
    },

    nav: {
      logout: "خروج",
      dashboard: "داشبورد",
      workspaces: "فضاهای کاری",
      brands: "برندها",
      prompts: "پرامپت‌ها",
      products: "محصولات",
      personas: "شخصیت‌ها",
      profile: "پروفایل",
    },

    home: {
      title: "استودیو پرامپت هوشمند",
      subtitle: "مغز هوشمند ساخت محتوای برند خود را بسازید",
    },

    auth: {
      loginTab: "ورود",
      registerTab: "ثبت‌نام",
      emailTab: "ایمیل",
      phoneTab: "شماره موبایل",

      login: {
        title: "ورود",
        subtitle: "وارد حساب استودیو پرامپت هوشمند خود شوید.",
        email: "ایمیل",
        phone: "شماره موبایل",
        password: "رمز عبور",
        submit: "ورود",
        submitting: "در حال ورود...",
        noAccount: "حساب ندارید؟",
        registerLink: "ثبت‌نام کنید",
        errorInvalid: "ایمیل/شماره موبایل یا رمز عبور اشتباه است.",
        googleButton: "ورود با گوگل",
      },

      register: {
        title: "ایجاد حساب کاربری",
        subtitle:
          "چند ثانیه زمان می‌برد، سپس می‌توانید اولین فضای کاری خود را ایجاد کنید.",
        fullName: "نام کامل",
        email: "ایمیل",
        phone: "شماره موبایل",
        password: "رمز عبور",
        submit: "ثبت‌نام",
        submitting: "در حال ثبت‌نام...",
        haveAccount: "قبلاً حساب دارید؟",
        loginLink: "وارد شوید",
        errorGeneric:
          "ثبت‌نام ناموفق بود. ممکن است این اطلاعات قبلاً استفاده شده باشد.",
        googleButton: "ثبت‌نام با گوگل",
      },

      otp: {
        title: "تأیید شماره موبایل",
        description: "کد تأییدی که برای شماره‌ات پیامک شد رو وارد کن.",
        sendCode: "ارسال کد تأیید",
        sending: "در حال ارسال...",
        codeSentTo: "کد تأیید به شماره {phone} ارسال شد.",
        codeLabel: "کد تأیید",
        verify: "تأیید کد",
        verifying: "در حال بررسی...",
        verified: "شماره موبایل با موفقیت تأیید شد.",
        resend: "ارسال دوباره کد",
        skip: "فعلاً رد شو",
        invalidCode: "کد وارد شده نامعتبر یا منقضی شده است.",
        requestError: "ارسال کد با خطا مواجه شد.",
        mockNotice:
          "در این نسخه، پیامک واقعی ارسال نمی‌شود (حالت آزمایشی).",
      },
    },

    dashboard: {
      title: "فضاهای کاری شما",
      subtitle:
        "هر فضای کاری می‌تواند چند برند و کتابخانه پرامپت جداگانه داشته باشد.",
      newWorkspace: "+ فضای کاری جدید",
      formLabel: "نام فضای کاری",
      formPlaceholder: "مثلاً: برند اصلی من",
      loadError: "دریافت فضاهای کاری با خطا مواجه شد.",
      createError: "ایجاد فضای کاری با خطا مواجه شد.",
      emptyTitle: "هنوز هیچ فضای کاری ایجاد نکرده‌اید",
      emptyDesc:
        "یک فضای کاری ایجاد کنید تا بتوانید برندها و پرامپت‌ها را اضافه کنید.",
      emptyAction: "ایجاد اولین فضای کاری",
      createdAt: "ایجاد شده در {date}",
    },

    workspaceNav: {
      brands: "برندها",
      prompts: "پرامپت‌ها",
    },

    workspaceOverview: {
      title: "فضای کاری",
      createdAt: "ایجاد شده در {date}",

      brandsCount: "برندها",
      promptsCount: "پرامپت‌ها",

      newBrand: "+ برند جدید",
      openPrompts: "باز کردن پرامپت‌ها",

      brandsTitle: "برندها",
      brandsDescription:
        "هر برند یک مغز برند جداگانه شامل هویت و قوانین محتوایی دارد.",

      emptyBrandsTitle: "هنوز هیچ برندی ایجاد نکرده‌اید",
      emptyBrandsDescription:
        "یک برند ایجاد کنید تا بتوانید مغز برند و پرامپت‌های آن را تعریف کنید.",
      emptyBrandsAction: "+ برند جدید",

      loadError: "دریافت اطلاعات فضای کاری با خطا مواجه شد.",
    },

    brands: {
      title: "برندها",
      subtitle:
        "هر برند یک مغز برند جداگانه شامل هویت و قوانین محتوایی دارد.",
      newBrand: "+ برند جدید",
      loadError: "دریافت برندها با خطا مواجه شد.",
      emptyTitle: "هنوز هیچ برندی ایجاد نکرده‌اید",
      emptyDesc:
        "ابتدا یک برند ایجاد کنید تا بتوانید مغز برند و پرامپت‌های آن را تعریف کنید.",
      emptyAction: "ایجاد اولین برند",
    },

    brandNew: {
      title: "برند جدید",
      subtitle:
        "اطلاعات پایه برند را وارد کنید؛ جزئیات مغز برند در مرحله بعد تکمیل می‌شود.",
      name: "نام برند",
      industry: "حوزه فعالیت",
      industryPlaceholder: "مثلاً: پوشاک، فناوری، غذا",
      website: "وب‌سایت",
      description: "توضیحات",
      submit: "ایجاد برند",
      createError: "ایجاد برند با خطا مواجه شد.",
    },

    brandBrain: {
      subtitle: "مغز برند — هویت و قوانین محتوایی این برند",
      identityTitle: "هویت برند",
      saveIdentity: "ذخیره هویت برند",
      saved: "مغز برند ذخیره شد.",
      loadError: "دریافت اطلاعات مغز برند با خطا مواجه شد.",
      saveError: "ذخیره تغییرات با خطا مواجه شد.",
      rulesTitle: "قوانین محتوایی",
      newRule: "+ قانون جدید",
      ruleType: "نوع قانون",
      ruleTypePlaceholder: "مثلاً: کلمات ممنوعه، سبک نگارش",
      ruleTitle: "عنوان",
      ruleDescription: "توضیح",
      addRule: "افزودن قانون",
      addRuleError: "افزودن قانون با خطا مواجه شد.",
      emptyRules: "هنوز قانونی اضافه نشده است",

      fields: {
        mission: "ماموریت",
        vision: "چشم‌انداز",
        target_audience: "مخاطب هدف",
        tone_of_voice: "لحن برند",
        core_values: "ارزش‌های اصلی",
        unique_selling_point: "مزیت رقابتی",
        brand_personality: "شخصیت برند",
      },
    },

    brandAssets: {
      title: "دارایی‌های بصری برند",
      subtitle: "لوگوها، تصاویر محصولات و فایل‌های مرجع برند خود را مدیریت کنید.",
      uploadLabel: "انتخاب فایل",
      categoryLabel: "دسته‌بندی",
      upload: "آپلود دارایی",
      uploading: "در حال آپلود...",
      uploadSuccess: "فایل با موفقیت آپلود شد.",
      uploadError: "خطا در آپلود فایل.",
      invalidFileType: "فرمت فایل نامعتبر است.",
      delete: "حذف",
      deleteConfirm: "آیا از حذف این دارایی مطمئن هستید؟",
      deleteSuccess: "دارایی با موفقیت حذف شد.",
      deleteError: "خطا در حذف دارایی.",
      loadError: "خطا در دریافت دارایی‌های برند.",
      empty: "هنوز هیچ دارایی بصری اضافه نشده است.",
      categories: {
        logo: "لوگو اصلی",
        logo_variant: "واریاسیون لوگو",
        brand_photo: "تصویر برند",
        product: "محصول",
        character: "کاراکتر / ایجنت",
        reference: "مرجع بصری",
        other: "سایر",
      },
    },

    products: {
      title: "محصولات",
      subtitle: "برای هر دسته از محصولاتتان یک قالب بسازید، سپس محصولات را بر اساس آن قالب اضافه کنید.",
      newTemplate: "+ قالب جدید",
      templateNameLabel: "نام قالب",
      templateDescLabel: "توضیحات قالب",
      fieldsLabel: "فیلدهای قالب",
      fieldKeyLabel: "کلید (انگلیسی)",
      fieldLabelLabel: "برچسب نمایشی",
      fieldTypeLabel: "نوع فیلد",
      fieldOptionsLabel: "گزینه‌ها",
      fieldOptionsPlaceholder: "گزینه۱, گزینه۲, گزینه۳",
      fieldRequiredLabel: "الزامی",
      fieldTypes: {
        text: "متن کوتاه",
        textarea: "متن بلند",
        number: "عدد",
        image: "تصویر",
        select: "انتخابی",
      },
      addField: "+ افزودن فیلد",
      saveTemplate: "ذخیره قالب",
      saveTemplateError: "ذخیره قالب با خطا مواجه شد.",
      loadTemplatesError: "دریافت قالب‌های محصول با خطا مواجه شد.",
      deleteTemplateConfirm: "آیا از حذف این قالب مطمئن هستید؟ همهٔ محصولات این قالب هم حذف می‌شوند.",
      deleteTemplateError: "حذف قالب با خطا مواجه شد.",
      emptyTemplates: "هنوز هیچ قالب محصولی نساخته‌اید",
      emptyTemplatesDesc: "برای شروع، یک قالب محصول بسازید (مثلاً «تور» یا «اقامتگاه»).",
      newItem: "+ محصول جدید",
      itemNameLabel: "نام محصول",
      saveItem: "ذخیره محصول",
      saveItemError: "ذخیره محصول با خطا مواجه شد.",
      loadItemsError: "دریافت محصولات با خطا مواجه شد.",
      deleteItem: "حذف",
      deleteItemConfirm: "آیا از حذف این محصول مطمئن هستید؟",
      deleteItemError: "حذف محصول با خطا مواجه شد.",
      emptyItems: "هنوز محصولی در این قالب اضافه نشده است.",
    },

    personas: {
      title: "شخصیت‌های برند",
      subtitle: "برای هر دسته از شخصیت‌های برند (مشتری، اینفلوئنسر، عضو تیم و ...) یک قالب بسازید، سپس شخصیت‌ها را بر اساس آن قالب اضافه کنید.",
      newTemplate: "+ قالب جدید",
      templateNameLabel: "نام قالب",
      templateDescLabel: "توضیحات قالب",
      fieldsLabel: "فیلدهای قالب",
      fieldKeyLabel: "کلید (انگلیسی)",
      fieldLabelLabel: "برچسب نمایشی",
      fieldTypeLabel: "نوع فیلد",
      fieldOptionsLabel: "گزینه‌ها",
      fieldOptionsPlaceholder: "گزینه۱, گزینه۲, گزینه۳",
      fieldRequiredLabel: "الزامی",
      fieldTypes: {
        text: "متن کوتاه",
        textarea: "متن بلند",
        number: "عدد",
        image: "تصویر",
        select: "انتخابی",
      },
      addField: "+ افزودن فیلد",
      saveTemplate: "ذخیره قالب",
      saveTemplateError: "ذخیره قالب با خطا مواجه شد.",
      loadTemplatesError: "دریافت قالب‌های شخصیت با خطا مواجه شد.",
      deleteTemplateConfirm: "آیا از حذف این قالب مطمئن هستید؟ همهٔ شخصیت‌های این قالب هم حذف می‌شوند.",
      deleteTemplateError: "حذف قالب با خطا مواجه شد.",
      emptyTemplates: "هنوز هیچ قالب شخصیتی نساخته‌اید",
      emptyTemplatesDesc: "برای شروع، یک قالب شخصیت بسازید (مثلاً «مشتری ایده‌آل» یا «اینفلوئنسر»).",
      newItem: "+ شخصیت جدید",
      itemNameLabel: "نام شخصیت",
      saveItem: "ذخیره شخصیت",
      saveItemError: "ذخیره شخصیت با خطا مواجه شد.",
      loadItemsError: "دریافت شخصیت‌ها با خطا مواجه شد.",
      deleteItem: "حذف",
      deleteItemConfirm: "آیا از حذف این شخصیت مطمئن هستید؟",
      deleteItemError: "حذف شخصیت با خطا مواجه شد.",
      emptyItems: "هنوز شخصیتی در این قالب اضافه نشده است.",
    },

    prompts: {
      title: "پرامپت‌ها",
      newPrompt: "+ پرامپت جدید",
      mine: "پرامپت‌های من ({count})",
      templates: "قالب‌های پرامپت ({count})",
      loadError: "دریافت پرامپت‌ها با خطا مواجه شد.",
      emptyMineTitle: "هنوز پرامپتی ایجاد نکرده‌اید",
      emptyMineDesc: "از یک قالب شروع کنید یا یک پرامپت جدید ایجاد کنید.",
      emptyMineAction: "ایجاد اولین پرامپت",
      emptyTemplates: "هنوز قالب پرامپتی در کتابخانه وجود ندارد",
      useTemplate: "استفاده از این قالب ←",

      status: {
        draft: "پیش‌نویس",
        saved: "ذخیره‌شده",
        archived: "بایگانی‌شده",
      },
    },

    promptNew: {
      title: "پرامپت جدید",
      subtitle:
        "از یک قالب پرامپت شروع کنید، برند مرتبط را انتخاب کنید و متن نهایی را ویرایش کنید.",
      templateLabel: "قالب پرامپت",
      noTemplate: "بدون قالب — از ابتدا بنویس",
      brandLabel: "برند مرتبط",
      noBrand: "بدون برند",
      titleLabel: "عنوان",
      contentLabel: "متن پرامپت",
      submit: "ذخیره پرامپت",
      saveError: "ذخیره پرامپت با خطا مواجه شد.",
    },
  },

  en: {
    common: {
      appName: "Prompt AI Studio",
      tagline: "Build Your Brand's AI Brain",
      loading: "Loading...",
      cancel: "Cancel",
      save: "Save",
      create: "Create",
      back: "Back",
      optional: "optional",
      comingSoon: "Coming soon",
      or: "or",
    },

    theme: {
      light: "Light",
      dark: "Dark",
      toggle: "Toggle light/dark theme",
    },

    lang: {
      toggle: "Switch language",
    },

    nav: {
      logout: "Log out",
      dashboard: "Dashboard",
      workspaces: "Workspaces",
      brands: "Brands",
      prompts: "Prompts",
      products: "Products",
      personas: "Personas",
      profile: "Profile",
    },

    home: {
      title: "Prompt AI Studio",
      subtitle: "Build Your Brand's AI Brain",
    },

    auth: {
      loginTab: "Log in",
      registerTab: "Sign up",
      emailTab: "Email",
      phoneTab: "Phone number",

      login: {
        title: "Log in",
        subtitle: "Sign in to your Prompt AI Studio account.",
        email: "Email",
        phone: "Phone number",
        password: "Password",
        submit: "Log in",
        submitting: "Logging in...",
        noAccount: "Don't have an account?",
        registerLink: "Sign up",
        errorInvalid: "Invalid email/phone or password.",
        googleButton: "Continue with Google",
      },

      register: {
        title: "Create your account",
        subtitle:
          "Takes a few seconds — then you can set up your first workspace.",
        fullName: "Full name",
        email: "Email",
        phone: "Phone number",
        password: "Password",
        submit: "Sign up",
        submitting: "Signing up...",
        haveAccount: "Already have an account?",
        loginLink: "Log in",
        errorGeneric: "Sign up failed. This may already be in use.",
        googleButton: "Sign up with Google",
      },

      otp: {
        title: "Verify your phone number",
        description: "Enter the code that was texted to your phone.",
        sendCode: "Send verification code",
        sending: "Sending...",
        codeSentTo: "A verification code was sent to {phone}.",
        codeLabel: "Verification code",
        verify: "Verify code",
        verifying: "Verifying...",
        verified: "Phone number verified successfully.",
        resend: "Resend code",
        skip: "Skip for now",
        invalidCode: "The code is invalid or has expired.",
        requestError: "Failed to send the verification code.",
        mockNotice:
          "This build doesn't send a real SMS yet (test mode).",
      },
    },

    dashboard: {
      title: "Your workspaces",
      subtitle:
        "Each workspace can hold several brands and its own prompt library.",
      newWorkspace: "+ New workspace",
      formLabel: "Workspace name",
      formPlaceholder: "e.g. My main brand",
      loadError: "Failed to load workspaces.",
      createError: "Failed to create the workspace.",
      emptyTitle: "You haven't created a workspace yet",
      emptyDesc: "Create a workspace to start adding brands and prompts.",
      emptyAction: "Create your first workspace",
      createdAt: "Created {date}",
    },

    workspaceNav: {
      brands: "Brands",
      prompts: "Prompts",
    },

    workspaceOverview: {
      title: "Workspace",
      createdAt: "Created {date}",

      brandsCount: "Brands",
      promptsCount: "Prompts",

      newBrand: "+ New brand",
      openPrompts: "Open Prompts",

      brandsTitle: "Brands",
      brandsDescription:
        "Each brand has its own Brand Brain, including identity and content rules.",

      emptyBrandsTitle: "You haven't created a brand yet",
      emptyBrandsDescription:
        "Create a brand to define its Brand Brain and prompts.",
      emptyBrandsAction: "+ New brand",

      loadError: "Failed to load workspace details.",
    },

    brands: {
      title: "Brands",
      subtitle: "Each brand has its own Brand Brain (identity + rules).",
      newBrand: "+ New brand",
      loadError: "Failed to load brands.",
      emptyTitle: "You haven't created a brand yet",
      emptyDesc:
        "Create a brand first so you can define its Brand Brain and prompts.",
      emptyAction: "Create your first brand",
    },

    brandNew: {
      title: "New brand",
      subtitle:
        "Enter the basics — you'll fill in the Brand Brain details next.",
      name: "Brand name",
      industry: "Industry",
      industryPlaceholder: "e.g. Fashion, Tech, Food",
      website: "Website",
      description: "Description",
      submit: "Create brand",
      createError: "Failed to create the brand.",
    },

    brandBrain: {
      subtitle: "Brand Brain — this brand's identity and content rules",
      identityTitle: "Brand identity",
      saveIdentity: "Save brand identity",
      saved: "Brand Brain saved.",
      loadError: "Failed to load Brand Brain data.",
      saveError: "Failed to save changes.",
      rulesTitle: "Content rules",
      newRule: "+ New rule",
      ruleType: "Rule type",
      ruleTypePlaceholder: "e.g. Forbidden words, Writing style",
      ruleTitle: "Title",
      ruleDescription: "Description",
      addRule: "Add rule",
      addRuleError: "Failed to add the rule.",
      emptyRules: "No rules added yet",

      fields: {
        mission: "Mission",
        vision: "Vision",
        target_audience: "Target audience",
        tone_of_voice: "Tone of voice",
        core_values: "Core values",
        unique_selling_point: "Unique selling point (USP)",
        brand_personality: "Brand personality",
      },
    },

    brandAssets: {
      title: "Brand Visual Assets",
      subtitle: "Manage logos, product images, and reference files.",
      uploadLabel: "Select file",
      categoryLabel: "Category",
      upload: "Upload Asset",
      uploading: "Uploading...",
      uploadSuccess: "Asset uploaded successfully.",
      uploadError: "Failed to upload asset.",
      invalidFileType: "Invalid file type.",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this asset?",
      deleteSuccess: "Asset deleted successfully.",
      deleteError: "Failed to delete asset.",
      loadError: "Failed to load brand assets.",
      empty: "No visual assets added yet.",
      categories: {
        logo: "Main Logo",
        logo_variant: "Logo Variant",
        brand_photo: "Brand Photo",
        product: "Product",
        character: "Character / Agent",
        reference: "Visual Reference",
        other: "Other",
      },
    },

    products: {
      title: "Products",
      subtitle: "Define a template for each product category, then add products based on that template.",
      newTemplate: "+ New Template",
      templateNameLabel: "Template Name",
      templateDescLabel: "Template Description",
      fieldsLabel: "Template Fields",
      fieldKeyLabel: "Key (English)",
      fieldLabelLabel: "Display Label",
      fieldTypeLabel: "Field Type",
      fieldOptionsLabel: "Options",
      fieldOptionsPlaceholder: "option1, option2, option3",
      fieldRequiredLabel: "Required",
      fieldTypes: {
        text: "Short text",
        textarea: "Long text",
        number: "Number",
        image: "Image",
        select: "Select",
      },
      addField: "+ Add Field",
      saveTemplate: "Save Template",
      saveTemplateError: "Failed to save template.",
      loadTemplatesError: "Failed to load product templates.",
      deleteTemplateConfirm: "Delete this template? All products under it will be deleted too.",
      deleteTemplateError: "Failed to delete template.",
      emptyTemplates: "No product templates yet",
      emptyTemplatesDesc: "Start by creating a product template (e.g. \"Tour\" or \"Accommodation\").",
      newItem: "+ New Product",
      itemNameLabel: "Product Name",
      saveItem: "Save Product",
      saveItemError: "Failed to save product.",
      loadItemsError: "Failed to load products.",
      deleteItem: "Delete",
      deleteItemConfirm: "Are you sure you want to delete this product?",
      deleteItemError: "Failed to delete product.",
      emptyItems: "No products added under this template yet.",
    },

    personas: {
      title: "Brand Personas",
      subtitle: "Define a template for each persona category (customer, influencer, team member, ...), then add personas based on that template.",
      newTemplate: "+ New Template",
      templateNameLabel: "Template Name",
      templateDescLabel: "Template Description",
      fieldsLabel: "Template Fields",
      fieldKeyLabel: "Key (English)",
      fieldLabelLabel: "Display Label",
      fieldTypeLabel: "Field Type",
      fieldOptionsLabel: "Options",
      fieldOptionsPlaceholder: "option1, option2, option3",
      fieldRequiredLabel: "Required",
      fieldTypes: {
        text: "Short text",
        textarea: "Long text",
        number: "Number",
        image: "Image",
        select: "Select",
      },
      addField: "+ Add Field",
      saveTemplate: "Save Template",
      saveTemplateError: "Failed to save template.",
      loadTemplatesError: "Failed to load persona templates.",
      deleteTemplateConfirm: "Delete this template? All personas under it will be deleted too.",
      deleteTemplateError: "Failed to delete template.",
      emptyTemplates: "No persona templates yet",
      emptyTemplatesDesc: "Start by creating a persona template (e.g. \"Ideal Customer\" or \"Influencer\").",
      newItem: "+ New Persona",
      itemNameLabel: "Persona Name",
      saveItem: "Save Persona",
      saveItemError: "Failed to save persona.",
      loadItemsError: "Failed to load personas.",
      deleteItem: "Delete",
      deleteItemConfirm: "Are you sure you want to delete this persona?",
      deleteItemError: "Failed to delete persona.",
      emptyItems: "No personas added under this template yet.",
    },

    prompts: {
      title: "Prompts",
      newPrompt: "+ New prompt",
      mine: "My prompts ({count})",
      templates: "Template library ({count})",
      loadError: "Failed to load prompts.",
      emptyMineTitle: "You haven't created a prompt yet",
      emptyMineDesc: "Start from a template or write one from scratch.",
      emptyMineAction: "Create your first prompt",
      emptyTemplates: "No templates in the library yet",
      useTemplate: "Use this template →",

      status: {
        draft: "Draft",
        saved: "Saved",
        archived: "Archived",
      },
    },

    promptNew: {
      title: "New prompt",
      subtitle:
        "Start from a template, pick a related brand, and edit the final text.",
      templateLabel: "Template",
      noTemplate: "No template — start from scratch",
      brandLabel: "Related brand",
      noBrand: "No brand",
      titleLabel: "Title",
      contentLabel: "Prompt content",
      submit: "Save prompt",
      saveError: "Failed to save the prompt.",
    },
  },
} as const;

export type Language = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)["fa"];
