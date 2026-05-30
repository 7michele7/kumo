// Demo-only state plumbing for the Create Worker wizard example.
// Separated from WizardDemo.tsx so the docs code block stays focused on Wizard API usage.

import { useCallback, useEffect, useRef, useState } from "react";

export type SelectedMethod = "hello-world" | "template" | "upload" | null;

export function useCreateWorkerDemo() {
  const [stepKey, setStepKey] = useState("method");
  const [open, setOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<SelectedMethod>("template");
  const [selectedTemplate, setSelectedTemplateRaw] = useState("Astro");
  const [workerName, setWorkerName] = useState("hello-world");
  const [nameError, setNameError] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const deployTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Selecting a template also sets a derived worker name (e.g. "Astro" → "my-astro-app").
  // Sanitize to a valid slug: lowercase, non-alphanumeric → hyphen, collapse/trim hyphens.
  const setSelectedTemplate = useCallback((name: string) => {
    setSelectedTemplateRaw(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setWorkerName(`my-${slug}-app`);
  }, []);

  const isTemplatePath = selectedMethod === "template";
  const isUploadPath = selectedMethod === "upload";

  // The deploy overlay shows the worker name for all paths
  const deployProjectName = workerName || "Hello World";

  const resetDemo = useCallback(() => {
    setStepKey("method");
    setOpen(false);
    setSelectedMethod("template");
    setSelectedTemplateRaw("Astro");
    setWorkerName("hello-world");
    setNameError("");
    setIsDeploying(false);

    if (deployTimerRef.current) {
      clearTimeout(deployTimerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (deployTimerRef.current) {
        clearTimeout(deployTimerRef.current);
      }
    };
  }, []);

  function handleOpen() {
    setStepKey("method");
    setOpen(true);
  }

  function handleClose() {
    resetDemo();
  }

  // Starts the deploy finale: loading overlay -> 3s auto-close -> reset
  function startDeployFinale() {
    setIsDeploying(true);
    deployTimerRef.current = setTimeout(resetDemo, 3000);
  }

  // Hello World deploy (non-template finale) — validates worker name first
  function handleDeploy() {
    if (!workerName.trim()) {
      setNameError("Worker name is required.");

      return;
    }

    setNameError("");
    startDeployFinale();
  }

  // Template deploy (setup step finale) — no validation, just triggers finale
  function handleTemplateDeploy() {
    startDeployFinale();
  }

  // Wizard onStepChange handler — only uses the key, ignores the index
  const handleStepChange = (_index: number, key: string) => setStepKey(key);

  return {
    stepKey,
    setStepKey,
    handleStepChange,
    open,
    handleOpen,
    handleClose,
    selectedMethod,
    setSelectedMethod,
    isTemplatePath,
    isUploadPath,
    deployProjectName,
    selectedTemplate,
    setSelectedTemplate,
    workerName,
    setWorkerName,
    nameError,
    setNameError,
    isDeploying,
    handleDeploy,
    handleTemplateDeploy,
    resetDemo,
  };
}
