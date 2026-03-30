"use client";

import { useState } from "react";

import type { StoreSettings } from "@/types";

import { SettingsForm } from "@/components/admin/settings-form";

interface SettingsViewProps {
  initialSettings: StoreSettings;
}

export function SettingsView({ initialSettings }: SettingsViewProps) {
  const [settings, setSettings] = useState(initialSettings);

  return <SettingsForm settings={settings} onSaved={setSettings} />;
}
