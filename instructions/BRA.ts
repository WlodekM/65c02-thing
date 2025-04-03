import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    const location = this.getAddr(mode, ['relative', 'absolute']);
    this.programCounter.set(location)
}