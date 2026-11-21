export const ERROR_MESSAGES = {
    DB: {
        UNEXPECTED: 'An unexpected database error occurred.',

        NOT_FOUND: (entity = 'Record') =>
            `${entity} not found in the database.`,

        FOREIGN_KEY_FAILED:
            'Operation failed because a referenced record does not exist.',
    },

    SLOT: {
        NOT_FOUND: 'The requested scheduling slot does not exist.',

        NOT_AVAILABLE:
            'This scheduling slot is no longer available for booking.',

        INVALID_DURATION:
            'Invalid slot duration: the scheduling slot must be at least 1 hour long.',

        TIME_CONFLICT:
            'The selected time range overlaps with an existing scheduling slot for this counselor.',
    },
} as const;
