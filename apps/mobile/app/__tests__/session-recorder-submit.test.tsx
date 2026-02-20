import { fireEvent, render, screen } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

describe('SessionRecorderScreen submit cleanup flow', () => {
  it('allows submit without gym selection', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');
    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.getByText('Session submitted (UI only)')).toBeTruthy();
    expect(screen.getByText('Gym: Not set')).toBeTruthy();
  });

  it('shows incomplete-set modal with go-back and remove-and-submit actions', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Choose gym'));
    fireEvent.press(screen.getByLabelText('Select gym Westside Barbell Club'));
    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');
    fireEvent.press(screen.getByLabelText('Add set to exercise 1'));
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 2'), '205');

    fireEvent.press(screen.getByText('Submit Session'));
    expect(screen.getByText('Remove incomplete sets and submit?')).toBeTruthy();

    fireEvent.press(screen.getByText('Go back to edit session'));
    expect(screen.queryByText('Remove incomplete sets and submit?')).toBeNull();
    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();

    fireEvent.press(screen.getByText('Submit Session'));
    fireEvent.press(screen.getByText('Remove incomplete sets and submit'));

    expect(screen.getByText('Session submitted (UI only)')).toBeTruthy();
    expect(screen.getByText('Exercises: 1')).toBeTruthy();
    expect(screen.getByText('Sets: 1')).toBeTruthy();
  });

  it('shows empty-exercise modal and can submit with empty exercises removed', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Bench Press'));
    fireEvent.press(screen.getByLabelText('Remove set 1 from exercise 1'));
    fireEvent.press(screen.getByText('Submit Session'));

    expect(screen.getByText('Remove exercises with no sets and submit?')).toBeTruthy();
    fireEvent.press(screen.getByText('Remove empty exercises and submit'));

    expect(screen.getByText('Session submitted (UI only)')).toBeTruthy();
    expect(screen.getByText('Exercises: 0')).toBeTruthy();
    expect(screen.getByText('Sets: 0')).toBeTruthy();

    fireEvent.press(screen.getByText('Start new entry'));

    expect(screen.queryByText('Session submitted (UI only)')).toBeNull();
    expect(screen.getByText('Choose gym')).toBeTruthy();
    expect(screen.getByText('No exercises logged yet.')).toBeTruthy();
  });
});
