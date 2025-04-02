// deno-lint-ignore-file no-case-declarations
import type The65c02 from "../65c02.ts";

export default function (this: The65c02, mode: string) {
    switch (mode) {
        case 'zero-page':
            // set PC to where the ZP address is
            this.programCounter.increment()
            const zpa = this.readPC()
            this.io.address.set(zpa.num());
            this.read();
            let v = this.io.data.num();
            v++
            v &= 0xFF
            this.io.data.set(v)
            this.write()
            this.flagZN(v)
            this.programCounter.increment()
            break;
        
        case 'zero-page, X-indexed':
            // set PC to where the ZP address is
            this.programCounter.increment()
            const zpax = this.readPC()
            this.io.address.set(zpax.num() + this.regX.num());
            this.read();
            let vzx = this.io.data.num();
            vzx++
            vzx &= 0xFF
            this.io.data.set(vzx)
            this.write()
            this.flagZN(vzx)
            this.programCounter.increment()
            break;
        
        case 'absolute':
            // skip over the opcode
            this.programCounter.increment()
            const lo_abit = this.readPC().num()
            this.programCounter.increment()
            const hi_abit = this.readPC().num()
            this.io.address.set((hi_abit << 8) | lo_abit)
            this.read()
            let va = this.io.data.num();
            va++
            va &= 0xFF
            this.io.data.set(va)
            this.write()
            this.programCounter.increment()
            break;
        
        case 'absolute, X-indexed':
            // skip over the opcode
            this.programCounter.increment()
            const lo_axbit = this.readPC().num()
            this.programCounter.increment()
            const hi_axbit = this.readPC().num()
            this.io.address.set(((hi_axbit << 8) | lo_axbit) + this.regX.num())
            this.read()
            let vax = this.io.data.num();
            vax++
            vax &= 0xFF
            this.io.data.set(vax)
            this.write()
            this.programCounter.increment()
            break;
    
        default:
            throw 'wha';
    }
}