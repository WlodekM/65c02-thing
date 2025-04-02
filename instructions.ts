export const instructions: Record<number, string> = {
    1:  "ADC", // ADd memory to accumulator with Carry
    2:  "AND", // "AND" memory with accumulator
    3:  "ASL", // Arithmetic Shift one bit Left, memory or accumulator
    // 4. BBR Branch on Bit Reset
    // 5. BBS Branch of Bit Set
    6:  "BCC", // Branch on Carry Clear (Pc=0)
    7:  "BCS", // Branch on Carry Set (Pc=1)
    8:  "BEQ", // Branch if EQual (Pz=1)
    9:  "BIT", // BIt Test
    10: "BMI", // Branch if result MInus (Pn=1)
    11: "BNE", // Branch if Not Equal (Pz=0)
    12: "BPL", // Branch if result PLus (Pn=0)
    // 13. BRA // BRanch Always
    14: "BRK", // BReaK instruction
    15: "BVC", // Branch on oVerflow Clear (Pv=0)
    16: "BVS", // Branch on oVerflow Set (Pv=1)
    17: "CLC", // CLear Cary flag
    18: "CLD", // CLear Decimal mode
    19: "CLI", // CLear Interrupt disable bit
    20: "CLV", // CLear oVerflow flag
    21: "CMP", // CoMPare memory and accumulator
    22: "CPX", // ComPare memory and X register
    23: "CPY", // ComPare memory and Y register
    24: "DEC", // DECrement memory or accumulate by one
    25: "DEX", // DEcrement X by one
    26: "DEY", // DEcrement Y by one
    27: "EOR", // "Exclusive OR" memory with accumulate
    28: "INC", // INCrement memory or accumulate by one
    29: "INX", // INcrement X register by one
    30: "INY", // INcrement Y register by one
    31: "JMP", // JuMP to new location
    32: "JSR", // Jump to new location Saving Return (Jump to SubRoutine)
    33: "LDA", // LoaD Accumulator with memory
    34: "LDX", // LoaD the X register with memory
    35: "LDY", // LoaD the Y register with memory
    36: "LSR", // Logical Shift one bit Right memory or accumulator
    37: "NOP", // No OPeration
    38: "ORA", // "OR" memory with Accumulator
    39: "PHA", // PusH Accumulator on stack
    40: "PHP", // PusH Processor status on stack
    // 41. PHX PusH X register on stack
    // 42. PHY PusH Y register on stack
    43: "PLA", // PuLl Accumulator from stack
    44: "PLP", // PuLl Processor status from stack
    // 45. PLX PuLl X register from stack
    // 46. PLY PuLl Y register from stack
    // 47. RMB Reset Memory Bit
    48: "ROL", // ROtate one bit Left memory or accumulator
    49: "ROR", // ROtate one bit Right memory or accumulator
    50: "RTI", // ReTurn from Interrupt
    51: "RTS", // ReTurn from Subroutine
    52: "SBC", // SuBtract memory from accumulator with borrow (Carry bit)
    53: "SEC", // SEt Carry
    54: "SED", // SEt Decimal mode
    55: "SEI", // SEt Interrupt disable status
    // 56. SMB Set Memory Bit
    57: "STA", // STore Accumulator in memory
    // 58. STP SToP mode
    59: "STX", // STore the X register in memory
    60: "STY", // STore the Y register in memory
    // 61. STZ STore Zero in memory
    62: "TAX", // Transfer the Accumulator to the X register
    63: "TAY", // Transfer the Accumulator to the Y register
    // 64. TRB Test and Reset memory Bit
    // 65. TSB Test and Set memory Bit
    66: "TSX", // Transfer the Stack pointer to the X register
    67: "TXA", // Transfer the X register to the Accumulator
    68: "TXS", // Transfer the X register to the Stack pointer register
    69: "TYA", // Transfer Y register to the Accumulator
    // 70. WAI WAit for Interrupt
}

export const instructionIds = {
    /** ADd memory to accumulator with Carry */
    "ADC": 1,
    /** "AND" memory with accumulator */
    "AND": 2,
    /** Arithmetic Shift one bit Left, memory or accumulator */
    "ASL": 3,
    /** Branch on Carry Clear (Pc=0) */
    "BCC": 6,
    /** Branch on Carry Set (Pc=1) */
    "BCS": 7,
    /** Branch if EQual (Pz=1) */
    "BEQ": 8,
    /** BIt Test */
    "BIT": 9,
    /** Branch if result MInus (Pn=1) */
    "BMI": 10,
    /** Branch if Not Equal (Pz=0) */
    "BNE": 11,
    /** Branch if result PLus (Pn=0) */
    "BPL": 12,
    /** BReaK instruction */
    "BRK": 14,
    /** Branch on oVerflow Clear (Pv=0) */
    "BVC": 15,
    /** Branch on oVerflow Set (Pv=1) */
    "BVS": 16,
    /** CLear Cary flag */
    "CLC": 17,
    /** CLear Decimal mode */
    "CLD": 18,
    /** CLear Interrupt disable bit */
    "CLI": 19,
    /** CLear oVerflow flag */
    "CLV": 20,
    /** CoMPare memory and accumulator */
    "CMP": 21,
    /** ComPare memory and X register */
    "CPX": 22,
    /** ComPare memory and Y register */
    "CPY": 23,
    /** DECrement memory or accumulate by one */
    "DEC": 24,
    /** DEcrement X by one */
    "DEX": 25,
    /** DEcrement Y by one */
    "DEY": 26,
    /** "Exclusive OR" memory with accumulate */
    "EOR": 27,
    /** INCrement memory or accumulate by one */
    "INC": 28,
    /** INcrement X register by one */
    "INX": 29,
    /** INcrement Y register by one */
    "INY": 30,
    /** JuMP to new location */
    "JMP": 31,
    /** Jump to new location Saving Return (Jump to SubRoutine) */
    "JSR": 32,
    /** LoaD Accumulator with memory */
    "LDA": 33,
    /** LoaD the X register with memory */
    "LDX": 34,
    /** LoaD the Y register with memory */
    "LDY": 35,
    /** Logical Shift one bit Right memory or accumulator */
    "LSR": 36,
    /** No OPeration */
    "NOP": 37,
    /** "OR" memory with Accumulator */
    "ORA": 38,
    /** PusH Accumulator on stack */
    "PHA": 39,
    /** PusH Processor status on stack */
    "PHP": 40,
    /** PuLl Accumulator from stack */
    "PLA": 43,
    /** PuLl Processor status from stack */
    "PLP": 44,
    /** ROtate one bit Left memory or accumulator */
    "ROL": 48,
    /** ROtate one bit Right memory or accumulator */
    "ROR": 49,
    /** ReTurn from Interrupt */
    "RTI": 50,
    /** ReTurn from Subroutine */
    "RTS": 51,
    /** SuBtract memory from accumulator with borrow (Carry bit) */
    "SBC": 52,
    /** SEt Carry */
    "SEC": 53,
    /** SEt Decimal mode */
    "SED": 54,
    /** SEt Interrupt disable status */
    "SEI": 55,
    /** STore Accumulator in memory */
    "STA": 57,
    /** STore the X register in memory */
    "STX": 59,
    /** STore the Y register in memory */
    "STY": 60,
    /** Transfer the Accumulator to the X register */
    "TAX": 62,
    /** Transfer the Accumulator to the Y register */
    "TAY": 63,
    /** Transfer the Stack pointer to the X register */
    "TSX": 66,
    /** Transfer the X register to the Accumulator */
    "TXA": 67,
    /** Transfer the X register to the Stack pointer register */
    "TXS": 68,
    /** Transfer Y register to the Accumulator */
    "TYA": 69,
}
