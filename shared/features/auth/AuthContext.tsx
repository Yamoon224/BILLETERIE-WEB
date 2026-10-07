"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, clearToken, hasStoredToken, onUnauthenticated } from "@kaara/shared/lib/api-client";
import { authService } from "@kaara/shared/services";
import type { RegisterInput } from "@kaara/shared/services/auth-service";
import type { AuthenticatedUser, RoleName } from "@kaara/shared/types/api";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  /** Vrai tant que la session initiale n'a pas ete verifiee aupres de l'API. */
  isInitialising: boolean;
  /** La session s'est refermee d'elle-meme (jeton expire), et non a la demande. */
  hasExpired: boolean;
  /**
   * `identifier` est une adresse e-mail, un numero de telephone, ou le code
   * d'une compagnie. `code` est le code de verification (2FA), ignore par
   * l'API pour les comptes qui ne l'ont pas active.
   */
  login: (identifier: string, password: string, code?: string) => Promise<AuthenticatedUser>;
  /** Connexion rapide au guichet, par code PIN (comptes agents uniquement). */
  loginWithPin: (identifier: string, pin: string) => Promise<AuthenticatedUser>;
  register: (input: RegisterInput) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /**
   * Le frontend ne decide de rien : il masque ce qui serait refuse, pour
   * eviter des 403 previsibles. L'autorisation reelle reste appliquee par
   * l'API sur chaque route.
   */
  can: (permission: string) => boolean;
  hasRole: (role: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isInitialising, setIsInitialising] = useState(true);
  const [hasExpired, setHasExpired] = useState(false);

  // Un jeton peut expirer pendant que l'ecran est ouvert : le client d'API le
  // signale ici, et la session se referme une fois.
  useEffect(
    () =>
      onUnauthenticated(() => {
        setUser(null);
        setHasExpired(true);
      }),
    [],
  );

  // Un jeton peut survivre a la fermeture du navigateur : on le confronte a
  // l'API au demarrage plutot que de faire confiance au stockage local.
  // Sans jeton memorise, la reponse - 401 - est connue d'avance : l'appel est
  // epargne a chaque visiteur anonyme, soit a l'essentiel du site voyageur.
  useEffect(() => {
    let active = true;

    if (!hasStoredToken()) {
      // Differe d'une microtache : aucun changement d'etat pendant l'effet lui-meme.
      queueMicrotask(() => {
        if (active) setIsInitialising(false);
      });

      return () => {
        active = false;
      };
    }

    authService
      .me()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.isUnauthenticated) clearToken();
      })
      .finally(() => {
        if (active) setIsInitialising(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string, code?: string) => {
    const authenticated = await authService.login(identifier, password, code);
    setHasExpired(false);
    setUser(authenticated);

    return authenticated;
  }, []);

  const loginWithPin = useCallback(async (identifier: string, pin: string) => {
    const authenticated = await authService.loginWithPin(identifier, pin);
    setHasExpired(false);
    setUser(authenticated);

    return authenticated;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const created = await authService.register(input);
    setHasExpired(false);
    setUser(created);

    return created;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    setUser(await authService.me());
  }, []);

  const can = useCallback((permission: string) => user?.permissions.includes(permission) ?? false, [user]);
  const hasRole = useCallback((role: RoleName) => user?.roles.includes(role) ?? false, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isInitialising, hasExpired, login, loginWithPin, register, logout, refresh, can, hasRole }),
    [user, isInitialising, hasExpired, login, loginWithPin, register, logout, refresh, can, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth doit etre utilise a l'interieur d'un AuthProvider.");
  }

  return context;
}
