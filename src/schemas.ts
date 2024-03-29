import z from "zod";

export const boolean = z
  .string()
  .transform((str) => str.toLowerCase() === "true")
  .or(z.boolean());

export const ClockSchema = z.object({
  timestamp: z.string(),
  number: z.number(),
  id: z.string(),
});
export type Clock = z.infer<typeof ClockSchema>;

export const ManifestSchema = z.object({
  substreamsEndpoint: z.string(),
  moduleName: z.string(),
  type: z.string(),
  moduleHash: z.string(),
  chain: z.string(),
  finalBlocksOnly: boolean,
});
export type Manifest = z.infer<typeof ManifestSchema>;

export const SessionSchema = z.object({
  traceId: z.string(),
  resolvedStartBlock: z.number(),
});
export type Session = z.infer<typeof SessionSchema>;

export const MetadataSchema = z.object({
  status: z.number(),
  cursor: z.string(),
  session: SessionSchema,
  clock: ClockSchema,
  manifest: ManifestSchema,
});
export type Metadata = z.infer<typeof MetadataSchema>;

export const makePayloadBody = <S extends z.Schema>(dataSchema: S) =>
  z.object({
    cursor: z.string(),
    session: SessionSchema,
    clock: ClockSchema,
    manifest: ManifestSchema,
    data: dataSchema,
  });

export const PingBody = z.object({ message: z.literal("PING") });
export const makeBodySchema = <S extends z.Schema>(payloadSchema: S) => z.union([PingBody, payloadSchema]);
