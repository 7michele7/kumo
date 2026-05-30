export {
  WizardRoot,
  useWizard,
  KUMO_WIZARD_VARIANTS,
  KUMO_WIZARD_DEFAULT_VARIANTS,
  type WizardVariant,
  type UseWizardReturn,
  type WizardProps,
  type WizardStepItem,
  type WizardLabels,
} from "./wizard";
export { WizardStep, type WizardStepProps } from "./wizard-step";
export { WizardSteps, type WizardStepsProps } from "./wizard-steps";
export { WizardPage, type WizardPageProps } from "./wizard-page";
export {
  WizardFullscreen,
  WizardFullscreenContext,
  useWizardFullscreen,
  type WizardFullscreenProps,
  type WizardFullscreenContextValue,
  type WizardFullscreenLabels,
} from "./wizard-fullscreen";
export {
  WizardGrid,
  type WizardGridProps,
  type WizardGridWidth,
} from "./wizard-grid";
export { useWizardGrid, type UseWizardGridReturn } from "./use-wizard-grid";

// Compound Component Assembly

import { WizardRoot as _WizardRoot } from "./wizard";
import { WizardStep } from "./wizard-step";
import { WizardSteps } from "./wizard-steps";
import { WizardPage } from "./wizard-page";
import { WizardFullscreen } from "./wizard-fullscreen";
import { WizardGrid } from "./wizard-grid";
export const Wizard = Object.assign(_WizardRoot, {
  Step: WizardStep,
  Steps: WizardSteps,
  Page: WizardPage,
  Fullscreen: WizardFullscreen,
  Grid: WizardGrid,
});
