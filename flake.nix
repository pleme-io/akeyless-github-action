{
  description = "Akeyless GitHub Action for fetching secrets and provisioning access";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    substrate = {
      url = "github:pleme-io/substrate";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = inputs: (import "${inputs.substrate}/lib/repo-flake.nix" {
    inherit (inputs) nixpkgs flake-utils;
  }) {
    self = inputs.self;
    language = "npm";
    builder = "action";
    pname = "akeyless-github-action";
    npmDepsHash = "sha256-0xATbadtb/oeX85Hhtn/OXnqiurk/lDX59a2Dzivj8E=";
    npmBuildScript = "package";
    nodeOptions = "--openssl-legacy-provider";
    description = "Akeyless GitHub Action for fetching secrets and provisioning access";
    homepage = "https://github.com/pleme-io/akeyless-github-action";
  };
}
