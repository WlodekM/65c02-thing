import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    if (mode == 'implicit') {
        const mem = this.regA.num();
        const result = mem >> 1;
        this.negative = (result & 128) != 0
        this.zero = result == 0
        this.carry = (mem & 1) != 0
        this.regA.set(result & 0xFF);
        this.programCounter.increment()
    } else {
        const addr = this.getAddr(mode)
        this.io.address.set(addr);
        this.read()
        const mem = this.io.data.num();
        const result = mem >> 1;
        this.negative = (result & 128) != 0
        this.zero = result == 0
        this.carry = (mem & 1) != 0
        this.io.data.set(result & 0xFF);
        this.write()
    }
}