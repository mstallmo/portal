export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function isEmpty(text: string): boolean {
  return text.length === 0;
}
