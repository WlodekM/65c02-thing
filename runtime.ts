import The65c02, { BitField, Pin } from "./65c02.ts";

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

const debug = Deno.args.includes('-d')

// repeat until the cpu requests an interrupt
while (!cpu.io.interruptRequest.high) {
    cpu.cycle();

    // debug step-by-step mode
    if (debug) {
        const i = new Uint8Array(8);
        await Deno.stdin.read(i);
        if (i[0] == 'b'.charCodeAt(0)) {
            console.log('BREAK!!')
            break;
        }
    }
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
// new Deno.Command('hexdump', {
//     args: ['-C', 'ram.bin']
// }).spawn()
