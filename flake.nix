{
  description = "Akeyless GitHub Action for fetching secrets and provisioning access";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs { inherit system; };
    in {
      packages.default = pkgs.buildNpmPackage {
        pname = "akeyless-github-action";
        version = "0.0.0-dev";
        src = self;
        npmDepsHash = "sha256-0xATbadtb/oeX85Hhtn/OXnqiurk/lDX59a2Dzivj8E=";
        NODE_OPTIONS = "--openssl-legacy-provider";
        dontNpmBuild = false;
        npmBuildScript = "package";
        installPhase = ''
          runHook preInstall
          mkdir -p $out
          cp -r dist $out/dist
          cp action.yml $out/ 2>/dev/null || true
          runHook postInstall
        '';
        meta = {
          description = "Akeyless GitHub Action for fetching secrets and provisioning access";
          homepage = "https://github.com/pleme-io/akeyless-github-action";
          license = pkgs.lib.licenses.isc;
        };
      };

      devShells.default = pkgs.mkShellNoCC {
        packages = with pkgs; [ nodejs_22 ];
      };
    });
}
