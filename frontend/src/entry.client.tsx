import { es } from "date-fns/locale";
import { setDefaultOptions } from "date-fns/setDefaultOptions";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

setDefaultOptions({ locale: es });

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
