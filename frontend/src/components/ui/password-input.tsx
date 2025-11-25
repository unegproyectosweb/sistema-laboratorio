import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PasswordInputProps
  extends React.ComponentPropsWithoutRef<typeof InputGroupInput> {}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type={visible ? "text" : "password"}
        className={className}
      />
      <InputGroupAddon align="inline-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <InputGroupButton
              type="button"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setVisible((prev) => !prev)}
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>
            {visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          </TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  );
}
