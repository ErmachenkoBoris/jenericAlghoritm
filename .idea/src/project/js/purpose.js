export function Purpose(name, color, purposeFunction) {
    this.name = name;
    this.color = color;
    this.purposeFunction = purposeFunction;
}

export function generatePurpose(name, color, purposeFunction) {
    return new Purpose(name, color, purposeFunction);
}
