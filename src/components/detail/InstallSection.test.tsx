import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InstallSection, NO_INSTALL_COMMAND, type MarketplaceInstall } from "./InstallSection";

const SHA = "0123456789abcdef0123456789abcdef01234567";
const install: MarketplaceInstall = {
  commands: ["/plugin marketplace add https://example.org/marketplace.json", "/plugin install fixture@claudecodemods"],
  sha: SHA,
  treeUrl: `https://github.com/a/b/tree/${SHA}`,
  pinnedAt: "2026-10-17",
};

describe("InstallSection with a marketplace pin", () => {
  it("shows the marketplace commands and links the exact pinned commit instead of the source-only note", () => {
    render(<InstallSection extension={{ availability: "source-only", installCommands: [] }} marketplaceInstall={install} />);
    for (const command of install.commands) expect(screen.getByText(command)).toBeInTheDocument();
    const commitLink = screen.getByRole("link", { name: /0123456/ });
    expect(commitLink.getAttribute("href")).toBe(install.treeUrl);
    expect(screen.getByText("2026-10-17")).toBeInTheDocument();
    expect(screen.queryByText(NO_INSTALL_COMMAND)).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Install" }).textContent).not.toMatch(/\b(reviewed|audited|safe|tested)\b/i);
  });

  it("shows the pinned commands even when the listing also gives its own, unpinned ones", () => {
    render(
      <InstallSection
        extension={{ availability: "installable", installCommands: ["/plugin install own@market"] }}
        marketplaceInstall={install}
      />,
    );
    expect(screen.getByText(install.commands[1])).toBeInTheDocument();
    expect(screen.queryByText("/plugin install own@market")).not.toBeInTheDocument();
  });

  it("shows the source-only note without a pin", () => {
    render(<InstallSection extension={{ availability: "source-only", installCommands: [] }} />);
    expect(screen.getByText(NO_INSTALL_COMMAND)).toBeInTheDocument();
  });
});
