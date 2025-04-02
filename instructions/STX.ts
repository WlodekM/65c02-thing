import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const addr = this.getAddr(mode);
    this.io.address.set(addr);
    this.io.data.set(this.regX.num())
    this.write();
}