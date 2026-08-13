"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Alert, Card, EmptyState, Spinner } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/language-context";
import { setNavigationContext } from "@/lib/navigation";
import {
  createPersona,
  createPersonaTemplate,
  deletePersona,
  deletePersonaTemplate,
  listPersonas,
  listPersonaTemplates,
} from "@/services/persona.service";
import type { Persona, PersonaTemplate, TemplateFieldDefinition, TemplateFieldType } from "@/types";

const FIELD_TYPES: TemplateFieldType[] = ["text", "textarea", "number", "image", "select"];

function emptyField(): TemplateFieldDefinition {
  return { key: "", label: "", type: "text", required: false };
}

export default function PersonasPage() {
  const { workspaceId, brandId } = useParams<{ workspaceId: string; brandId: string }>();
  const { t } = useLanguage();

  const [templates, setTemplates] = useState<PersonaTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateFields, setTemplateFields] = useState<TemplateFieldDefinition[]>([emptyField()]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [personaName, setPersonaName] = useState("");
  const [personaValues, setPersonaValues] = useState<Record<string, string>>({});
  const [savingPersona, setSavingPersona] = useState(false);

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId) ?? null;

  useEffect(() => {
    if (!workspaceId || !brandId) return;
    setNavigationContext(workspaceId, brandId);
    setLoadingTemplates(true);
    listPersonaTemplates(brandId)
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) setSelectedTemplateId(data[0].id);
      })
      .catch(() => setError(t("personas.loadTemplatesError")))
      .finally(() => setLoadingTemplates(false));
  }, [workspaceId, brandId, t]);

  useEffect(() => {
    if (!brandId || !selectedTemplateId) {
      setPersonas([]);
      return;
    }
    setLoadingPersonas(true);
    listPersonas(brandId, selectedTemplateId)
      .then(setPersonas)
      .catch(() => setError(t("personas.loadItemsError")))
      .finally(() => setLoadingPersonas(false));
  }, [brandId, selectedTemplateId, t]);

  function updateFieldRow(index: number, patch: Partial<TemplateFieldDefinition>) {
    setTemplateFields((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeFieldRow(index: number) {
    setTemplateFields((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleCreateTemplate() {
    if (!brandId || !templateName.trim()) return;
    setSavingTemplate(true);
    setError(null);
    try {
      const fields = templateFields
        .filter((f) => f.key.trim() && f.label.trim())
        .map((f) => ({
          ...f,
          options:
            f.type === "select" && typeof f.options === "string"
              ? (f.options as unknown as string).split(",").map((o) => o.trim()).filter(Boolean)
              : f.options,
        }));
      const created = await createPersonaTemplate(brandId, {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        fields,
      });
      setTemplates((prev) => [created, ...prev]);
      setSelectedTemplateId(created.id);
      setShowTemplateForm(false);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateFields([emptyField()]);
    } catch {
      setError(t("personas.saveTemplateError"));
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    if (!confirm(t("personas.deleteTemplateConfirm"))) return;
    try {
      await deletePersonaTemplate(templateId);
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== templateId));
      if (selectedTemplateId === templateId) setSelectedTemplateId(null);
    } catch {
      setError(t("personas.deleteTemplateError"));
    }
  }

  async function handleCreatePersona() {
    if (!brandId || !selectedTemplate || !personaName.trim()) return;
    setSavingPersona(true);
    setError(null);
    try {
      const created = await createPersona(brandId, {
        template_id: selectedTemplate.id,
        name: personaName.trim(),
        field_values: personaValues,
      });
      setPersonas((prev) => [created, ...prev]);
      setShowPersonaForm(false);
      setPersonaName("");
      setPersonaValues({});
    } catch {
      setError(t("personas.saveItemError"));
    } finally {
      setSavingPersona(false);
    }
  }

  async function handleDeletePersona(personaId: string) {
    if (!confirm(t("personas.deleteItemConfirm"))) return;
    try {
      await deletePersona(personaId);
      setPersonas((prev) => prev.filter((p) => p.id !== personaId));
    } catch {
      setError(t("personas.deleteItemError"));
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-fg">{t("personas.title")}</h1>
            <p className="mt-1 text-sm text-fg-muted">{t("personas.subtitle")}</p>
          </div>
          <Button onClick={() => setShowTemplateForm((v) => !v)}>
            {t("personas.newTemplate")}
          </Button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}

        {showTemplateForm && (
          <Card className="mb-6">
            <h2 className="mb-4 text-sm font-semibold text-fg">{t("personas.newTemplate")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("personas.templateNameLabel")} htmlFor="tpl-name">
                <Input id="tpl-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
              </Field>
              <Field label={t("personas.templateDescLabel")} htmlFor="tpl-desc">
                <Input id="tpl-desc" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} />
              </Field>
            </div>

            <p className="mb-2 mt-4 text-sm font-medium text-fg-muted">{t("personas.fieldsLabel")}</p>
            <div className="space-y-3">
              {templateFields.map((field, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-12 sm:items-end">
                  <div className="sm:col-span-3">
                    <Field label={t("personas.fieldKeyLabel")} htmlFor={`key-${i}`}>
                      <Input id={`key-${i}`} value={field.key} onChange={(e) => updateFieldRow(i, { key: e.target.value })} />
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label={t("personas.fieldLabelLabel")} htmlFor={`label-${i}`}>
                      <Input id={`label-${i}`} value={field.label} onChange={(e) => updateFieldRow(i, { label: e.target.value })} />
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label={t("personas.fieldTypeLabel")} htmlFor={`type-${i}`}>
                      <Select
                        id={`type-${i}`}
                        value={field.type}
                        onChange={(e) => updateFieldRow(i, { type: e.target.value as TemplateFieldType })}
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft} value={ft}>
                            {t(`personas.fieldTypes.${ft}`)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  {field.type === "select" && (
                    <div className="sm:col-span-2">
                      <Field label={t("personas.fieldOptionsLabel")} htmlFor={`options-${i}`}>
                        <Input
                          id={`options-${i}`}
                          placeholder={t("personas.fieldOptionsPlaceholder")}
                          value={(field.options as unknown as string) || ""}
                          onChange={(e) => updateFieldRow(i, { options: e.target.value as unknown as string[] })}
                        />
                      </Field>
                    </div>
                  )}
                  <div className="flex items-center gap-2 sm:col-span-1">
                    <label className="flex items-center gap-1.5 text-xs text-fg-muted">
                      <input
                        type="checkbox"
                        checked={!!field.required}
                        onChange={(e) => updateFieldRow(i, { required: e.target.checked })}
                      />
                      {t("personas.fieldRequiredLabel")}
                    </label>
                    <Button variant="ghost" onClick={() => removeFieldRow(i)}>
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => setTemplateFields((rows) => [...rows, emptyField()])}>
                {t("personas.addField")}
              </Button>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreateTemplate} isLoading={savingTemplate} disabled={!templateName.trim()}>
                {t("personas.saveTemplate")}
              </Button>
              <Button variant="secondary" onClick={() => setShowTemplateForm(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          </Card>
        )}

        {loadingTemplates ? (
          <Spinner />
        ) : templates.length === 0 ? (
          <EmptyState title={t("personas.emptyTemplates")} description={t("personas.emptyTemplatesDesc")} />
        ) : (
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="space-y-1">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    tpl.id === selectedTemplateId ? "bg-brand text-white" : "text-fg hover:bg-surface-hover"
                  }`}
                >
                  <button className="flex-1 text-start" onClick={() => setSelectedTemplateId(tpl.id)}>
                    {tpl.name}
                  </button>
                  <button
                    className="ms-2 text-xs opacity-70 hover:opacity-100"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div>
              {selectedTemplate && (
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-fg">{selectedTemplate.name}</h2>
                    {selectedTemplate.description && (
                      <p className="text-sm text-fg-muted">{selectedTemplate.description}</p>
                    )}
                  </div>
                  <Button onClick={() => setShowPersonaForm((v) => !v)}>{t("personas.newItem")}</Button>
                </div>
              )}

              {showPersonaForm && selectedTemplate && (
                <Card className="mb-6">
                  <Field label={t("personas.itemNameLabel")} htmlFor="item-name">
                    <Input id="item-name" value={personaName} onChange={(e) => setPersonaName(e.target.value)} />
                  </Field>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {selectedTemplate.fields.map((field) => (
                      <Field key={field.key} label={field.label} htmlFor={`val-${field.key}`}>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={`val-${field.key}`}
                            value={personaValues[field.key] || ""}
                            onChange={(e) => setPersonaValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          />
                        ) : field.type === "select" ? (
                          <Select
                            id={`val-${field.key}`}
                            value={personaValues[field.key] || ""}
                            onChange={(e) => setPersonaValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          >
                            <option value="">—</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            id={`val-${field.key}`}
                            type={field.type === "number" ? "number" : "text"}
                            value={personaValues[field.key] || ""}
                            onChange={(e) => setPersonaValues((v) => ({ ...v, [field.key]: e.target.value }))}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={handleCreatePersona} isLoading={savingPersona} disabled={!personaName.trim()}>
                      {t("personas.saveItem")}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowPersonaForm(false)}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                </Card>
              )}

              {loadingPersonas ? (
                <Spinner />
              ) : personas.length === 0 ? (
                <EmptyState title={t("personas.emptyItems")} />
              ) : (
                <div className="space-y-2">
                  {personas.map((p) => (
                    <Card key={p.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-fg">{p.name}</p>
                        <p className="text-xs text-fg-muted">
                          {Object.entries(p.field_values)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      </div>
                      <Button variant="danger" onClick={() => handleDeletePersona(p.id)}>
                        {t("personas.deleteItem")}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
