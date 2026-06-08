import { Card, Field, Input, PageTitle } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div>
      <PageTitle title="Settings" />
      <Card>
        <div className="space-y-4">
          <Field label="OpenAI API status">
            <Input readOnly value={process.env.OPENAI_API_KEY ? "Configured" : "Missing - mock mode enabled"} />
          </Field>
          <Field label="Cloudflare R2 settings">
            <Input readOnly value="Placeholder for future R2 configuration" />
          </Field>
          <Field label="Mercari Shops API token">
            <Input readOnly value="Placeholder - integration not implemented yet" />
          </Field>
          <Field label="Default category ID">
            <Input readOnly value="Placeholder" />
          </Field>
          <Field label="Default shipping configuration ID">
            <Input readOnly value="Placeholder" />
          </Field>
        </div>
      </Card>
    </div>
  );
}
