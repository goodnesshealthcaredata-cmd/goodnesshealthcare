// ============================================================
//  CALCULATOR.JS - Complete Calculator Logic
// ============================================================

// Calculator state
const calculatorState = {
  // The current number being typed
  currentInput: '0',
  // The first operand (for binary operations)
  firstOperand: null,
  // The operator waiting for a second operand
  waitingOperator: null,
  // The expression string for display
  expression: '',
  // Whether we just calculated a result
  justCalculated: false,
  // The target form ID for applying the result
  targetFormId: null,
  // The target field ID for applying the result
  targetFieldId: 'paymentGoodwill', // Changed to Goodwill by default
  // The last result for repeated equals
  lastResult: null,
  // The last operator used for repeated equals
  lastOperator: null,
  // The last operand used for repeated equals
  lastOperand: null
};

// Helper function to format numbers for display
function formatCalculatorNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  // Handle integer display
  if (Number.isInteger(num)) {
    return num.toString();
  }
  // Limit decimal places to avoid floating point noise
  return parseFloat(num.toFixed(10)).toString();
}

// Reset calculator to initial state
function resetCalculator() {
  calculatorState.currentInput = '0';
  calculatorState.firstOperand = null;
  calculatorState.waitingOperator = null;
  calculatorState.expression = '';
  calculatorState.justCalculated = false;
  calculatorState.lastResult = null;
  calculatorState.lastOperator = null;
  calculatorState.lastOperand = null;
  updateCalculatorDisplay();
  updateApplyButton();
}

// Update the apply button state
function updateApplyButton() {
  const applyBtn = document.getElementById('calculatorApply');
  if (applyBtn) {
    const hasResult = calculatorState.lastResult !== null || 
                     (calculatorState.firstOperand !== null && !calculatorState.waitingOperator);
    applyBtn.disabled = !hasResult;
  }
}

// Open calculator with target field info
function openCalculator(formId, fieldId) {
  // Reset calculator state to clean/empty
  resetCalculator();
  
  // Store target info - default to Goodwill if not specified
  calculatorState.targetFormId = formId;
  calculatorState.targetFieldId = fieldId || 'paymentGoodwill';

  const overlay = document.getElementById('calculatorOverlay');
  if (overlay) {
    overlay.classList.add('active');
    // Focus on calculator for keyboard input
    setTimeout(() => {
      document.getElementById('calculatorDisplay')?.focus();
    }, 100);
  }
  updateApplyButton();
}

// Close calculator
function closeCalculator() {
  const overlay = document.getElementById('calculatorOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
  // Clear target info
  calculatorState.targetFormId = null;
  // Don't clear targetFieldId so it persists
}

// Update calculator display
function updateCalculatorDisplay() {
  const display = document.getElementById('calculatorDisplay');
  if (display) {
    let text = calculatorState.expression || calculatorState.currentInput || '0';
    display.textContent = text;
  }
  updateApplyButton();
}

// Safe arithmetic evaluator (no eval or Function)
function safeEvaluate(expression) {
  // Tokenize the expression
  const tokens = [];
  let currentNumber = '';
  let i = 0;
  
  while (i < expression.length) {
    const char = expression[i];
    
    if (char === ' ') {
      i++;
      continue;
    }
    
    if (char === '+' || char === '-' || char === '*' || char === '/') {
      if (currentNumber) {
        tokens.push({ type: 'number', value: parseFloat(currentNumber) });
        currentNumber = '';
      }
      tokens.push({ type: 'operator', value: char });
      i++;
      continue;
    }
    
    if (char === '%') {
      // Percentage: apply to the previous number
      if (currentNumber) {
        const num = parseFloat(currentNumber);
        tokens.push({ type: 'number', value: num / 100 });
        currentNumber = '';
      } else if (tokens.length > 0 && tokens[tokens.length - 1].type === 'number') {
        // Apply to the last number token
        const lastNum = tokens.pop();
        tokens.push({ type: 'number', value: lastNum.value / 100 });
      }
      i++;
      continue;
    }
    
    if (char === '.' || (char >= '0' && char <= '9')) {
      currentNumber += char;
      i++;
      continue;
    }
    
    // Invalid character
    throw new Error('Invalid character in expression');
  }
  
  if (currentNumber) {
    tokens.push({ type: 'number', value: parseFloat(currentNumber) });
  }
  
  if (tokens.length === 0) {
    throw new Error('Empty expression');
  }
  
  // Evaluate with proper precedence
  // First pass: handle * and /
  let processed = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'operator' && (token.value === '*' || token.value === '/')) {
      // Get the previous number
      const left = processed.pop();
      const right = tokens[i + 1];
      if (!left || !right || right.type !== 'number') {
        throw new Error('Invalid expression');
      }
      let result;
      if (token.value === '*') {
        result = left.value * right.value;
      } else {
        if (right.value === 0) {
          throw new Error('Division by zero');
        }
        result = left.value / right.value;
      }
      processed.push({ type: 'number', value: result });
      i++; // Skip the right operand
    } else {
      processed.push(token);
    }
  }
  
  // Second pass: handle + and -
  let result = null;
  let currentOperator = null;
  
  for (const token of processed) {
    if (token.type === 'number') {
      if (result === null) {
        result = token.value;
      } else if (currentOperator) {
        if (currentOperator === '+') {
          result += token.value;
        } else if (currentOperator === '-') {
          result -= token.value;
        }
        currentOperator = null;
      }
    } else if (token.type === 'operator') {
      currentOperator = token.value;
    }
  }
  
  if (result === null) {
    throw new Error('No result');
  }
  
  return result;
}

// Helper to get display operator
function getDisplayOperator(op) {
  const map = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷'
  };
  return map[op] || op;
}

// Main calculator input handler
function handleCalculatorInput(value) {
  // If we just calculated a result and user presses a number, start fresh
  if (calculatorState.justCalculated) {
    if (/^[0-9.]$/.test(value)) {
      // Start new calculation with this digit
      calculatorState.currentInput = value;
      calculatorState.expression = value;
      calculatorState.firstOperand = null;
      calculatorState.waitingOperator = null;
      calculatorState.justCalculated = false;
      calculatorState.lastResult = null;
      calculatorState.lastOperator = null;
      calculatorState.lastOperand = null;
      updateCalculatorDisplay();
      return;
    }
    // If user presses operator after result, continue from result
    if (['+', '-', '*', '/'].includes(value)) {
      const result = calculatorState.lastResult || parseFloat(calculatorState.currentInput);
      calculatorState.firstOperand = result;
      calculatorState.waitingOperator = value;
      calculatorState.currentInput = '0';
      calculatorState.expression = formatCalculatorNumber(result) + ' ' + getDisplayOperator(value) + ' ';
      calculatorState.justCalculated = false;
      updateCalculatorDisplay();
      return;
    }
  }

  // Handle clear
  if (value === 'clear') {
    resetCalculator();
    return;
  }

  // Handle backspace
  if (value === 'backspace') {
    // If we just calculated, backspace resets
    if (calculatorState.justCalculated) {
      resetCalculator();
      return;
    }
    
    // If we have an expression ending with operator, remove the operator
    if (calculatorState.expression && /[\+\-\*\/]\s*$/.test(calculatorState.expression)) {
      calculatorState.expression = calculatorState.expression.replace(/[\+\-\*\/]\s*$/, '');
      calculatorState.waitingOperator = null;
      updateCalculatorDisplay();
      return;
    }
    
    // If current input has more than 1 character, remove last character
    if (calculatorState.currentInput.length > 1) {
      calculatorState.currentInput = calculatorState.currentInput.slice(0, -1);
      // Update expression
      if (calculatorState.expression) {
        // Remove last character from expression (last number)
        const parts = calculatorState.expression.split(/\s+/);
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          if (!isNaN(parseFloat(lastPart)) && !lastPart.includes('+') && !lastPart.includes('-') && 
              !lastPart.includes('*') && !lastPart.includes('/')) {
            parts[parts.length - 1] = calculatorState.currentInput || '0';
            calculatorState.expression = parts.join(' ');
          }
        }
      }
      updateCalculatorDisplay();
      return;
    }
    
    // Reset current input to '0'
    calculatorState.currentInput = '0';
    // Update expression
    if (calculatorState.expression) {
      const parts = calculatorState.expression.split(/\s+/);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (!isNaN(parseFloat(lastPart)) && !lastPart.includes('+') && !lastPart.includes('-') && 
            !lastPart.includes('*') && !lastPart.includes('/')) {
          parts[parts.length - 1] = '0';
          calculatorState.expression = parts.join(' ');
        }
      }
    }
    updateCalculatorDisplay();
    return;
  }

  // Handle equals
  if (value === '=') {
    if (!calculatorState.waitingOperator && calculatorState.firstOperand === null) {
      // No operation to perform, just show current input
      return;
    }
    
    try {
      let result;
      const currentValue = parseFloat(calculatorState.currentInput);
      
      // If we have a waiting operator, perform the calculation
      if (calculatorState.waitingOperator && calculatorState.firstOperand !== null) {
        const op = calculatorState.waitingOperator;
        const first = calculatorState.firstOperand;
        
        // Store for repeated equals
        calculatorState.lastOperator = op;
        calculatorState.lastOperand = currentValue;
        
        switch (op) {
          case '+':
            result = first + currentValue;
            break;
          case '-':
            result = first - currentValue;
            break;
          case '*':
            result = first * currentValue;
            break;
          case '/':
            if (currentValue === 0) {
              throw new Error('Division by zero');
            }
            result = first / currentValue;
            break;
          default:
            throw new Error('Unknown operator');
        }
        
        // Round to avoid floating point issues
        result = parseFloat(result.toFixed(10));
        
        calculatorState.lastResult = result;
        calculatorState.currentInput = formatCalculatorNumber(result);
        calculatorState.expression = formatCalculatorNumber(first) + ' ' + getDisplayOperator(op) + ' ' + 
                                     formatCalculatorNumber(currentValue) + ' = ' + formatCalculatorNumber(result);
        calculatorState.firstOperand = result;
        calculatorState.waitingOperator = null;
        calculatorState.justCalculated = true;
        
        updateCalculatorDisplay();
        return;
      }
      
      // If we have just calculated and press equals again, repeat last operation
      if (calculatorState.justCalculated && calculatorState.lastOperator && calculatorState.lastOperand !== null) {
        const op = calculatorState.lastOperator;
        const current = parseFloat(calculatorState.currentInput);
        const operand = calculatorState.lastOperand;
        
        let newResult;
        switch (op) {
          case '+':
            newResult = current + operand;
            break;
          case '-':
            newResult = current - operand;
            break;
          case '*':
            newResult = current * operand;
            break;
          case '/':
            if (operand === 0) {
              throw new Error('Division by zero');
            }
            newResult = current / operand;
            break;
          default:
            throw new Error('Unknown operator');
        }
        
        newResult = parseFloat(newResult.toFixed(10));
        calculatorState.lastResult = newResult;
        calculatorState.currentInput = formatCalculatorNumber(newResult);
        calculatorState.expression = formatCalculatorNumber(current) + ' ' + getDisplayOperator(op) + ' ' + 
                                     formatCalculatorNumber(operand) + ' = ' + formatCalculatorNumber(newResult);
        calculatorState.firstOperand = newResult;
        calculatorState.justCalculated = true;
        
        updateCalculatorDisplay();
        return;
      }
      
    } catch (e) {
      // Show error
      calculatorState.expression = 'Error';
      calculatorState.currentInput = 'Error';
      updateCalculatorDisplay();
      // Reset after a moment
      setTimeout(() => {
        if (calculatorState.expression === 'Error') {
          resetCalculator();
        }
      }, 1500);
    }
    return;
  }

  // Handle operators
  if (['+', '-', '*', '/'].includes(value)) {
    // If we just calculated, use the result as first operand
    if (calculatorState.justCalculated) {
      const result = calculatorState.lastResult || parseFloat(calculatorState.currentInput);
      calculatorState.firstOperand = result;
      calculatorState.waitingOperator = value;
      calculatorState.currentInput = '0';
      calculatorState.expression = formatCalculatorNumber(result) + ' ' + getDisplayOperator(value) + ' ';
      calculatorState.justCalculated = false;
      updateCalculatorDisplay();
      return;
    }
    
    // If we have a waiting operator, replace it
    if (calculatorState.waitingOperator && calculatorState.firstOperand !== null) {
      // Replace the operator
      calculatorState.waitingOperator = value;
      const parts = calculatorState.expression.split(/\s+/);
      if (parts.length >= 2) {
        parts[parts.length - 1] = getDisplayOperator(value);
        calculatorState.expression = parts.join(' ');
      }
      updateCalculatorDisplay();
      return;
    }
    
    // If we have a first operand but no operator, set operator
    if (calculatorState.firstOperand !== null && !calculatorState.waitingOperator) {
      calculatorState.waitingOperator = value;
      calculatorState.expression = formatCalculatorNumber(calculatorState.firstOperand) + ' ' + getDisplayOperator(value) + ' ';
      updateCalculatorDisplay();
      return;
    }
    
    // Start new operation with current input
    const currentValue = parseFloat(calculatorState.currentInput);
    calculatorState.firstOperand = currentValue;
    calculatorState.waitingOperator = value;
    calculatorState.currentInput = '0';
    calculatorState.expression = formatCalculatorNumber(currentValue) + ' ' + getDisplayOperator(value) + ' ';
    updateCalculatorDisplay();
    return;
  }

  // Handle percentage
  if (value === '%') {
    // If we have an expression with an operator, apply percentage to the second operand
    if (calculatorState.waitingOperator && calculatorState.firstOperand !== null) {
      const currentValue = parseFloat(calculatorState.currentInput);
      // Apply percentage as: currentValue% of firstOperand
      const result = (calculatorState.firstOperand * currentValue) / 100;
      calculatorState.currentInput = formatCalculatorNumber(result);
      calculatorState.expression = formatCalculatorNumber(calculatorState.firstOperand) + ' ' + 
                                   getDisplayOperator(calculatorState.waitingOperator) + ' ' + 
                                   formatCalculatorNumber(currentValue) + '% = ' + formatCalculatorNumber(result);
      calculatorState.firstOperand = null;
      calculatorState.waitingOperator = null;
      calculatorState.justCalculated = true;
      calculatorState.lastResult = result;
      updateCalculatorDisplay();
      return;
    }
    
    // Simple percentage: number% = number/100
    const currentValue = parseFloat(calculatorState.currentInput);
    const result = currentValue / 100;
    calculatorState.currentInput = formatCalculatorNumber(result);
    calculatorState.expression = formatCalculatorNumber(currentValue) + '% = ' + formatCalculatorNumber(result);
    calculatorState.firstOperand = null;
    calculatorState.waitingOperator = null;
    calculatorState.justCalculated = true;
    calculatorState.lastResult = result;
    updateCalculatorDisplay();
    return;
  }

  // Handle numbers and decimal
  if (/^[0-9.]$/.test(value)) {
    // If we just calculated and type a number, start fresh
    if (calculatorState.justCalculated) {
      calculatorState.currentInput = value;
      calculatorState.expression = value;
      calculatorState.firstOperand = null;
      calculatorState.waitingOperator = null;
      calculatorState.justCalculated = false;
      calculatorState.lastResult = null;
      calculatorState.lastOperator = null;
      calculatorState.lastOperand = null;
      updateCalculatorDisplay();
      return;
    }

    // Prevent multiple decimal points in current input
    if (value === '.' && calculatorState.currentInput.includes('.')) {
      return;
    }

    // Replace '0' with the digit (except for decimal)
    if (calculatorState.currentInput === '0' && value !== '.') {
      calculatorState.currentInput = value;
    } else {
      calculatorState.currentInput += value;
    }

    // Update expression
    if (calculatorState.expression) {
      const parts = calculatorState.expression.split(/\s+/);
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        // Check if the last part is a number (not an operator or '=')
        if (!isNaN(parseFloat(lastPart)) && !lastPart.includes('+') && !lastPart.includes('-') && 
            !lastPart.includes('*') && !lastPart.includes('/') && !lastPart.includes('=')) {
          parts[parts.length - 1] = calculatorState.currentInput;
          calculatorState.expression = parts.join(' ');
        } else {
          // If we have an operator, append the number
          if (calculatorState.waitingOperator) {
            const base = parts.slice(0, -1).join(' ');
            calculatorState.expression = base + ' ' + calculatorState.currentInput;
          } else {
            calculatorState.expression = calculatorState.currentInput;
          }
        }
      } else {
        calculatorState.expression = calculatorState.currentInput;
      }
    } else {
      calculatorState.expression = calculatorState.currentInput;
    }

    updateCalculatorDisplay();
  }
}

// Apply calculator result to the target field (Goodwill Charges)
function applyCalculatorResult() {
  const applyBtn = document.getElementById('calculatorApply');
  if (applyBtn.disabled) {
    if (typeof toast === 'function') {
      toast('No result to apply.', 'error');
    } else {
      console.error('No result to apply.');
    }
    return;
  }

  const formId = calculatorState.targetFormId;
  const fieldId = calculatorState.targetFieldId || 'paymentGoodwill';
  
  if (!formId) {
    if (typeof toast === 'function') {
      toast('No target form selected.', 'error');
    }
    return;
  }

  let result;
  if (calculatorState.lastResult !== null) {
    result = calculatorState.lastResult;
  } else if (calculatorState.firstOperand !== null && !calculatorState.waitingOperator) {
    result = calculatorState.firstOperand;
  } else {
    if (typeof toast === 'function') {
      toast('No valid result to apply.', 'error');
    }
    return;
  }

  // Find the target input field (Goodwill Charges)
  const targetField = document.getElementById(`${fieldId}-${formId}`);
  if (!targetField) {
    if (typeof toast === 'function') {
      toast('Goodwill Charges field not found.', 'error');
    }
    return;
  }

  // Apply the result
  targetField.value = result.toString();
  
  // Trigger input event to update calculations
  const event = new Event('input', { bubbles: true });
  targetField.dispatchEvent(event);
  
  // Trigger blur to format
  targetField.dispatchEvent(new Event('blur', { bubbles: true }));

  // Update payment fields
  if (typeof updatePaymentFields === 'function') {
    updatePaymentFields(formId);
  }

  if (typeof toast === 'function') {
    toast('Result applied to Goodwill Charges!', 'success');
  }
  closeCalculator();
}

// Keyboard support
document.addEventListener('keydown', function(e) {
  const overlay = document.getElementById('calculatorOverlay');
  if (!overlay || !overlay.classList.contains('active')) return;

  const key = e.key;

  // Prevent calculator keys from affecting the form
  e.preventDefault();
  e.stopPropagation();

  if (key === 'Escape') {
    closeCalculator();
    return;
  }

  if (key === 'Enter') {
    handleCalculatorInput('=');
    return;
  }

  if (key === 'Backspace') {
    handleCalculatorInput('backspace');
    return;
  }

  if (/^[0-9.]$/.test(key)) {
    handleCalculatorInput(key);
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    handleCalculatorInput(key);
    return;
  }
});

// Make functions globally accessible
window.openCalculator = openCalculator;
window.closeCalculator = closeCalculator;
window.applyCalculatorResult = applyCalculatorResult;
window.handleCalculatorInput = handleCalculatorInput;
window.resetCalculator = resetCalculator;
