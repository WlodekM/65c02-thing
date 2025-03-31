class BitField {
    bits: boolean[];
    flip(bit: number) {
        this.bits[bit] = !this.bits[bit];
    }
    setBit(bit: number, value: boolean) {
        this.bits[bit] = value;
    }
    set(value: number) {
        for (let bit = 0; bit < this.bits.length; bit++) {
            const mask: number = 1 << bit;
            this.setBit(bit, (value & mask) != 0)
        }
    }
    num(): number {
        let number = 0;
        for (let bit = 0; bit < this.bits.length; bit++) {
            const mask: number = 1 << bit;
            if (this.bits[bit])
                number |= mask;
        }
        return number;
    }
    constructor (len: number) {
        this.bits = new Array(len).fill(false);
    }
}

export default class The65c02 {
    data: BitField = new BitField(8)
}