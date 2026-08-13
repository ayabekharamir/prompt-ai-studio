"use client";

import type {
  BuildPromptResponse,
} from "@/types/prompts";


interface PromptPreviewProps {
  result: BuildPromptResponse | null;
}


export default function PromptPreview({
  result,
}: PromptPreviewProps) {

  if (!result) {
    return (
      <div
        className="
          rounded-xl
          border
          border-dashed
          bg-gray-50
          p-6
          text-center
          text-sm
          text-gray-500
        "
      >
        هنوز پرامپتی ساخته نشده است.
      </div>
    );
  }


  async function copyToClipboard() {
    await navigator.clipboard.writeText(
      result.content
    );
  }


  return (
    <div
      className="
        space-y-4
        rounded-xl
        border
        bg-white
        p-6
        shadow-sm
      "
    >

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-semibold">
          {result.title}
        </h2>


        <button
          type="button"
          onClick={copyToClipboard}
          className="
            rounded-lg
            bg-gray-900
            px-4
            py-2
            text-sm
            text-white
          "
        >
          Copy
        </button>

      </div>


      <div
        className="
          whitespace-pre-wrap
          rounded-lg
          bg-gray-50
          p-4
          text-sm
          leading-7
          text-gray-800
        "
      >
        {result.content}
      </div>


      <div
        className="
          grid
          gap-2
          text-xs
          text-gray-500
        "
      >

        <div>
          Brand ID:
          {" "}
          {result.brand_id}
        </div>


        {result.product_id && (
          <div>
            Product ID:
            {" "}
            {result.product_id}
          </div>
        )}


        {result.persona_id && (
          <div>
            Persona ID:
            {" "}
            {result.persona_id}
          </div>
        )}


        {result.prompt_template_id && (
          <div>
            Template ID:
            {" "}
            {result.prompt_template_id}
          </div>
        )}

      </div>

    </div>
  );
}
