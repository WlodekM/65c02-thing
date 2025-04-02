import The65c02, { BitField, Pin } from "./65c02.ts";
// import { instructionIds } from "./instructions.ts";
import opcodeMatrix from "./opcode_matrix.json" with { type: "json" };

function instruction(name: string | TemplateStringsArray, mode: string = 'implied'): number {
    const goog = (Object.entries(opcodeMatrix).find(([_, v]) =>
        v.mnemonic == name && v.mode == mode) ?? [])[0];
    if (!goog)
        throw `unknown instruction (${name}-${mode})`
    return parseInt(goog, 16)
}

// the thing used for ram
const ram = new Uint8Array(2**16);

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
ram[0xFFFD] = 0x00

//TODO: read code from file
// const code = [
//     // nop
//     instruction`CLC`,
//     // instruction`CLD`,
//     instruction('INC', 'zero-page'),
//     0x21,
//     instruction`BRK`,
// ]

const code = Deno.readFileSync('a.out')

// write code to ram before execution
for (let offset = 0; offset < code.length; offset++) {
    const byte = code[offset];
    ram[offset] = byte;
}

// pull RESB low to reset the 65c02
cpu.io.reset.LO()
cpu.cycle()

//the cpu reset, pull RESB high and start execution!
cpu.io.reset.HI()

while (!cpu.io.interruptRequest.high) {
    cpu.cycle()
}

console.log('end of execution\n\nIO status:')
console.log(Object.entries(cpu.io)
    .map(([name, io]) => {
        if (io instanceof Pin) {
            return ` ${name}: ${' '.repeat(20 - name.length)}${io.high ? "HI" : "LO"}`
        } else if (io instanceof BitField) {
            return ` ${name}: ${' '.repeat(20 - name.length)}${io.bits.map(k=>+k).join('')} (0x${io.num().toString(16)})`
        }
    }).join('\n'));

console.log('\nregisters:')
console.log(` A: ${cpu.regA.bits.map(k=>+k).join('')} (0x${cpu.regA.num().toString(16)})`)
console.log(` X: ${cpu.regX.bits.map(k=>+k).join('')} (0x${cpu.regX.num().toString(16)})`)
console.log(` Y: ${cpu.regY.bits.map(k=>+k).join('')} (0x${cpu.regY.num().toString(16)})`)

console.debug('\nRAM:')
Deno.writeFileSync('ram.bin', ram)
new Deno.Command('hexdump', {
    args: ['-C', 'ram.bin']
}).spawn()
