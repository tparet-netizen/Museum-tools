import { NewObjectForm } from "@/components/NewObjectForm";

export default function NewObjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">New object</h1>
      <NewObjectForm />
    </div>
  );
}
