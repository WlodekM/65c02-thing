# 65c02 thing

a 65c02 emulator written in typescript

do NOT use this

i am the worst typescript developer ever and it's a miracle that this thing works

if you do want to use it, here's how you can use the built-in runtime

```bash
deno -A runtime.ts <binary>
```

options:
 - `-d` - debug
 - `-b`/`--binstart` - start of binary

debug mode:
in debug mode, on each cycle, the runtime logs every instructions and pauses for input

the input can either be any of the following commands or anything else, if the input isn't a command the runtime continues execution to the next instruction

commands:
 - `b` - break, exit
 - `i` - inspect
 - `s` - inspect stack
 - `k[NUM]` - skip
 - `r[ADR]` - breakpoint
 - `g[ADR]` - goto, change PC
 - `I[INS]` - breakpoint instruction
 