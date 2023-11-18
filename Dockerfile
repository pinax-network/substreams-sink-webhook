FROM oven/bun
COPY . .
RUN bun install
ENTRYPOINT [ "bun", "./bin/cli.ts", "run" ]