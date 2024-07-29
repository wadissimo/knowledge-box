class Card {
    constructor(id, frontText, backText) {
      this.id = id;
      this.frontText = frontText;
      this.backText = backText;
    }
  
    // Example method to toggle card text
    toggleText() {
      [this.frontText, this.backText] = [this.backText, this.frontText];
    }
  }

  export default Card;