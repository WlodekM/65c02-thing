import The65c02, { BitField, Pin } from "./65c02.ts";
import matrix from "./opcode_matrix.json" with { type: "json" };
import { parseArgs } from "jsr:@std/cli/parse-args";

// the thing used for ram
const ram = new Uint8Array(2**16);

// initiate the emulator
const cpu = new The65c02(function (this: The65c02) {
    // since this is controlled by the user it's easy
    // to map things into address space
    this.io.data.set(ram[this.io.address.num()] ?? 0)
}, function (this: The65c02) {
    if (this.io.address.num() == 0x5000) {
        return Deno.stdout.write(new Uint8Array([this.io.data.num()]))
    }
    // write
    ram[this.io.address.num()] = this.io.data.num()
})

await cpu.loadInstructions()

const args = parseArgs(Deno.args)

const binStart = parseInt(args.b ?? args.binStart ?? '8000', 16)

if (Number.isNaN(binStart))
    throw 'binStart is NaN!'

// read code from file
const code = Deno.readFileSync(args._.toString() || 'msbasic/tmp/eater.bin')

// mem address $0000
ram[0xFFFC] = binStart & 0x00FF
ram[0xFFFD] = (binStart & 0xFF00) >> 8

// write code to ram before execution
for (let offset = 0; offset < code.length; offset++) {
    const byte = code[offset];
    ram[binStart  + offset] = byte;
}

// pull RESB low to reset the 65c02
cpu.io.reset.LO()
cpu.cycle()

//the cpu reset, pull RESB high and start execution!
cpu.io.reset.HI()

function inspect() {
    console.log('IO status:')
    console.log(Object.entries(cpu.io)
        .map(([name, io]) => {
            if (io instanceof Pin) {
                return ` ${name}: ${' '.repeat(20 - name.length)}${io.high ? "HI" : "LO"}`
            } else if (io instanceof BitField) {
                return ` ${name}: ${' '.repeat(20 - name.length)}${io.bits.map(k=>+k).join('')} (0x${io.num().toString(16)})`
            }
        }).join('\n'));
    
    console.log('\nregisters:')
    console.log(` A:  ${cpu.regA.bits.reverse().map(k=>+k).join('')} (0x${cpu.regA.num().toString(16)})`)
    console.log(` X:  ${cpu.regX.bits.reverse().map(k=>+k).join('')} (0x${cpu.regX.num().toString(16)})`)
    console.log(` Y:  ${cpu.regY.bits.reverse().map(k=>+k).join('')} (0x${cpu.regY.num().toString(16)})`)
    console.log(` SP: ${cpu.stackPointer.bits.reverse().map(k=>+k).join('')} (0x${cpu.stackPointer.num().toString(16)})`)
    console.log(` PC: ${cpu.programCounter.bits.reverse().map(k=>+k).join('')} (0x${cpu.programCounter.num().toString(16)})`)
}

const debug = Deno.args.includes('-d')

let skip = 0;
let breakpoints: number[] = []
let instBreakpoints: string[] = []

if (debug) {
    console.info('NOTE; the instructions are executed after input')
}

// repeat until the cpu requests an interrupt
mainloop:
while (!cpu.io.interruptRequest.high) {
    const instId = ram[cpu.programCounter.num()]
        .toString(16)
        .padStart(2, '0');
    const goog = (matrix as Record<string, { mnemonic: string, mode: string }>)[instId];
    if (!goog) {
        console.log('uh', instId, 'unknown')
        break;
    }
    const instr = goog;
    if (debug)
    console.debug(cpu.programCounter.num().toString(16).padStart(4, '0'),instr.mnemonic, instr.mode)

    // debug step-by-step mode
    dbg: if (debug) {
        if (instBreakpoints.includes(instr.mnemonic)) {
            instBreakpoints = instBreakpoints.filter(k => k != instr.mnemonic)
            skip = 0;
            console.log('hit instruction breakpoint on', cpu.programCounter.num().toString(16))
        }
        if (breakpoints.includes(cpu.programCounter.num())) {
            breakpoints = breakpoints.filter(k => k != cpu.programCounter.num())
            skip = 0;
            console.log('hit breakpoint on', cpu.programCounter.num().toString(16))
        }
        if (skip != 0) {
            skip--
            break dbg;
        }
        dbgl:
        while (true) {
            const i = new Uint8Array(16);
            Deno.stdout.write(Uint8Array.from(['.'.charCodeAt(0)]))
            await Deno.stdin.read(i);
            if (i[0] == 'b'.charCodeAt(0)) {
                console.log('BREAK!!')
                break mainloop;
            } else if (i[0] == 'i'.charCodeAt(0)) {
                inspect()
                continue;
            } else if (i[0] == 's'.charCodeAt(0)) {
                console.log('stack:')
                for (let i = 0; i < cpu.stackPointer.num(); i++) {
                    console.log(` ${i.toString(16).padStart(2, '0')} ${ram[0x01FF - i].toString(2).padStart(8, '0')} (0x${ram[0x01FF - i].toString(16).padStart(4, '0')} ${ram[0x01FF - i].toString().padStart(3)})`)
                }
                continue;
            } else if (i[0] == 'k'.charCodeAt(0)) {
                const num = +(new TextDecoder().decode(i.slice(1, 7)).replaceAll('\0', ''));
                if (Number.isNaN(num)) {
                    console.log('NaN')
                    break dbg;
                }
                skip = num;
                console.log(`skipping ${num} cycles`)
                break dbgl;
            } else if (i[0] == 'r'.charCodeAt(0)) {
                const num = i[2] ? parseInt(new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', ''), 16) : cpu.programCounter.num();
                console.log(`set breakpoint on`, num.toString(16))
                breakpoints.push(num)
                continue;
            } else if (i[0] == '?'.charCodeAt(0)) {
                console.log(`b - break, exit
i - inspect
s - inspect stack
c - continue
k[NUM] - skip
r[ADR] - breakpoint
g[ADR] - goto, change PC
I[INS] - breakpoint instruction`);
                continue;
            } else if (i[0] == 'g'.charCodeAt(0)) {
                const num = i[2] ? parseInt(new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', ''), 16) : cpu.programCounter.num();
                console.log(`PC set to`, num.toString(16))
                cpu.programCounter.set(num)
                continue;
            } else if (i[0] == 'I'.charCodeAt(0)) {
                const instr = new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', '')
                console.log(`instruction breakpoint set on`, instr)
                instBreakpoints.push(instr)
                continue;
            } else if (i[0] == 'c'.charCodeAt(0)) {
                skip = -1
                console.log(`continuing execution`)
            } else if (i[0] == ':'.charCodeAt(0)) {
                const instr = new TextDecoder().decode(i.slice(1, 15)).replace('\n', '').replaceAll('\0', '')
                const match = [...instr.matchAll(/^([a-fA-F0-9]{1,4})=([a-fA-F0-9]{1,2})$/g)];
                if (!match || !match[0]) {
                    console.log('not matched, uhoh')
                    continue;
                }
                const [_, addr, data] = match[0]
                console.log(`set $${addr} to 0x${data}`)
                ram[parseInt(addr, 16)] = parseInt(data, 16)
                continue;
            } else if (i[0] == '\\'.charCodeAt(0)) {
                const num = parseInt(new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', ''), 16);
                if (Number.isNaN(num))
                    continue;
                console.log(`${num.toString(16).padStart(4, '0')}: ${ram[num].toString(16).padStart(2, '0')}`)
                continue;
            } else if (i[0] == '\''.charCodeAt(0)) {
                if (i[1] == '\n'.charCodeAt(0)) {
                    ram[0x5000] = 0;
                    ram[0x5001] = 0;
                    console.log('reset')
                    continue;
                }
                const num = parseInt(new TextDecoder().decode(i.slice(1, 3)).replace('\n', '').replaceAll('\0', ''), 16);
                if (Number.isNaN(num))
                    continue;
                ram[0x5000] = num;
                ram[0x5001] = 0x08;
                console.log(`set $5000 to 0x${num.toString(16).padStart(2, '0')} and $5001 to 08`)
                console.log('skipping 8 cycles');
                skip = 8;
            }
            break;
        }
    }
    cpu.cycle();
}

console.log('end of execution\n\n')
inspect()

// console.debug('\nRAM:')
Deno.writeFileSync('ram.bin', ram)
// new Deno.Command('hexdump', {
//     args: ['-C', 'ram.bin']
// }).spawn()
