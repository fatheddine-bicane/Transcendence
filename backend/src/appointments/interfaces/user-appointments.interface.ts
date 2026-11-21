export class UserAppointment {
    constructor(
        public readonly id: number,
        public readonly startTime: Date,
        public readonly endTime: Date,
        public readonly couselorId: number,
        public readonly patientId: number,
    ) {}
}
