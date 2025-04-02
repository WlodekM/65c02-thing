import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const addr = this.getAddr(mode);
    this.io.address.set(addr);
    this.read();
    this.flagZN(this.io.data.num())
    this.regX.set(this.io.data.num())
}