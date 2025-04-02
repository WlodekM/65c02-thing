import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const addr = this.getAddr(mode);
    this.io.address.set(addr);
    this.read();
    const res = this.io.data.num() - 1;
    this.io.data.set(res & 0xFF);
    this.flagZN(res & 0xFF)
}