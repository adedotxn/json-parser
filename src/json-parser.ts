enum TokenType {
    LeftBrace,
    RightBrace,
    EOF
}

class Token {
    constructor(public type: TokenType) {

    }
}


class Lexer {
    private input: string;
    private position: number = 0;

    constructor(input: string) {
        this.input = input;
    }



    nextToken(): Token {
        this.skipWhitespace();

        if (this.isAtEnd()) {
            return new Token(TokenType.EOF);
        }

        return this.scanToken();
    }

    private scanToken(): Token {
        const char = this.input[this.position];
        this.position++;

        switch (char) {
            case '{':
                return new Token(TokenType.LeftBrace);
            case '}':
                return new Token(TokenType.RightBrace);
            default:
                throw new Error(`Unexpected character: ${char}`);
        }
    }

    private skipWhitespace(): void {
        while (
            this.position < this.input.length &&
            /\s/.test(this.input[this.position])
        ) {
            this.position++;
        }
    }

    private isAtEnd(): boolean {
        return this.position >= this.input.length;
    }
}

class Parser {
    private lexer: Lexer;
    private currentToken: Token;

    constructor(input: string) {
        this.lexer = new Lexer(input);
        this.currentToken = this.lexer.nextToken();
    }

    parse() {
        if (this.currentToken.type !== TokenType.LeftBrace) {
            return false
        }

        this.currentToken = this.lexer.nextToken();

        if (this.currentToken.type !== TokenType.RightBrace) {
            return false
        }

        this.currentToken = this.lexer.nextToken();

        return this.currentToken.type === TokenType.EOF;
    }
}

function parseJSON(input: string): boolean {
    const parser = new Parser(input);
    return parser.parse();
}


function main(input: string): void {
    try {
        const isValid = parseJSON(input)

        if (isValid) {
            console.log("Valid JSON");
            process.exit(0)
        } else {
            console.log("Invalid JSON");
            process.exit(1)
        }
    } catch (error) {
        console.log("Error parsinng JSON: ", error);
    }

}



if (require.main === module) {
    const input = process.argv[2] || '{}';
    main(input);
}

export { parseJSON, main }
