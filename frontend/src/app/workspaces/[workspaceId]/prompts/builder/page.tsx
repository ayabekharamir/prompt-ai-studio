"use client";

import { useState } from "react";

import PromptBuilderForm from "@/components/prompts/PromptBuilderForm";
import PromptPreview from "@/components/prompts/PromptPreview";

import type {
  BuildPromptResponse,
  Brand,
  Product,
  Persona,
  PromptTemplate,
} from "@/types/prompts";


interface PromptBuilderPageProps {
  params: {
    workspaceId: string;
  };
}


/*
  Temporary data loader placeholders.

  These should later connect to:
  GET /api/v1/brands/workspaces/{workspace_id}/brands
  GET /api/v1/products/brands/{brand_id}/products
  GET /api/v1/personas/brands/{brand_id}/personas
  GET /api/v1/prompt-templates/
*/

async function getBuilderData(
  workspaceId: string
): Promise<{
  brands: Brand[];
  products: Product[];
  personas: Persona[];
  promptTemplates: PromptTemplate[];
}> {

  return {
    brands: [],
    products: [],
    personas: [],
    promptTemplates: [],
  };
}


export default async function PromptBuilderPage({
  params,
}: PromptBuilderPageProps) {

  const {
    brands,
    products,
    personas,
    promptTemplates,
  } = await getBuilderData(
    params.workspaceId
  );


  return (
    <PromptBuilderClient
      brands={brands}
      products={products}
      personas={personas}
      promptTemplates={promptTemplates}
    />
  );
}



function PromptBuilderClient({
  brands,
  products,
  personas,
  promptTemplates,
}: {
  brands: Brand[];
  products: Product[];
  personas: Persona[];
  promptTemplates: PromptTemplate[];
}) {

  const [
    generatedPrompt,
    setGeneratedPrompt,
  ] = useState<BuildPromptResponse | null>(
    null
  );


  return (
    <div
      className="
        mx-auto
        grid
        max-w-7xl
        gap-6
        p-6
        lg:grid-cols-2
      "
    >

      <div>
        <PromptBuilderForm
          brands={brands}
          products={products}
          personas={personas}
          promptTemplates={promptTemplates}
          onSuccess={
            setGeneratedPrompt
          }
        />
      </div>


      <div>
        <PromptPreview
          result={generatedPrompt}
        />
      </div>


    </div>
  );
}
