import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const location = this.getAddr(mode, ['absolute']);
    this.push(this.programCounter.num())
    this.programCounter.set(location)
}