import type { Module } from "@substreams/core/proto/sf/substreams/v1/modules_pb.js";
import { getModuleOrThrow } from "@substreams/core";

export function applyParams(params: string[], modules: Module[]) {
  for (const param of params) {
    const parts = param.split("=");
    const module = parts.reverse().pop();
    const value = parts.reverse().join("=");
    if (module === undefined || value === undefined) {
      throw new Error(`Invalid param ${param}. Must be in the form of "module=value" or "imported:module=value"`);
    }
    const match = getModuleOrThrow(modules, module);
    const [input] = match.inputs;
    if (input === undefined) {
      throw new Error(`Missing required params input definition for module ${module}`);
    }

    if (input.input.case !== "params") {
      throw new Error(`First input definition of module ${module} is not a params input`);
    }
    // Assign the parameter value to the input.
    input.input.value.value = value;
  }
}
