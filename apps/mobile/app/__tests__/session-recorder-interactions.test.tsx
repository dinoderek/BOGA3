import { fireEvent, render, screen } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

describe('SessionRecorderScreen exercise interactions', () => {
  it('adds a preset exercise from the log flow and updates first set fields', () => {
    render(<SessionRecorderScreen />);

    expect(screen.getByText('No exercises logged yet.')).toBeTruthy();

    fireEvent.press(screen.getByText('Log new exercise'));
    expect(screen.getByText('Select Exercise')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));

    expect(screen.queryByText('Select Exercise')).toBeNull();
    expect(screen.getByText('Barbell Squat')).toBeTruthy();
    expect(screen.queryByText('No exercises logged yet.')).toBeNull();

    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');
    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');

    expect(screen.getByDisplayValue('225')).toBeTruthy();
    expect(screen.getByDisplayValue('5')).toBeTruthy();
  });

  it('supports creating a new exercise from the modal and set add/remove interactions', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByText('Add new'));
    expect(screen.getByText('Add Exercise')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Exercise name'), 'Cable Row');
    fireEvent.press(screen.getByText('Add'));

    expect(screen.getByText('Cable Row')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Add set to exercise 1'));
    expect(screen.getByLabelText('Weight for exercise 1 set 2')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 2'), '10');
    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 2'), '70');

    fireEvent.press(screen.getByLabelText('Remove set 1 from exercise 1'));
    expect(screen.queryByLabelText('Weight for exercise 1 set 2')).toBeNull();
    expect(screen.getByLabelText('Weight for exercise 1 set 1')).toBeTruthy();
    expect(screen.getByDisplayValue('10')).toBeTruthy();
    expect(screen.getByDisplayValue('70')).toBeTruthy();
  });

  it('supports manage exercises edit/archive/filter/unarchive flow', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByText('Manage'));
    expect(screen.getByText('Manage Exercises')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Edit exercise Barbell Squat'));
    fireEvent.changeText(screen.getByDisplayValue('Barbell Squat'), 'High Bar Squat');
    fireEvent.press(screen.getByText('Save'));

    expect(screen.getByText('High Bar Squat')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Archive exercise High Bar Squat'));
    expect(screen.queryByText('High Bar Squat')).toBeNull();

    fireEvent.press(screen.getByText('Show archived'));
    expect(screen.getByText('High Bar Squat')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Unarchive exercise High Bar Squat'));
    fireEvent.press(screen.getByText('Hide archived'));
    fireEvent.press(screen.getByText('Back to picker'));
    expect(screen.getByText('Select Exercise')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Dismiss exercise modal overlay'));
    fireEvent.press(screen.getByText('Log new exercise'));
    expect(screen.getByLabelText('Select exercise High Bar Squat')).toBeTruthy();
  });

  it('removes an exercise and updates nested set totals', () => {
    render(<SessionRecorderScreen />);

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Bench Press'));

    expect(screen.getByLabelText('Exercise options 1')).toBeTruthy();
    expect(screen.getByLabelText('Exercise options 2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Exercise options 2'));
    expect(screen.getByLabelText('Change exercise')).toBeTruthy();
    fireEvent.press(screen.getByText('Change exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Deadlift'));
    expect(screen.getByText('Deadlift')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Exercise options 2'));
    fireEvent.press(screen.getByText('Remove exercise'));

    expect(screen.getByLabelText('Exercise options 1')).toBeTruthy();
    expect(screen.queryByLabelText('Exercise options 2')).toBeNull();
    expect(screen.queryByText('Deadlift')).toBeNull();
  });
});
