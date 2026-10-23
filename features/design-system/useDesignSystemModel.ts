"use client";

import { useMemo, useState } from "react";
import {
  catalogSections,
  createComponentFixtures,
  type FixtureScenario,
} from "./catalog";

export function useDesignSystemModel() {
  const [search, setSearch] = useState("");
  const [size, setSize] = useState<"small" | "middle" | "large">("middle");
  const [disabled, setDisabled] = useState(false);
  const [scenario, setScenario] = useState<FixtureScenario>("normal");
  const fixtures = useMemo(() => createComponentFixtures(scenario), [scenario]);
  const visibleSections = catalogSections.filter((section) =>
    `${section.title} ${section.keywords}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  return {
    search,
    setSearch,
    size,
    setSize,
    disabled,
    setDisabled,
    scenario,
    setScenario,
    fixtures,
    visibleSections,
  };
}
