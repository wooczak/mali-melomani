export function bringBackPolishChars(input: string): string {
  return input.replace(/Bebenek/g, "Bębenek").replace(/Trojkat/g, "Trójkąt");
}
