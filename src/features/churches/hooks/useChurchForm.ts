"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type ChurchFormData,
  ChurchFormSchema,
  churchFormDefaultValues,
} from "@/application/dtos/church/ChurchDTO";

interface UseChurchFormProps {
  mode: "create" | "edit";
  churchId?: string;
  initialData?: Partial<ChurchFormData>;
}

interface UseChurchFormReturn {
  form: ReturnType<typeof useForm<ChurchFormData>>;
  isLoading: boolean;
  onSubmit: (data: ChurchFormData) => Promise<void>;
}

export function useChurchForm({
  mode,
  churchId,
  initialData,
}: UseChurchFormProps): UseChurchFormReturn {
  const router = useRouter();
  const isLoading = false;

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(ChurchFormSchema),
    defaultValues: {
      ...churchFormDefaultValues,
      ...initialData,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ChurchFormData) => {
    try {
      if (mode === "create") {
        toast.success("Igreja criada com sucesso!");
        console.log("Create church:", data);
        router.push("/churches");
      } else {
        toast.success("Igreja atualizada com sucesso!");
        console.log("Update church:", churchId, data);
        router.push("/churches");
      }
    } catch {
      toast.error("Ocorreu um erro. Tente novamente.");
    }
  };

  return { form, isLoading, onSubmit };
}
