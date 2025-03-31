import { PC } from "../pc.ts";

export default {
    function(this: PC, [reg1, reg2]: number[]) {
        const r1 = this.lib.parseReg(reg1);
        const r2 = this.lib.parseReg(reg2);
        this.returnFlag = +(this.getMem(this.registers[r2]) != 0);
        this.registers[r1] = this.getMem(this.registers[r2])
    },
    args: 2
}