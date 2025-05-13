import { MaskedInputExample } from "@/components/masked-input-example"

export function InputExamplesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Примеры масок для инпутов</h1>
      <div className="grid gap-8">
        <MaskedInputExample />
      </div>
    </div>
  )
} 