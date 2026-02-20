import { fireEvent, render, screen } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

describe('SessionRecorderScreen exercise interactions', () => {
  it('adds a preset exercise and updates editable fields', () => {
    render(<SessionRecorderScreen />);

    expect(screen.getByText('Exercises: 0')).toBeTruthy();
    expect(screen.getByText('Sets: 0')).toBeTruthy();

    fireEvent.press(screen.getByText('Barbell Squat'));

    expect(screen.getByText('Exercises: 1')).toBeTruthy();
    expect(screen.getByText('Sets: 1')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Exercise name 1'), 'Barbell Back Squat');
    fireEvent.changeText(screen.getByLabelText('Machine for exercise 1'), 'Power Rack');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');

    expect(screen.getByDisplayValue('Barbell Back Squat')).toBeTruthy();
    expect(screen.getByDisplayValue('Power Rack')).toBeTruthy();
    expect(screen.getByDisplayValue('5')).toBeTruthy();
    expect(screen.getByDisplayValue('225')).toBeTruthy();
  });

  it('supports manual add and set add/remove interactions', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Add manual exercise'));
    expect(screen.getByText('Exercises: 1')).toBeTruthy();
    expect(screen.getByText('Sets: 1')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Exercise name 1'), 'Cable Row');
    fireEvent.press(screen.getByLabelText('Add set to exercise 1'));
    expect(screen.getByText('Sets: 2')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 2'), '10');
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 2'), '70');

    fireEvent.press(screen.getByLabelText('Remove set 1 from exercise 1'));
    expect(screen.getByText('Sets: 1')).toBeTruthy();
    expect(screen.getByDisplayValue('10')).toBeTruthy();
    expect(screen.getByDisplayValue('70')).toBeTruthy();
  });

  it('removes an exercise and updates nested set totals', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Barbell Squat'));
    fireEvent.press(screen.getByText('Bench Press'));

    expect(screen.getByText('Exercises: 2')).toBeTruthy();
    expect(screen.getByText('Sets: 2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Remove exercise 2'));

    expect(screen.getByText('Exercises: 1')).toBeTruthy();
    expect(screen.getByText('Sets: 1')).toBeTruthy();
    expect(screen.queryByDisplayValue('Bench Press')).toBeNull();
  });
});
