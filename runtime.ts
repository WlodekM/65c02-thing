import The65c02, { BitField, Pin } from "./65c02.ts";
import matrix from "./opcode_matrix.json" with { type: "json" };

// the thing used for ram
const ram = new Uint8Array(2**16);

// initiate the emulator
const cpu = new The65c02(function (this: The65c02) {
    // since this is controlled by the user it's easy
    // to map things into address space
    this.io.data.set(ram[this.io.address.num()] ?? 0)
}, function (this: The65c02) {
    // write
    ram[this.io.address.num()] = this.io.data.num()
})

await cpu.loadInstructions()

// mem address $0000
ram[0xFFFC] = 0x00
ram[0xFFFD] = 0x80

// read code from file
const code = Deno.readFileSync('msbasic/tmp/eater.bin')

// write code to ram before execution
for (let offset = 0; offset < code.length; offset++) {
    const byte = code[offset];
    ram[0x8000 + offset] = byte;
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
    console.log(` A:      ${cpu.regA.bits.map(k=>+k).join('')} (0x${cpu.regA.num().toString(16)})`)
    console.log(` X:      ${cpu.regX.bits.map(k=>+k).join('')} (0x${cpu.regX.num().toString(16)})`)
    console.log(` Y:      ${cpu.regY.bits.map(k=>+k).join('')} (0x${cpu.regY.num().toString(16)})`)
    console.log(` SP:     ${cpu.stackPointer.bits.map(k=>+k).join('')} (0x${cpu.stackPointer.num().toString(16)})`)
    console.log(` PC:     ${cpu.programCounter.bits.map(k=>+k).join('')} (0x${cpu.programCounter.num().toString(16)})`)
}

const debug = Deno.args.includes('-d')

let skip = 0;
let breakpoints: number[] = []
let instBreakpoints: string[] = []

// repeat until the cpu requests an interrupt
while (!cpu.io.interruptRequest.high) {
    cpu.cycle();

    // debug step-by-step mode
    dbg: if (debug) {
        const goog = Object.entries(matrix).find(([k]) => k == ram[cpu.programCounter.num()].toString(16));
        if (!goog) {
            console.log('uh')
            break dbg;
        }
        const instr = goog[1];
        console.debug(cpu.programCounter.num().toString(16).padStart(4, '0'),instr.mnemonic, instr.mode)
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
        if (skip > 0) {
            skip--
            break dbg;
        }
        const i = new Uint8Array(8);
        Deno.stdout.write(Uint8Array.from(['.'.charCodeAt(0)]))
        await Deno.stdin.read(i);
        if (i[0] == 'b'.charCodeAt(0)) {
            console.log('BREAK!!')
            break;
        } else if (i[0] == 'i'.charCodeAt(0)) {
            inspect()
        } else if (i[0] == 's'.charCodeAt(0)) {
            console.log('stack:')
            for (let i = 0; i < cpu.stackPointer.num(); i++) {
                console.log(` ${i.toString(16).padStart(2, '0')} ${ram[0x01FF - i].toString(2).padStart(8, '0')} (0x${ram[0x01FF - i].toString(16).padStart(4, '0')} ${ram[0x01FF - i]})`)
            }
        } else if (i[0] == 'k'.charCodeAt(0)) {
            const num = +(new TextDecoder().decode(i.slice(1, 7)).replaceAll('\0', ''));
            if (Number.isNaN(num)) {
                console.log('NaN')
                break dbg;
            }
            skip = num;
            console.log(`skipping ${num} cycles`)
        } else if (i[0] == 'r'.charCodeAt(0)) {
            const num = i[2] ? parseInt(new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', ''), 16) : cpu.programCounter.num();
            console.log(`set breakpoint on`, num.toString(16))
            breakpoints.push(num)
        } else if (i[0] == '?'.charCodeAt(0)) {
            console.log(`b - break, exit
i - inspect
s - inspect stack
k[NUM] - skip
r[ADR] - breakpoint
g[ADR] - goto, change PC
I[INS] - breakpoint instruction`);
        } else if (i[0] == 'g'.charCodeAt(0)) {
            const num = i[2] ? parseInt(new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', ''), 16) : cpu.programCounter.num();
            console.log(`PC set to`, num.toString(16))
            cpu.programCounter.set(num)
        } else if (i[0] == 'I'.charCodeAt(0)) {
            const instr = new TextDecoder().decode(i.slice(1, 7)).replace('\n', '').replaceAll('\0', '')
            console.log(`instruction breakpoint set on`, instr)
            instBreakpoints.push(instr)
        }
    }
}

console.log('end of execution\n\n')
inspect()

// console.debug('\nRAM:')
Deno.writeFileSync('ram.bin', ram)
// new Deno.Command('hexdump', {
//     args: ['-C', 'ram.bin']
// }).spawn()
