import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClasses } from "./Button";
import type { ButtonSize, ButtonVariant } from "./Button";

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

/** Lien de navigation habille en bouton. Reste un vrai lien. */
export function LinkButton({ variant = "primary", size = "md", icon, className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}
