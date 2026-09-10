"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, FormAlert, PasswordField, TextField } from "@/components/ui";
import { IconLock, IconUser } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/AuthContext";
import { useMutation } from "@/hooks/useMutation";
import { errorMessage } from "@/lib/api-client";
import { ROLE_LABEL } from "@/lib/labels";
import { authService } from "@/services";

export function ProfileView() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [passwordSaved, setPasswordSaved] = useState(false);

  const profileAction = useCallback(
    async (input: { name: string; email: string; phone: string | null }) => {
      const updated = await authService.updateProfile(input);
      await refresh();
      return updated;
    },
    [refresh],
  );
  const profile = useMutation(profileAction);

  const passwordAction = useCallback((input: typeof passwords) => authService.updatePassword(input), []);
  const password = useMutation(passwordAction);

  if (!user) return null;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    if (await profile.run({ name: name.trim(), email: email.trim(), phone: phone.trim() || null })) setSaved(true);
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordSaved(false);
    const result = await password.run(passwords);
    if (result !== null) {
      setPasswordSaved(true);
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader icon={<IconUser className="h-4 w-4" />} title="Identite" />
        <CardBody>
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={user.name} />
            <div>
              <p className="font-bold">{user.name}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <Badge key={role} tone="brand">
                    {ROLE_LABEL[role]}
                  </Badge>
                ))}
                {user.company ? <Badge>{user.company.name}</Badge> : null}
              </div>
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <TextField label="Nom" placeholder="Votre nom" value={name} onChange={(event) => setName(event.target.value)} errors={profile.fieldErrors.name} required />
            <TextField label="E-mail" type="email" placeholder="vous@exemple.ci" value={email} onChange={(event) => setEmail(event.target.value)} errors={profile.fieldErrors.email} required />
            <TextField label="Telephone" type="tel" placeholder="+225 07 00 00 00 00" value={phone} onChange={(event) => setPhone(event.target.value)} errors={profile.fieldErrors.phone} />
            {saved ? <FormAlert tone="success">Profil mis a jour.</FormAlert> : null}
            {profile.error && !Object.keys(profile.fieldErrors).length ? <FormAlert>{errorMessage(profile.error)}</FormAlert> : null}
            <Button type="submit" isLoading={profile.isPending}>
              Enregistrer
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader icon={<IconLock className="h-4 w-4" />} title="Mot de passe" description="L'ancien mot de passe est demande : un poste de guichet reste souvent ouvert entre deux clients." />
          <CardBody>
            <form onSubmit={savePassword} className="space-y-4">
              <PasswordField
                label="Mot de passe actuel"
                placeholder="Mot de passe actuel"
                value={passwords.current_password}
                onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))}
                errors={password.fieldErrors.current_password}
                autoComplete="current-password"
                required
              />
              <PasswordField
                label="Nouveau mot de passe"
                placeholder="8 caracteres minimum"
                value={passwords.password}
                onChange={(event) => setPasswords((current) => ({ ...current, password: event.target.value }))}
                errors={password.fieldErrors.password}
                autoComplete="new-password"
                required
              />
              <PasswordField
                label="Confirmation"
                placeholder="Retapez le nouveau mot de passe"
                value={passwords.password_confirmation}
                onChange={(event) => setPasswords((current) => ({ ...current, password_confirmation: event.target.value }))}
                autoComplete="new-password"
                required
              />
              {passwordSaved ? <FormAlert tone="success">Mot de passe modifie.</FormAlert> : null}
              <Button type="submit" isLoading={password.isPending}>
                Modifier le mot de passe
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Affichage" description="Clair, sombre, ou suivre le reglage de l'appareil." />
          <CardBody>
            <ThemeToggle showLabels />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
