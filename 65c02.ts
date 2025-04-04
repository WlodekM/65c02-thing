import opcodeMatrix from "./opcode_matrix.json" with { type: "json" };

export class BitField {
    bits: boolean[];
    flip(bit: number) {
        this.bits[bit] = !this.bits[bit];
    }
    bit(bit: number) {
        return this.bits[bit]
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

export class Register<T=number> extends BitField {
    get value(): number {
        return this.num()
    }
    set value(value: number) {
        this.set(value)
    }
    increment(): number {
        this.set(this.num() + 1);
        return this.num()
    }
    decrement(): number {
        this.set(this.num() - 1);
        return this.num()
    }
    constructor(bits: number) {
        super(bits);
    }
}

export class Pin {
    high: boolean = false;
    HI() {
        this.high = true
    }
    LO() {
        this.high = false
    }
    constructor(init = false) {
        this.high = init
    }
}

export class IO {
    private _data:            BitField = new BitField(8);
    private _address:         BitField = new BitField(16);
    private _busEnable:            Pin = new Pin();
    private _NMI:                  Pin = new Pin();
    private _ready:                Pin = new Pin(true);
    private _reset:                Pin = new Pin(true);
    private _readWrite:            Pin = new Pin();
    private _interruptRequest:     Pin = new Pin();
    get data()             {return this._data}
    get address()          {return this._address}
    get busEnable()        {return this._busEnable}
    get NMI()              {return this._NMI}
    get ready()            {return this._ready}
    get reset()            {return this._reset}
    get readWrite()        {return this._readWrite}
    get interruptRequest() {return this._interruptRequest}
}

/**
 * the shittiest 65c02 emulator ever
 * 
 * not clock cycle accurate because fuck you
 */
export default class The65c02 {
    io:                    IO = new IO();
    //SECTION - register
    programCounter:      Register<16> = new Register(16);
    private registerA:    Register<8> = new Register(8);
    private registerX:    Register<8> = new Register(8);
    private registerY:    Register<8> = new Register(8);

    get regA () { return this.registerA }
    get regX () { return this.registerX }
    get regY () { return this.registerY }

    stackPointer:    Register<8>  = new Register(8);
    status:          Register<8>  = new Register(8);
    //!SECTION
    //SECTION - status reg bits
    get carry(): boolean {return this.status.bit(0)}
    set carry(value:boolean) {this.status.setBit(0, value)}
    get zero(): boolean {return this.status.bit(1)}
    set zero(value:boolean) {this.status.setBit(1, value)}
    get IRQBDisable(): boolean {return this.status.bit(2)}
    set IRQBDisable(value:boolean) {this.status.setBit(2, value)}
    get decimalMode(): boolean {return this.status.bit(3)}
    set decimalMode(value:boolean) {this.status.setBit(3, value)}
    get BRK(): boolean {return this.status.bit(4)}
    set BRK(value:boolean) {this.status.setBit(4, value)}
    // ...1... //
    get overflow(): boolean {return this.status.bit(6)}
    set overflow(value:boolean) {this.status.setBit(6, value)}
    get negative(): boolean {return this.status.bit(7)}
    set negative(value:boolean) {this.status.setBit(7, value)}
    //!SECTION
    read: () => void;
    write: () => void;
    readPC(): BitField {
        this.io.address.set(this.programCounter.num());
        this.read()
        return this.io.data;
    }
    flagZN(num: number) {
        this.negative = (num & 0x80) != 0;
        this.zero = num == 0;
    }
    flagZCN(num: number) {
        this.carry = num > 0xFF
        this.negative = (num & 0x80) != 0;
        this.zero = num == 0;
    }
    instructions: Record<string, (mode: string) => void> = {};
    cycle() {
        if(!this.io.reset.high) {
            // reset register thingies
            this.IRQBDisable = true;
            this.decimalMode = false;
            this.BRK = true;
            // get reset vector
            let resetVector = 0;
            this.io.address.set(0xFFFC);
            this.read()
            console.log('reset vector LO', this.io.data.num().toString(16))
            resetVector |= this.io.data.num();
            this.io.address.set(0xFFFD);
            this.read()
            console.log('reset vector HI', this.io.data.num().toString(16))
            resetVector |= this.io.data.num() << 8;
            // move PC to RV
            this.programCounter.set(resetVector);
            return;
        }
        if (this.io.interruptRequest.high && !this.IRQBDisable) {
            console.log('interrupt!')
            this.IRQBDisable = true;
            this.push(this.programCounter.num() & 0x00FF)
            this.push(this.programCounter.num() & 0xFF00)
            this.push(this.status.num())
            let interruptVector = 0;
            this.io.address.set(0xFFFE);
            this.read()
            interruptVector |= this.io.data.num();
            this.io.address.set(0xFFFF);
            this.read()
            interruptVector |= this.io.data.num() << 8;
            this.programCounter.set(interruptVector);
            return;
        }
        this.io.address.set(this.programCounter.num());
        this.read();
        const instruction = this.io.data
            .num()
            .toString(16)
            .padStart(2, '0')
            .toLowerCase();
        const opm: Record<string, { mnemonic: string, mode: string }> = opcodeMatrix;
        if (!opm[instruction])
            throw `not found ${instruction}`
        if (!this.instructions[opm[instruction].mnemonic])
            throw `not implement, sowwy (${opm[instruction].mnemonic}.ts not found)`;
        this.instructions[opm[instruction].mnemonic].call(this, opm[instruction].mode);
    }
    //SECTION - utils
    /** push stuff onto stack */
    push(val: number) {
        if (this.stackPointer.num() >= 0xFF)
            console.error('stack overflow (no, not like the website)');
        this.stackPointer.increment();
        this.io.address.set(0x01FF - this.stackPointer.num());
        this.io.data.set(val);
        this.write();
    }
    pop(): number {
        if (this.stackPointer.num() <= 0)
            console.error('stack underflow');
        this.io.address.set(0x01FF - this.stackPointer.num());
        this.read()
        this.stackPointer.decrement();
        return this.io.data.num()
    }
    getZPAddr(): number {
        this.programCounter.increment()
        const zp = this.readPC().num()
        this.programCounter.increment()
        return zp
    }
    getZPXAddr(): number {
        this.programCounter.increment()
        const zp = this.readPC().num()
        this.programCounter.increment()
        return (this.regX.num() + zp) & 0xFF
    }
    getAbsoluteAddr(): number {
        this.programCounter.increment()
        const lo_abit = this.readPC().num()
        this.programCounter.increment()
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return (hi_abit << 8) | lo_abit
    }
    getAbsoluteXAddr(): number {
        this.programCounter.increment()
        const lo_abit = this.readPC().num()
        this.programCounter.increment()
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return this.regX.num() + ((hi_abit << 8) | lo_abit)
    }
    getAbsoluteYAddr(): number {
        this.programCounter.increment()
        const lo_abit = this.readPC().num()
        this.programCounter.increment()
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return this.regX.num() + ((hi_abit << 8) | lo_abit)
    }
    getIndirectXAddr(): number {
        this.programCounter.increment()
        const addr = this.readPC().num()
        this.io.address.set((this.regX.num() + addr) & 0xFF)
        const lo_abit = this.readPC().num()
        this.io.address.set((this.regX.num() + addr + 1) & 0xFF)
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return ((hi_abit << 8) | lo_abit)
    }
    getIndirectYAddr(): number {
        this.programCounter.increment()
        const addr = this.readPC().num()
        this.io.address.set((addr) & 0xFF)
        const lo_abit = this.readPC().num()
        this.io.address.set((addr + 1) & 0xFF)
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return ((hi_abit << 8) | lo_abit) + this.regY.num();
    }
    getZPI(): number {
        this.programCounter.increment()
        const addr = this.readPC().num()
        this.io.address.set((addr) & 0xFF)
        const lo_abit = this.readPC().num()
        this.io.address.set((addr + 1) & 0xFF)
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return ((hi_abit << 8) | lo_abit);
    }
    getAbsIndexedIndirect(): number {
        this.programCounter.increment()
        let addr = this.readPC().num()
        this.programCounter.increment()
        addr |= this.readPC().num() << 8;
        addr += this.regX.num();
        addr &= 0xFFFF
        this.io.address.set((addr) & 0xFF)
        const lo_abit = this.readPC().num()
        this.io.address.set((addr + 1) & 0xFF)
        const hi_abit = this.readPC().num()
        this.programCounter.increment()
        return ((hi_abit << 8) | lo_abit);
    }
    getAddr(mode: string, allow?: string[]): number {
        if (allow && !allow.includes(mode))
            throw 'disallowed mode'
        switch (mode) {
            case 'immediate':
                this.programCounter.increment()
                this.programCounter.increment()
                return this.programCounter.num() - 1
            case 'zero-page indirect':
                return this.getZPI()
            case 'absolute indexed indirect':
                return this.getAbsIndexedIndirect();
            // deno-lint-ignore no-case-declarations
            case 'relative':
                this.programCounter.increment()
                const offset = this.readPC()
                this.programCounter.increment()
                const neg = offset.bit(7);
                offset.setBit(7, false)
                return this.programCounter.num() + (offset.num() + (neg ? -128 : 0))
            case 'zero-page':
                return this.getZPAddr()
            case 'zero-page, X-indexed':
                return this.getZPXAddr()
            case 'absolute':
                return this.getAbsoluteAddr()
            case 'absolute, X-indexed':
                return this.getAbsoluteXAddr()
            case 'absolute, Y-indexed':
                return this.getAbsoluteYAddr()
            case 'indirect, Y-indexed':
                return this.getIndirectYAddr()
            case 'X-indexed, indirect':
                return this.getIndirectXAddr()
        
            default:
                throw 'unknown mode '+mode
        }
    }
    //!SECTION
    constructor (read: () => void, write: () => void) {
        this.read = read;
        this.write = write;
    }
    async loadInstructions() {
        const dir = Deno.readDirSync('instructions')
        for (const entry of dir) {
            this.instructions[entry.name.replace('.ts', '')]
                = (await import(`./instructions/${entry.name}`)).default
        }
    }
}