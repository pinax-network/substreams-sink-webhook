import pkg from "../package.json" assert { type: "json" };

// https://fsymbols.com/generators/carty/
export function banner() {
  let text = `

  ░██╗░░░░░░░██╗███████╗██████╗░██╗░░██╗░█████╗░░█████╗░██╗░░██╗░██████╗
  ░██║░░██╗░░██║██╔════╝██╔══██╗██║░░██║██╔══██╗██╔══██╗██║░██╔╝██╔════╝
  ░╚██╗████╗██╔╝█████╗░░██████╦╝███████║██║░░██║██║░░██║█████═╝░╚█████╗░
  ░░████╔═████║░██╔══╝░░██╔══██╗██╔══██║██║░░██║██║░░██║██╔═██╗░░╚═══██╗
  ░░╚██╔╝░╚██╔╝░███████╗██████╦╝██║░░██║╚█████╔╝╚█████╔╝██║░╚██╗██████╔╝
  ░░░╚═╝░░░╚═╝░░╚══════╝╚═════╝░╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═════╝░

`;
  text += `                      ${pkg.name} v${pkg.version}\n\n`;
  text += "HTTP routes\n";
  text += "GET /metrics\tPrometheus Metrics\n";
  text += "GET /keypair\tGenerate random Ed25519 private & public keys\n";
  return text;
}
