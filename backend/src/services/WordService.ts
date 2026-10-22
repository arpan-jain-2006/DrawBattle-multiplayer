import wordData from '../data/words.json';

export class WordService {
  private allWords: string[] = [];

  constructor() {
    const categories = Object.values(wordData) as string[][];
    this.allWords = categories.flat().map(w => w.trim().toLowerCase());
  }

  /**
   * Returns a list of random distinct word choices for the drawer.
   */
  public getRandomChoices(count: number = 3, customWords: string[] = []): string[] {
    const sanitizedCustom = customWords
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 1);

    const pool = sanitizedCustom.length > 0
      ? Array.from(new Set([...sanitizedCustom, ...this.allWords]))
      : this.allWords;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Generates masked representation of word (e.g. "_ _ _ _" or "_ A _ _")
   */
  public getMaskedWord(word: string, revealedIndices: Set<number>): string {
    return word
      .split('')
      .map((char, index) => {
        if (char === ' ') return '  ';
        if (char === '-' || char === '\'') return char;
        if (revealedIndices.has(index)) return char.toUpperCase();
        return '_';
      })
      .join(' ');
  }

  /**
   * Levenshtein distance for close guess detection
   */
  public isCloseGuess(guess: string, target: string): boolean {
    const a = guess.trim().toLowerCase();
    const b = target.trim().toLowerCase();
    if (Math.abs(a.length - b.length) > 2) return false;

    const distance = this.levenshtein(a, b);
    return distance === 1 && a.length > 2;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export const wordService = new WordService();
