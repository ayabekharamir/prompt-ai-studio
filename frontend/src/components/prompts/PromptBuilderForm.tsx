"use client";

import { useState } from "react";

import PromptSelect from "./PromptSelect";

import { usePromptBuilder } from "@/hooks/usePromptBuilder";

import type {
  BuildPromptRequest,
  BuildPromptResponse,
  Brand,
  Product,
  Persona,
  PromptTemplate,
} from "@/types/prompts";


interface PromptBuilderFormProps {
  brands: Brand[];

  products: Product[];

  personas: Persona[];

  promptTemplates: PromptTemplate[];

  onSuccess: (result: BuildPromptResponse) => void;
}


export default function PromptBuilderForm({
  brands,
  products,
  personas,
  promptTemplates,
  onSuccess,
}: PromptBuilderFormProps) {

  const {
    mutate,
    isPending,
    error,
  } = usePromptBuilder();


  const [form, setForm] = useState<BuildPromptRequest>({
    brand_id: "",
    product_id: null,
    persona_id: null,
    prompt_template_id: null,
    title: "",
    task: "",
    extra_context: null,
  });


  function updateField(
    key: keyof BuildPromptRequest,
    value: string | null
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }


  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    mutate(
      {
        ...form,
        product_id:
          form.product_id || null,

        persona_id:
          form.persona_id || null,

        prompt_template_id:
          form.prompt_template_id || null,
      },
      {
        onSuccess,
      }
    );
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-6
        rounded-xl
        border
        bg-white
        p-6
        shadow-sm
      "
    >

      <h2 className="text-xl font-semibold">
        Prompt Builder
      </h2>


      <PromptSelect
        label="برند"
        value={form.brand_id}
        onChange={(value) =>
          updateField(
            "brand_id",
            value
          )
        }
        options={brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
        }))}
        placeholder="انتخاب برند"
      />


      <PromptSelect
        label="محصول"
        value={form.product_id}
        onChange={(value) =>
          updateField(
            "product_id",
            value || null
          )
        }
        options={products.map((product) => ({
          id: product.id,
          name: product.name,
        }))}
        placeholder="بدون محصول"
      />


      <PromptSelect
        label="پرسونا"
        value={form.persona_id}
        onChange={(value) =>
          updateField(
            "persona_id",
            value || null
          )
        }
        options={personas.map((persona) => ({
          id: persona.id,
          name: persona.name,
        }))}
        placeholder="بدون پرسونا"
      />


      <PromptSelect
        label="قالب پرامپت"
        value={form.prompt_template_id}
        onChange={(value) =>
          updateField(
            "prompt_template_id",
            value || null
          )
        }
        options={promptTemplates.map(
          (template) => ({
            id: template.id,
            name: template.name,
          })
        )}
        placeholder="بدون قالب"
      />


      <div className="space-y-2">

        <label className="block text-sm font-medium">
          عنوان
        </label>

        <input
          value={form.title ?? ""}
          onChange={(e) =>
            updateField(
              "title",
              e.target.value
            )
          }
          className="
            w-full
            rounded-lg
            border
            px-3
            py-2
          "
          placeholder="مثلاً: کپشن اینستاگرام ایران کمپ"
        />

      </div>


      <div className="space-y-2">

        <label className="block text-sm font-medium">
          وظیفه (Task)
        </label>

        <textarea
          value={form.task}
          onChange={(e) =>
            updateField(
              "task",
              e.target.value
            )
          }
          rows={5}
          className="
            w-full
            rounded-lg
            border
            px-3
            py-2
          "
          placeholder="
مثال:
یک متن معرفی کوتاه برای این برند بنویس
          "
          required
        />

      </div>


      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </div>
      )}


      <button
        type="submit"
        disabled={
          isPending ||
          !form.brand_id ||
          !form.task
        }
        className="
          rounded-lg
          bg-black
          px-5
          py-2
          text-white
          disabled:opacity-50
        "
      >
        {isPending
          ? "در حال ساخت..."
          : "Build Prompt"}
      </button>


    </form>
  );
}
