import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const addr = this.getAddr(mode)
    this.io.address.set(addr);
    this.read()
    const mem = this.io.data.num();
    const result = this.regA.num() - mem - (1-+this.carry)
    this.flagZCN(result);
    this.regA.set(result & 0xFF);
}