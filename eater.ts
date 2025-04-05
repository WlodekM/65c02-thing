// deno-lint-ignore-file no-process-globals
import The65c02 from "./65c02.ts";
import matrix from "./opcode_matrix.json" with { type: "json" };
import { type Buffer } from "node:buffer";
// eater.ts
// a runtime meant to mimic ben eater's 65c02 computer

if (!process.stdin.isRaw)
    process.stdin.setRawMode(true)

// the thing used for ram
const ram = new Uint8Array(2**16);

// initiate the emulator
const cpu = new The65c02(function (this: The65c02) {
    // since this is controlled by the user it's easy
    // to map things into address space
    this.io.data.set(ram[this.io.address.num()] ?? 0)
    if (this.io.address.num() == 0x5000
        && ram[0x5001])
        ram[0x5001] = 0;
}, function (this: The65c02) {
    if (this.io.address.num() == 0x5000) {
        return Deno.stdout.write(new Uint8Array([this.io.data.num()]))
    }
    // write
    ram[this.io.address.num()] = this.io.data.num()
})

const binStart = 0;

await cpu.loadInstructions()

cpu.stackPointer.set(0xff)

const code = Deno.readFileSync('a.out')

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


let running = true;

process.stdin.on('data', (data: Buffer) => {
    if (data[0] == 3)
        return running = false;
    ram[0x5000] = data[0];
    ram[0x5001] = 0x08;
})

// repeat until the cpu requests an interrupt
const clock = setInterval(() => {
    if (!running) {
        Deno.writeFileSync('ram.bin', ram)
        clearInterval(clock)
        
        process.stdin.setRawMode(false);
        Deno.exit(0)
    }
    if(cpu.io.interruptRequest.high && !cpu.IRQBDisable)
        cpu.io.interruptRequest.LO();
    const instId = ram[cpu.programCounter.num()]
        .toString(16)
        .padStart(2, '0');
    const goog = (matrix as Record<string, { mnemonic: string, mode: string }>)[instId];
    if (!goog) {
        console.log('uh', instId, 'unknown')
        throw 'oh no';
    }
    const instr = goog;
    console.log(`\
       PC  AC XR YR SP NV-BDIZC
6502: ${cpu.programCounter.num().toString(16).padStart(4, '0')} ${cpu.regA.num().toString(16).padStart(2, '0')} ${cpu.regX.num().toString(16).padStart(2, '0')} ${cpu.regY.num().toString(16).padStart(2, '0')} ${cpu.stackPointer.num().toString(16).padStart(2, '0')} ${cpu.stackPointer.num().toString(2).padStart(8, '0')}`)
    console.debug(cpu.programCounter.num().toString(16).padStart(4, '0'),instr.mnemonic, instr.mode)
    cpu.cycle();
// 1MHz i think
}, 100)
