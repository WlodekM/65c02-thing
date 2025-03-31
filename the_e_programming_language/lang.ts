import Tokenizer from "./tokenizer.ts";
import ASTGen from "./ast.ts";
import Compiler from "./compiler.ts";
const input = Deno.readTextFileSync('test.e')

const tokenizer = new Tokenizer(input);
const tokens = tokenizer.tokenize();

console.log(tokens)

const astGenerator = new ASTGen(tokens);

let ast;
try {
    ast = astGenerator.parse()
} catch (error) {
    console.error(error);
    console.log('at', astGenerator.position, tokens.map((a, i) => i == astGenerator.position ? `${a.type}(${a.value}) <--` : `${a.type}(${a.value})`).join('\n'))
    Deno.exit(1)
}

console.log(ast)

const compiler = new Compiler(ast);

for (const node of compiler.AST) {
    compiler.compile(node)
}

Deno.writeTextFileSync('ast.json', JSON.stringify(ast, null, 4))
Deno.writeTextFileSync('code.txt', compiler.instructions.map(i => `${i.opcode}${i.args.length > 0 ? ' ' : ''}${i.args.join(',')}`).join('\n'))