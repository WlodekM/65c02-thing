import type The65c02 from "../65c02.ts";

export default function (this: The65c02) {
    this.programCounter.increment()
    this.regY.set(this.regA.num())
}