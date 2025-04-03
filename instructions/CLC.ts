import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    switch (mode) {
        case 'implicit':
            this.carry = false;
            this.programCounter.increment();
            break;
    
        default:
            throw 'wha';
    }
}