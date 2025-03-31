import { ASTNode, BinaryExpressionNode, FunctionDeclarationNode, NumberNode, VariableDeclarationNode, WhileNode } from "./ast.ts";
// import { PC } from "../pc.ts";
// const pc = new PC();

type Opcode = 
    'mov'  |
    'swp'  |
    'ld'   |
    'str'  |
    'add'  |
    'sub'  |
    'mul'  |
    'div'  |
    'mod'  |
    'shl'  |
    'shr'  |
    'cmp'  |
    'cmr'  |
    'and'  |
    'or'   |
    'xor'  |
    'not'  |
    'push' |
    'pop'  |
    'halt' |
    'sys'  |
    'jmp'  |
    'jnz'  |
    'jz'   |
    'jmr'  |
    'ret'  |
    'end';
type Register = 97 | 98 | 99 | 100

interface Instruction {
    opcode: Opcode,
    args: (Register | number)[]
}

const types: Record<string, number> = {
    'int' : 1,
    'bool': 1,
    'char': 1
}

const A: Register = 97;
const B: Register = 98;
// deno-lint-ignore no-unused-vars
const C: Register = 99;
// deno-lint-ignore no-unused-vars
const D: Register = 100;

export default class Compiler {
    vars: Record<string, [number, number]> = {};
    functions: Record<string, number> = {};
    AST: ASTNode[];
    lastAddr: number = 0;
    instructions: Instruction[] = [];
    constructor (ast: ASTNode[]) {
        this.AST = ast
    }
    compile (node: ASTNode) {
        if ((node as VariableDeclarationNode).type == 'VariableDeclaration') {
            const varDeclNode = node as VariableDeclarationNode;
            if (!types[varDeclNode.vtype]) throw 'unknown type';
            const addr = this.vars[varDeclNode.identifier] =
                [this.lastAddr, types[varDeclNode.vtype] * varDeclNode.length];
            this.lastAddr += types[varDeclNode.vtype] * varDeclNode.length;
            if (varDeclNode.value.type != 'Number') throw 'a';
            this.instructions.push({
                opcode: 'mov',
                args: [A, (varDeclNode.value as NumberNode).value]
            })
            this.instructions.push({
                opcode: 'mov',
                args: [B, addr[0]]
            })
            this.instructions.push({
                opcode: 'str',
                args: [B, A]
            })
        } else if ((node as FunctionDeclarationNode).type == 'FunctionDeclaration') {
            const fnDeclNode = node as FunctionDeclarationNode;
            this.functions[fnDeclNode.name] = this.instructions
                .map(k => 1 + k.args.length)
                .reduce((prev, curr) => {
                    return prev + curr 
                }, 0);
            for (const node of fnDeclNode.body) {
                this.compile(node)
            }
        } else if ((node as BinaryExpressionNode).type == 'BinaryExpression') {
            const binExpNode = node as BinaryExpressionNode;
            this.instructions.push({
                opcode: 'pop',
                args: [A]
            })
            this.instructions.push({
                opcode: 'pop',
                args: [B]
            })
            switch (binExpNode.operator) {
                case '+':
                    this.instructions.push({
                        opcode: 'add',
                        args: [A, A, B]
                    })
                    break;
            
                default:
                    throw 'oh no'
            }
            this.instructions.push({
                opcode: 'push',
                args: [A]
            })
        } else if ((node as WhileNode).type == 'While') {
            const whileNode = node as WhileNode;
            const start = this.instructions
                .map(k => 1 + k.args.length)
                .reduce((prev, curr) => {
                    return prev + curr 
                }, 0);
            for (const node of whileNode.branch) {
                this.compile(node)
            }
            this.instructions.push({
                opcode: 'pop',
                args: [A]
            })
            this.instructions.push({
                opcode: 'mov',
                args: [B, 0]
            })
            this.instructions.push({
                opcode: 'cmp',
                args: [A, B]
            })
            this.instructions.push({
                opcode: 'mov',
                args: [A, start]
            })
            this.instructions.push({
                opcode: 'jnz',
                args: [A]
            })
        } else {
            console.error(`!!! UNIMPLEMENTED NODE `, node.type, node)
        }
    }
}