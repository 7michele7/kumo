import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Button,
  Text,
  Input,
  InputGroup,
  Checkbox,
  Loader,
  useWizard,
} from "@cloudflare/kumo";
import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react";
import type { SelectedMethod } from "./use-create-worker-demo";
import {
  CREATION_METHODS,
  CreationMethodCard,
  DEMO_TEMPLATES,
  HELLO_WORLD_CODE,
  TemplateCard,
} from "./wizard-demo-helpers";

function resolveMethod(title: string): {
  method: SelectedMethod;
  nextStep: string;
} {
  if (title === "Select a template")
    return { method: "template", nextStep: "template" };
  if (title === "Upload your static files")
    return { method: "upload", nextStep: "upload" };
  return { method: "hello-world", nextStep: "deploy" };
}

export function SelectMethodBody({
  onSelectMethod,
}: {
  onSelectMethod: (method: SelectedMethod) => void;
}) {
  const { goToStep } = useWizard();

  const gitMethods = CREATION_METHODS.slice(0, 2);
  const otherMethods = CREATION_METHODS.slice(2);

  function handleClick(title: string) {
    const { method: selectedMethod, nextStep } = resolveMethod(title);

    onSelectMethod(selectedMethod);

    // Navigate by key — the conditional steps will mount/unmount based on selectedMethod, then goToStep resolves against the new set.
    requestAnimationFrame(() => {
      goToStep(nextStep);
    });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        {gitMethods.map((method) => (
          <CreationMethodCard
            key={method.title}
            title={method.title}
            icon={method.icon}
            iconClassName={method.iconClassName}
            dashed={method.dashed}
            onClick={() => handleClick(method.title)}
          />
        ))}
      </div>
      {otherMethods.map((method) => (
        <CreationMethodCard
          key={method.title}
          title={method.title}
          icon={method.icon}
          iconClassName={method.iconClassName}
          dashed={method.dashed}
          onClick={() => handleClick(method.title)}
        />
      ))}
    </div>
  );
}

export function SelectTemplateBody({
  onSelectTemplate,
}: {
  onSelectTemplate: (name: string) => void;
}) {
  const { goToStep } = useWizard();

  const handleSelectTemplate = (name: string) => {
    onSelectTemplate(name);
    goToStep("setup");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {DEMO_TEMPLATES.map((template) => (
        <TemplateCard
          key={template.alias}
          template={template}
          onClick={() => handleSelectTemplate(template.name)}
        />
      ))}
    </div>
  );
}

export function SelectTemplateFooter() {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back}>
        Back
      </Button>
      <Button variant="ghost" onClick={() => {}}>
        Browse all templates <ArrowUpRightIcon weight="bold" size={12} />
      </Button>
    </>
  );
}

export function SetupBody({
  workerName,
  onWorkerNameChange,
}: {
  workerName: string;
  onWorkerNameChange: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <InputGroup label="Worker name">
        <InputGroup.Input
          placeholder="my-worker"
          value={workerName}
          onChange={(e) => onWorkerNameChange(e.target.value)}
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
      </InputGroup>
      <Input
        defaultValue="npm run build"
        label="Build command"
        placeholder="npm run build"
      />
      <Input
        defaultValue="npx wrangler deploy"
        label="Deploy command"
        placeholder="npx wrangler deploy"
      />
      <Input
        defaultValue="npx wrangler versions upload"
        placeholder="npx wrangler versions upload"
        label="Preview command"
      />
      <Checkbox label="Enable preview builds" />
    </div>
  );
}

export function SetupFooter({
  isDeploying,
  onDeploy,
}: {
  isDeploying: boolean;
  onDeploy: () => void;
}) {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back} disabled={isDeploying}>
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onDeploy}
        loading={isDeploying}
        disabled={isDeploying}
      >
        Deploy
      </Button>
    </>
  );
}

interface DeployStepBodyProps {
  workerName: string;
  onWorkerNameChange: (name: string) => void;
  nameError: string;
  onNameErrorChange: (error: string) => void;
}

export function DeployStepBody({
  workerName,
  onWorkerNameChange,
  nameError,
  onNameErrorChange,
}: DeployStepBodyProps) {
  const [nameStatus, setNameStatus] = useState<"idle" | "loading" | "success">(
    "success",
  );
  const nameTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    };
  }, []);

  const handleWorkerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onWorkerNameChange(next);
    if (nameError) onNameErrorChange("");
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    if (next.length > 0) {
      setNameStatus("loading");
      nameTimerRef.current = setTimeout(() => setNameStatus("success"), 1000);
    } else {
      setNameStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <InputGroup label="Worker name">
        <InputGroup.Input
          placeholder="my-worker"
          value={workerName}
          onChange={handleWorkerNameChange}
        />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        {nameStatus !== "idle" && (
          <InputGroup.Addon align="end">
            {nameStatus === "loading" ? (
              <Loader />
            ) : (
              <CheckCircleIcon weight="duotone" className="text-kumo-success" />
            )}
          </InputGroup.Addon>
        )}
      </InputGroup>
      <div className="min-w-0">
        <Text size="sm" bold as="p" DANGEROUS_className="mb-1.5">
          Worker preview
        </Text>
        <div className="overflow-hidden rounded-xl border border-kumo-line bg-kumo-recessed">
          <ShikiProvider engine="javascript" languages={["typescript"]}>
            <CodeHighlighted
              code={HELLO_WORLD_CODE}
              lang="typescript"
              className="border-0! bg-transparent! [&_pre]:whitespace-pre text-xs"
            />
          </ShikiProvider>
        </div>
      </div>
    </div>
  );
}

export function DeployStepFooter({
  nameError,
  isDeploying,
  onDeploy,
}: {
  nameError: string;
  isDeploying: boolean;
  onDeploy: () => void;
}) {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back} disabled={isDeploying}>
        Back
      </Button>
      {nameError && (
        <Text size="sm" variant="error">
          {nameError}
        </Text>
      )}
      <Button
        variant="primary"
        onClick={onDeploy}
        loading={isDeploying}
        disabled={isDeploying}
      >
        Deploy
      </Button>
    </>
  );
}

export function UploadStepBody() {
  return (
    <div className="group relative flex min-h-[184px] cursor-default flex-col items-center justify-center rounded-lg bg-kumo-base shadow-xs ring-1 ring-kumo-line transition-colors hover:bg-kumo-elevated after:pointer-events-none after:absolute after:inset-1 after:rounded-md after:border after:border-dashed after:border-kumo-hairline hover:after:border-kumo-line">
      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-md ring-1 ring-kumo-line shadow-xs">
        <FolderOpenIcon
          size={16}
          weight="duotone"
          className="text-kumo-subtle"
        />
      </div>
      <Text DANGEROUS_className="mt-3.5">
        Drag in or click to upload a file or folder.
      </Text>
      <Text size="sm" variant="secondary" DANGEROUS_className="mt-1">
        Contents you drag here will be uploaded to your account
      </Text>
    </div>
  );
}

export function UploadStepFooter({
  isDeploying,
  onDeploy,
}: {
  isDeploying: boolean;
  onDeploy: () => void;
}) {
  const { back } = useWizard();

  return (
    <>
      <Button variant="ghost" onClick={back} disabled={isDeploying}>
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onDeploy}
        loading={isDeploying}
        disabled={isDeploying}
      >
        Deploy
      </Button>
    </>
  );
}

export function DeployingOverlay({ projectName }: { projectName: string }) {
  return (
    <>
      <div className="absolute inset-0 z-10 rounded-xl bg-kumo-base/90 backdrop-blur-[1px]" />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center text-balance max-w-xs">
          <Loader size={32} />
          <Text bold>
            Setting up your "{projectName}" project. This may take a few
            seconds...
          </Text>
        </div>
      </div>
    </>
  );
}
