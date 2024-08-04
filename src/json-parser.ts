enum TokenType {
    LeftBrace,
    RightBrace,
    Colon,
    Comma,
    String,
    EOF
}

class Token {
    constructor(public type: TokenType, public value?: string) { }
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
            case ':':
                return new Token(TokenType.Colon);
            case ',':
                return new Token(TokenType.Comma);
            case '"':
                return this.scanString();
            default:
                throw new Error(`Unexpected character: ${char}`);
        }
    }

    private scanString(): Token {
        let value = '';

        while (this.position < this.input.length && this.input[this.position] !== '"') {
            value += this.input[this.position];
            this.position++;
        }

        if (this.input[this.position] !== '"') {
            throw new Error('Unterminated string');
        }

        this.position++; // Skip closing quote
        return new Token(TokenType.String, value);
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

    parse(): boolean {
        try {
            return this.parseObject() && this.expectEOF();
        } catch (error) {
            console.error("Parsing error:", error);
            return false;
        }
    }

    private parseObject(): boolean {
        if (!this.expect(TokenType.LeftBrace)) {
            return false;
        }

        // Empty object
        if (this.currentToken.type === TokenType.RightBrace) {
            this.advance();
            return true;
        }

        // Object with key-value pair
        while (true) {
            if (!this.parseKeyValuePair()) {
                return false;
            }

            if (this.currentToken.type === TokenType.RightBrace as TokenType) {
                break;
            }

            if (!this.expect(TokenType.Comma)) {
                return false;
            }
        }

        if (!this.expect(TokenType.RightBrace)) {
            return false;
        }

        return true;
    }

    private parseKeyValuePair(): boolean {
        if (!this.expect(TokenType.String)) {
            return false;
        }

        if (!this.expect(TokenType.Colon)) {
            return false;
        }

        if (!this.expect(TokenType.String)) {
            return false;
        }

        return true;
    }

    private expect(expectedType: TokenType): boolean {
        if (this.currentToken.type !== expectedType) {
            throw new Error(`Expected ${TokenType[expectedType]}, but got ${TokenType[this.currentToken.type]}`);
        }
        this.advance();
        return true;
    }

    private expectEOF(): boolean {
        return this.expect(TokenType.EOF);
    }

    private advance(): void {
        this.currentToken = this.lexer.nextToken();
    }
}

function parseJSON(input: string): boolean {
    const parser = new Parser(input);
    return parser.parse();
}

function main(input: string): void {
    try {
        const isValid = parseJSON(input);

        if (isValid) {
            console.log("Valid JSON");
            process.exit(0);
        } else {
            console.log("Invalid JSON");
            process.exit(1);
        }
    } catch (error) {
        console.log("Error parsing JSON: ", error);
    }
}

if (require.main === module) {
    const input = process.argv[2] || '{}';
    main(input);
}

export { parseJSON, main };