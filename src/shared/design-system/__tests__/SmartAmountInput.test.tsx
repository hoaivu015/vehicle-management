import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartAmountInput } from '@/src/shared/design-system/SmartAmountInput';

// Mock numberToVietnameseText as it might be complex or non-deterministic in tests
vi.mock('@/src/shared/utils/currency', async () => {
  const actual = await vi.importActual('@/src/shared/utils/currency') as any;
  return {
    ...actual,
    numberToVietnameseText: (val: number) => `Text for ${val}`,
  };
});

describe('SmartAmountInput Component', () => {
  it('renders correctly with initial value', () => {
    render(<SmartAmountInput value={1000000} onChange={() => {}} label="Price" id="price-input" />);
    const input = screen.getByLabelText('Price') as HTMLInputElement;
    expect(input.value).toBe('1.000.000');
  });

  it('calls onChange with parsed number when typing', () => {
    const onChange = vi.fn();
    render(<SmartAmountInput value={0} onChange={onChange} label="Amount" id="amount-input" />);
    const input = screen.getByLabelText('Amount');
    
    // Type "1.5m" which should be parsed to 1,500,000
    fireEvent.change(input, { target: { value: '1.5m' } });
    
    // Note: The internal state updates immediately, and calls onChange
    expect(onChange).toHaveBeenCalledWith(1500000);
  });

  it('shows text preview on focus when value > 0', async () => {
    render(<SmartAmountInput value={5000000} onChange={() => {}} label="Amount" id="amount-input" />);
    const input = screen.getByLabelText('Amount');
    
    fireEvent.focus(input);
    
    // Wait for the preview to appear
    expect(await screen.findByText('5.000.000')).toBeDefined();
    
    // The Vietnamese text for 5,000,000 is "5 triệu"
    // We check for "triệu" to be safe regardless of mocking
    expect(await screen.findByText(/triệu|Text for/i)).toBeDefined();
  });

  it('clears input when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SmartAmountInput value={1000} onChange={onChange} label="Amount" id="amount-input" />);
    
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('formats input on blur', () => {
    render(<SmartAmountInput value={0} onChange={() => {}} label="Amount" id="amount-input" />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '1000000' } });
    fireEvent.blur(input);
    
    expect(input.value).toBe('1.000.000');
  });
});
