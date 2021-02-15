import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card } from '../Card';
import { Calculator } from '../Calculator';
import {
  CardActions,
  CalculationActions,
} from '../../state/actions';
import {
  isNumeric,
  isOperator,
  isParenthesisOpen,
  getRandomCard,
  isParenthesis,
} from '../../utils';
import { LOCAL_STORAGE_DIFFICULTY, PARENTHESIS, SYMBOLS } from '../../constants';
import './board.scss';
import { getUsedNumbers } from '../../state/selectors';

const ProtoBoard = ({
  card,
  usedNumbers,
  operation,
  difficulty,
  isReady,
  onSetCard,
  onAddSymbol,
  onSetReady,
  onResetOperation,
}) => {
  const CORRECT_RESULT = 24;
  const MAXIMUM_NUMBERS = 4;

  useEffect(() => {
    const storedDifficulty = localStorage.getItem(LOCAL_STORAGE_DIFFICULTY);
    const targetDifficulty = storedDifficulty ? parseInt(storedDifficulty, 10) : difficulty;

    onSetCard(getRandomCard(targetDifficulty));
  }, []);

  useEffect(() => {
    onSetReady(MAXIMUM_NUMBERS <= usedNumbers.length && !isParenthesisOpen(operation));
  }, [ operation, usedNumbers ]);

  const loadRandomCard = () => {
    onSetCard(getRandomCard(difficulty));
  };

  const handleNumberClick = (number, numberIndex) => {
    const [ lastSymbol ] = operation.slice(-1);

    // Return if to many numbers or symbol not possible
    if (
      MAXIMUM_NUMBERS <= usedNumbers.length ||
      isNumeric(lastSymbol) ||
      lastSymbol === PARENTHESIS.CLOSE
    ) {
      return;
    }

    onAddSymbol(number);

    const updatedNumbers = [ ...card.numbers ];
    updatedNumbers[numberIndex].active = false;

    onSetCard({ ...card, numbers: updatedNumbers });
  };

  const handleOperatorClick = (operator) => {
    // Return if used all numbers
    if (MAXIMUM_NUMBERS <= usedNumbers.length && operator !== SYMBOLS.PARENTHESIS) {
      return;
    }

    const [ lastSymbol ] = operation.slice(-1);

    if (typeof lastSymbol !== 'undefined' && (isNumeric(lastSymbol) || isParenthesis(lastSymbol))) {
      onAddSymbol(operator);
    }
  };

  const handleParenthesisClick = () => {
    const [ lastSymbol ] = operation.slice(-1);

    if (typeof lastSymbol === 'undefined' || isOperator(lastSymbol) || lastSymbol === PARENTHESIS.OPEN) {
      onAddSymbol(PARENTHESIS.OPEN);
    } else if (
      (isNumeric(lastSymbol) || isParenthesis(lastSymbol)) && isParenthesisOpen(operation)
    ) {
      onAddSymbol(PARENTHESIS.CLOSE);
    }
  };

  const reset = () => {
    loadRandomCard();
    onResetOperation();
  };

  const handleCalculatorClear = () => {
    const updatedNumbers = card.numbers.map((el) => ({ ...el, active: true }));

    onSetCard({ ...card, numbers: updatedNumbers });
    onResetOperation();
  };

  const handleFinish = (result) => {
    if (CORRECT_RESULT === result.value) {
      alert('Great! Your result is 24!');
    } else {
      alert(`Wrong, ${ result.solution } is not equal to 24! Go back to school!`);
    }

    reset();
  };

  return (
    <div className="board">
      <div>
        <Card
          card={ card }
          onCardReset={ reset }
          onNumberClick={ handleNumberClick }
        />
      </div>
      <div>
        <Calculator
          card={ card }
          operation={ operation }
          isReady={ isReady }
          onClear={ handleCalculatorClear }
          onFinish={ handleFinish }
          onNumberClick={ handleNumberClick }
          onOperatorClick={ handleOperatorClick }
          onParenthesisClick={ handleParenthesisClick }
        />
      </div>
    </div>
  );
};

ProtoBoard.propTypes = {
  card: PropTypes.instanceOf(Object).isRequired,
  isReady: PropTypes.bool.isRequired,
  usedNumbers: PropTypes.instanceOf(Array).isRequired,
  operation: PropTypes.instanceOf(Array).isRequired,
  difficulty: PropTypes.number.isRequired,
  onSetCard: PropTypes.func.isRequired,
  onAddSymbol: PropTypes.func.isRequired,
  onSetReady: PropTypes.func.isRequired,
  onResetOperation: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  card: state.card,
  isReady: state.isReady,
  usedNumbers: getUsedNumbers(state),
  operation: state.operation,
  difficulty: state.difficulty,
});

const mapDispatchToProps = {
  onSetCard: CardActions.setCard,
  onAddSymbol: CalculationActions.addSymbol,
  onSetReady: CalculationActions.setReady,
  onResetOperation: CalculationActions.resetOperation,
};

export const Board = connect(mapStateToProps, mapDispatchToProps)(ProtoBoard);
