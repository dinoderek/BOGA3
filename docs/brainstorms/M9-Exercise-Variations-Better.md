# Variations revisited

## In one sentence
Refine the experience of the exercise variations. 

## Let's go back to the use cases:
1. Multiple machine of the same type at a location. At a specific location, for a particular exercise that uses a machine, I have multiple nachines. I want to tag the specific machine when logging the exercise. For example I could have two differnet cable machines with different resistance profiles. 
1. Grip type. For example for lateral pulldown there are a number of differnet grip types (supinated, pronated, neutral) and widths (wide, narrow, medium) and I might want to log them. 
1. Implement. We *could* decide to use variations to represent the implement (dumbbell, barbell, kettlebell) used for the same exercise (i.e. Squat)
1. Incline. We *could* use to use variations to repesent inclines
1. Machine. We *could* decide to use variations to represent the machine used to perform an exercise (i.e. Bench Press with Smith machine, or dedicated machine)
1. Arbitrary tagging. I might want to add arbitray tags so that I can, in the future, use them in my analytics. 

## What have we built so far (please verify my understanding):
1. We model variations as a Variation Category and a set of values for that Variation Category

## Are we overthinking this?
Maybe we could do something much more simple. 

1. Allow the user to add arbitrary tags to exercises when logging them
2. Tags are persisted and associated to the specific exercise
3. Quick access to previous tags when logging the exercise
4. Option to break down by tags in analytics

## If we went with the above, what would be the experience?

### Choosing a tag
Once an exercise has been selected, in the session recorder scree, in the exercise card add a button to manage tags and show tags below the exercise name

Mock of modified card
```
[Exercise name] [Add Tag button] [Kebab button]
[List of tags]
[List of sets, multiple rows]
```

Tags are tiny colored labels with little X button to delete. 

Clicking on Add Tag Button opens the Add Tag Modal

Mock of Add Tag Modal
```
[Text input] [add button]
[List of tags]
```

The text input allows text to be entered. Text input filters the list of tags below (substring match). 

Pressing item in list of tags selects the tag and associates to exericise for the current log

Clicking add creates a new tag with the provided text. 

## Clarifications around the use cases
* There is no use case to group by variations across exercises
* There is a very limited amount of variations that would work across exercises. Off the top of my head only the implement one. Most other applications create separate exercises to distinguish things such as barbell and dumbbell bicep curls.

## Use cases with and without variations
Multiple machine of the same type at a location - this fits very well with the tagging

Grip type - this can be accomplished with tagging OR different exercises. Variations would be stronger if well implemented in terms of experience. 

Implement, Incline, Machine - can be accomplished with different exercise. I'm not sure there is a real exercise here. People don't really group exercises this way.

Arbitrary tagging - this is better implemented with the simplified tagging

## Sunk cost
The variations feature is still under development and not deployed. We could conceptually revert all the changes and the app should work fine.