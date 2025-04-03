import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    switch (mode) {
        case 'implicit':
            this.regY.increment()
            this.negative = this.regY.bit(7);
            this.zero = this.regY.num() == 0;
            this.programCounter.increment();
            break;
    
        default:
            throw 'wha';
    }
}