import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const location = this.getAddr(mode);
    this.io.address.set(location);
    this.read();
    const thing = this.regX.num() - this.io.data.num();
    this.flagZCN(thing);
}