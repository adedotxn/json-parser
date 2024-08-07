import process from "node:process";

enum TokenType {
    LeftBrace,
    RightBrace,
    LeftBracket,
    RightBracket,
    Colon,
    Comma,
    String,
    True,
    False,
    Null,
    Number,
    EOF
}

class Token {
    constructor(public type: TokenType, public value?: string | number | boolean | null) { }
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
            case '[':
                return new Token(TokenType.LeftBracket);
            case ']':
                return new Token(TokenType.RightBracket);
            case '"':
                return this.scanString();
            default:
                if (this.isDigit(char)) {
                    return this.scanNumber();
                } else if (this.isAlpha(char)) {
                    return this.scanKeyword(char);
                } else {
                    throw new Error(`Unexpected character: ${char}`);
                }
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



    private scanNumber(): Token {
        let value = '';
        let hasDot = false;

        if (this.input[this.position - 1] === '-') {
            value = '-';
        } else {
            this.position--;
        }

        while (this.position < this.input.length) {
            const char = this.input[this.position];
            if (this.isDigit(char)) {
                value += char;
            } else if (char === '.' && !hasDot) {
                value += char;
                hasDot = true;
            } else {
                break;
            }
            this.position++;
        }

        if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) {
            throw new Error(`Invalid number format: ${value}`);
        }

        return new Token(TokenType.Number, parseFloat(value));
    }

    private scanKeyword(startingChar: string): Token {
        let value = startingChar;

        while (this.position < this.input.length && this.isAlpha(this.input[this.position])) {
            value += this.input[this.position];
            this.position++;
        }

        switch (value) {
            case 'true':
                return new Token(TokenType.True);
            case 'false':
                return new Token(TokenType.False);
            case 'null':
                return new Token(TokenType.Null);
            default:
                throw new Error(`Unexpected keyword: ${value}`);
        }
    }

    private isDigit(char: string): boolean {
        return /\d/.test(char);
    }

    private isAlpha(char: string): boolean {
        return /[a-zA-Z]/.test(char);
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
            // Only allow objects or arrays at the root level
            if (this.currentToken.type === TokenType.LeftBrace) {
                return this.parseObject() && this.expectEOF();
            } else if (this.currentToken.type === TokenType.LeftBracket) {
                return this.parseArray() && this.expectEOF();
            } else {
                throw new Error("Root value must be an object or array");
            }
        } catch (error) {
            console.error("Parsing error:", error);
            return false;
        }
    }

    private parseInput(): boolean {
        switch (this.currentToken.type) {
            case TokenType.String:
            case TokenType.Number:
            case TokenType.True:
            case TokenType.False:
            case TokenType.Null:
                this.advance();
                return true;
            case TokenType.LeftBrace:
                return this.parseObject();
            case TokenType.LeftBracket:
                return this.parseArray();
            default:
                throw new Error(`Unexpected value type: ${TokenType[this.currentToken.type]}`);
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

    private parseArray(): boolean {
        if (!this.expect(TokenType.LeftBracket)) {
            return false;
        }

        // Empty array
        if (this.currentToken.type === TokenType.RightBracket) {
            this.advance();
            return true;
        }

        // Array with elements
        while (true) {
            if (!this.parseInput()) {
                return false;
            }

            if (this.currentToken.type === TokenType.RightBracket as TokenType) {
                break;
            }

            if (!this.expect(TokenType.Comma)) {
                return false;
            }
        }
        if (!this.expect(TokenType.RightBracket)) {
            return false;
        }

        return true
    }


    private parseKeyValuePair(): boolean {
        if (!this.expect(TokenType.String)) {
            return false;
        }

        if (!this.expect(TokenType.Colon)) {
            return false;
        }

        if (!this.parseInput()) {
            return false;
        }

        return true;
    }




    private expect(expectedType: TokenType): boolean {
        if (this.currentToken.type !== expectedType) {
            throw new Error(`Syntax error <unexpected type> : ${TokenType[this.currentToken.type]}`);
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