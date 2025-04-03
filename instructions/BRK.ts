import type The65c02 from "../65c02.ts";

export default function (this: The65c02) {
    this.io.interruptRequest.HI()
    //TODO: push shit onto stack
    this.push(this.programCounter.num() & 0x00FF)
    this.push(this.programCounter.num() & 0xFF00)
    this.push(this.status.num())
    this.io.data.set(this.programCounter.num() & 0x00FF)
    this.io.address.set(0xFFFF)
    this.write()
    this.io.data.set(this.programCounter.num() & 0xFF00)
    this.io.address.set(0xFFFE)
    this.write()
    this.BRK = true
    this.programCounter.increment();
    this.programCounter.increment();
}