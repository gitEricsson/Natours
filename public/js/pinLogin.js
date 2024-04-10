export default class SigninTokenFunctionality {
  // Get pin container
  pinContainer = document.querySelector('#pin-input');

  pinValueContainer = document.querySelector('#pin-value');

  submitButton = document.querySelector('#submit');

  firstInput = this.pinContainer.querySelector('input');

  inputs = this.pinContainer.querySelectorAll('input:not(#pin-value)');

  constructor() {
    // Focus first input
    this.firstInput.focus();

    this.inputs.forEach((input, index) => {
      input.addEventListener('input', e => {
        this.handleInput(input, e.target.value, index, this.inputs);
      });

      input.addEventListener('keydown', e =>
        this.handleKeyDown(e, e.key, input, index, this.inputs)
      );

      input.addEventListener('keyup', e =>
        this.handleKeyUp(e, e.key, input, index, this.inputs)
      );

      input.addEventListener('focus', e => e.target.select());
    });
  }

  getValue() {
    this.updateValue(this.inputs);
    return this.pinValueContainer.value;
  }

  updateValue = inputs => {
    this.pinValueContainer.value = Array.from(inputs).reduce(
      (acc, curInput) => acc.concat(curInput.value ? curInput.value : '*'),
      ''
    );
  };

  isValidInput = inputValue => {
    return Number(inputValue) === 0 && inputValue !== '0' ? false : true;
  };

  setInputValue = (inputElement, inputValue) => {
    inputElement.value = inputValue;
  };

  resetInput = inputElement => {
    this.setInputValue(inputElement, '');
  };

  focusNext = (inputs, curIndex) => {
    const nextElement =
      curIndex < inputs.length - 1 ? inputs[curIndex + 1] : inputs[curIndex];

    nextElement.focus();
    nextElement.select();
  };

  focusPrev = (inputs, curIndex) => {
    const prevElement = curIndex > 0 ? inputs[curIndex - 1] : inputs[curIndex];

    prevElement.focus();
    prevElement.select();
  };

  focusIndex = (inputs, index) => {
    const element =
      index < inputs.length - 1 ? inputs[index] : inputs[inputs.length - 1];

    element.focus();
    element.select();
  };

  handleValidMultiInput = (inputElement, inputValue, curIndex, inputs) => {
    const inputLength = inputValue.length;
    const numInputs = inputs.length;

    const endIndex = Math.min(curIndex + inputLength - 1, numInputs - 1);
    const inputsToChange = Array.from(inputs).slice(curIndex, endIndex + 1);

    inputsToChange.forEach((input, index) =>
      this.setInputValue(input, inputValue[index])
    );
    this.focusIndex(inputs, endIndex);
  };

  handleInput = (inputElement, inputValue, curIndex, inputs) => {
    if (!this.isValidInput(inputValue))
      return this.handleInvalidInput(inputElement);

    if (inputValue.length === 1) {
      this.handleValidSingleInput(inputElement, inputValue, curIndex, inputs);
    } else
      this.handleValidMultiInput(inputElement, inputValue, curIndex, inputs);
  };

  handleValidSingleInput = (inputElement, inputValue, curIndex, inputs) => {
    this.setInputValue(inputElement, inputValue.slice(-1));
    this.focusNext(inputs, curIndex);
  };

  handleInvalidInput = inputElement => {
    this.resetInput(inputElement);
  };

  handleKeyDown = (e, key, inputElement, curIndex, inputs) => {
    if (key === 'Delete') {
      this.resetInput(inputElement);
      this.focusPrev(inputs, curIndex);
    }
    if (key === 'ArrowLeft') {
      e.preventDefault();
      this.focusPrev(inputs, curIndex);
    }
    if (key === 'ArrowRight') {
      e.preventDefault();
      this.focusNext(inputs, curIndex);
    }
  };

  handleKeyUp = (event, key, inputElement, curIndex, inputs) => {
    if (key === 'Backspace') this.focusPrev(inputs, curIndex);
  };
}
