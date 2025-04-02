import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const location = this.getAddr(mode, [
        'zero-page',
        'absolute'
    ]);
    this.io.address.set(location);
    this.read();
    this.overflow = this.io.data.bit(6)
    this.negative = this.io.data.bit(7)
    const thing = this.regA.num() & this.io.data.num();
    this.zero = thing == 0;
}