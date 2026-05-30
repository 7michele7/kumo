// Demo-only state plumbing for the Create Worker wizard example.
// Separated from WizardDemo.tsx so the docs code block stays focused on Wizard API usage.

import { useCallback, useEffect, useRef, useState } from "react";

export type SelectedMethod = "hello-world" | "template" | "upload" | null;

export type NameStatus = "idle" | "checking" | "available" | "error";

function validateWorkerName(name: string): string | null {
  if (!name.trim()) return "Enter a worker name.";
  return null;
}

export function useCreateWorkerDemo() {
  const [stepKey, setStepKey] = useState("method");
  const [open, setOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<SelectedMethod>("template");
  const [selectedTemplate, setSelectedTemplateRaw] = useState("Astro");
  const [workerName, setWorkerNameRaw] = useState("hello-world");
  const [nameStatus, setNameStatus] = useState<NameStatus>("available");
  const [nameError, setNameError] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const deployTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const availabilityTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Selecting a template also sets a derived worker name (e.g. "Astro" → "my-astro-app").
  // Sanitize to a valid slug: lowercase, non-alphanumeric → hyphen, collapse/trim hyphens.
  const setSelectedTemplate = useCallback((name: string) => {
    setSelectedTemplateRaw(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const derived = `my-${slug}-app`;
    setWorkerNameRaw(derived);
    // Derived names are always valid — skip straight to available
    setNameStatus("available");
    setNameError("");
  }, []);

  // Debounced worker-name change: validate → check availability (simulated)
  const setWorkerName = useCallback((next: string) => {
    setWorkerNameRaw(next);
    if (availabilityTimerRef.current)
      clearTimeout(availabilityTimerRef.current);

    const error = validateWorkerName(next);
    if (error) {
      setNameStatus("error");
      setNameError(error);
      return;
    }

    setNameError("");
    setNameStatus("checking");
    availabilityTimerRef.current = setTimeout(() => {
      setNameStatus("available");
    }, 500);
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
    setWorkerNameRaw("hello-world");
    setNameStatus("available");
    setNameError("");
    setIsDeploying(false);

    if (deployTimerRef.current) clearTimeout(deployTimerRef.current);
    if (availabilityTimerRef.current)
      clearTimeout(availabilityTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (deployTimerRef.current) clearTimeout(deployTimerRef.current);
      if (availabilityTimerRef.current)
        clearTimeout(availabilityTimerRef.current);
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

  // Hello World deploy — validates worker name first
  function handleDeploy() {
    const error = validateWorkerName(workerName);
    if (error) {
      setNameStatus("error");
      setNameError(error);
      return;
    }
    startDeployFinale();
  }

  // Template deploy — also validates worker name
  function handleTemplateDeploy() {
    const error = validateWorkerName(workerName);
    if (error) {
      setNameStatus("error");
      setNameError(error);
      return;
    }
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
    nameStatus,
    nameError,
    isDeploying,
    handleDeploy,
    handleTemplateDeploy,
    resetDemo,
  };
}
