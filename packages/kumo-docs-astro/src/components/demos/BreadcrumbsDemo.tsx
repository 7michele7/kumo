import { Breadcrumbs } from "@cloudflare/kumo";
import { House } from "@phosphor-icons/react";

export function BreadcrumbsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsWithIconsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<House size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Projects</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Current Project</Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsLoadingDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<House size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current loading></Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsRootDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Current icon={<House size={16} />}>
        Worker Analytics
      </Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsWithClipboardDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="#" />
    </Breadcrumbs>
  );
}

export function BreadcrumbsLocalizedDemo() {
  return (
    <Breadcrumbs
      labels={{
        navigation: "Ruta de navegación",
        copyAction: "Copiar",
        copyTooltip: "Haz clic para copiar",
        copiedFeedback: "Copiado",
      }}
    >
      <Breadcrumbs.Link href="#">Inicio</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Documentación</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Migas de pan</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="#migas-de-pan" />
    </Breadcrumbs>
  );
}
