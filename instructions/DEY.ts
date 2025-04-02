import type The65c02 from "../65c02.ts";

export default function (this: The65c02) {
    const res = this.regY.num() - 1;
    this.regY.set(res & 0xFF);
    this.flagZN(res & 0xFF);
    this.programCounter.increment();
}