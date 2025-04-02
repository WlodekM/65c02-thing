import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    switch (mode) {
        case 'implied':
            this.regX.increment()
            this.negative = this.regX.bit(7);
            this.zero = this.regX.num() == 0;
            this.programCounter.increment();
            break;
    
        default:
            throw 'wha';
    }
}