import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import './App.css'

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface PlayingCard {
  suit: Suit;
  rank: Rank;
}

const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = (): PlayingCard[] => {
  return suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
};

const calculateHandValue = (hand: PlayingCard[]): number => {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (['J', 'Q', 'K'].includes(card.rank)) {
      value += 10;
    } else if (card.rank === 'A') {
      aces += 1;
    } else {
      value += parseInt(card.rank);
    }
  }
  
  for (let i = 0; i < aces; i++) {
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
  }
  
  return value;
};

const BlackjackGame: React.FC = () => {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameStatus, setGameStatus] = useState<string>('');

  const startNewGame = useCallback(() => {
    const newDeck = createDeck();
    shuffleArray(newDeck);
    setDeck(newDeck);
    setPlayerHand([newDeck.pop()!, newDeck.pop()!]);
    setDealerHand([newDeck.pop()!, newDeck.pop()!]);
    setGameStatus('');
  }, []);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const hit = () => {
    if (gameStatus) return;
    const newPlayerHand = [...playerHand, deck.pop()!];
    setPlayerHand(newPlayerHand);
    setDeck([...deck]);

    if (calculateHandValue(newPlayerHand) > 21) {
      setGameStatus('Player busts! Dealer wins.');
    }
  };

  const stand = () => {
    if (gameStatus) return;
    let newDealerHand = [...dealerHand];
    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(deck.pop()!);
    }
    setDealerHand(newDealerHand);
    setDeck([...deck]);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(newDealerHand);

    if (dealerValue > 21) {
      setGameStatus('Dealer busts! Player wins.');
    } else if (playerValue > dealerValue) {
      setGameStatus('Player wins!');
    } else if (playerValue < dealerValue) {
      setGameStatus('Dealer wins!');
    } else {
      setGameStatus("It's a tie!");
    }
  };

  const renderCard = (card: PlayingCard, hidden: boolean = false) => {
    if (hidden) {
      return (
        <div className="card hidden">
          <div className="card-back" />
        </div>
      );
    }

    const getSuitIcon = (suit: Suit) => {
      switch (suit) {
        case 'Hearts': return <Heart size={24} color="red" />;
        case 'Diamonds': return <Diamond size={24} color="red" />;
        case 'Clubs': return <Club size={24} color="black" />;
        case 'Spades': return <Spade size={24} color="black" />;
      }
    };

    const getColor = (suit: Suit) => {
      return suit === 'Hearts' || suit === 'Diamonds' ? 'red' : 'black';
    };

    return (
      <div className={`card ${card.suit.toLowerCase()}`}>
        <div className={`card-value ${getColor(card.suit)}`}>{card.rank}</div>
        <div className="card-suit">{getSuitIcon(card.suit)}</div>
      </div>
    );
  };

  return (
    <div className="blackjack-game">
      <h1 style={{ textAlign: 'center' }}>Blackjack</h1>
      <div className="hands">
        <div className="dealer-hand">
          <h2>Dealer's Hand ({gameStatus ? calculateHandValue(dealerHand) : '?'})</h2>
          <div className="cards">
            {dealerHand.map((card, index) => renderCard(card, index === 1 && !gameStatus))}
          </div>
        </div>
        <div className="player-hand">
          <h2>Your Hand ({calculateHandValue(playerHand)})</h2>
          <div className="cards">
            {playerHand.map(card => renderCard(card))}
          </div>
        </div>
      </div>
      <div className="controls">
        <button onClick={hit} disabled={!!gameStatus}>Hit</button>
        <button onClick={stand} disabled={!!gameStatus}>Stand</button>
        <button onClick={startNewGame}>New Game</button>
      </div>
      {gameStatus && <div className="game-status">{gameStatus}</div>}
    </div>
  );
};

export default BlackjackGame;