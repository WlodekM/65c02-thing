import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const addr = this.getAddr(mode);
    this.io.address.set(addr);
    this.read();
    this.io.data.setBit(6, true)
    this.write();
    // this.flagZN(res & 0xFF)
}